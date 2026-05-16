const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "sk_test_mock");
const sgMail = require("@sendgrid/mail");

admin.initializeApp();

if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const COMMISSION_RATE = 0.10; // 10% platform commission

/**
 * Helper: Calculate final price based on participants and discount tiers
 */
function calculateFinalPrice(waveData, participantsCount) {
    let price = waveData.basePrice;
    if (waveData.discountTiers && Array.isArray(waveData.discountTiers)) {
        const sortedTiers = [...waveData.discountTiers].sort((a, b) => b.participants - a.participants);
        for (const tier of sortedTiers) {
            if (participantsCount >= tier.participants) {
                price = tier.price;
                break;
            }
        }
    }
    return price;
}

/**
 * Core Logic: Lock a Wave
 * Implements the multi-step process from REQUIREMENTS_DETAILED.md
 */
async function processLockWave(waveId) {
    const waveRef = admin.firestore().collection("waves").doc(waveId);
    
    // Step 1: Set status to 'locking' to prevent duplicate triggers
    const waveDoc = await waveRef.get();
    if (!waveDoc.exists) throw new Error("Wave not found");
    const waveData = waveDoc.data();
    if (waveData.status !== "active") throw new Error(`Wave cannot be locked (current status: ${waveData.status})`);

    await waveRef.update({ status: "locking" });
    logger.info(`Wave ${waveId} entering locking state.`);

    try {
        const membersSnapshot = await admin.firestore().collection("waveMembers")
            .where("waveId", "==", waveId).get();
        
        const participantsCount = membersSnapshot.size;
        const finalPrice = calculateFinalPrice(waveData, participantsCount);
        const capturedIntents = [];

        // Step 2 & 3: Capture all payments
        for (const memberDoc of membersSnapshot.docs) {
            const member = memberDoc.data();
            try {
                const capture = await stripe.paymentIntents.capture(member.paymentIntentId, {
                    amount_to_capture: Math.round(finalPrice * 100)
                });
                capturedIntents.push({ userId: member.userId, intentId: member.paymentIntentId });
            } catch (err) {
                // Step 5: If any failure, abort and trigger failure workflow
                logger.error(`Capture failed for user ${member.userId}. Aborting wave.`, err);
                await handleWaveFailure(waveId, "Payment capture failed");
                throw new Error("Payment capture failed, wave marked as failed.");
            }
        }

        // Step 4: Create Order records
        const batch = admin.firestore().batch();
        for (const capture of capturedIntents) {
            const orderRef = admin.firestore().collection("orders").doc();
            batch.set(orderRef, {
                orderId: orderRef.id,
                userId: capture.userId,
                waveId,
                supplierId: waveData.supplierId,
                totalAmount: finalPrice,
                commission: finalPrice * COMMISSION_RATE,
                status: "paid",
                addressProvided: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        
        // Step 6: Set status to 'locked'
        batch.update(waveRef, { 
            status: "locked",
            finalPrice: finalPrice,
            lockedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        await batch.commit();

        // Step 7 & 8: Notifications
        await notifySuccess(waveId, waveData, capturedIntents, finalPrice);

        return { finalPrice };
    } catch (error) {
        logger.error(`Error in processLockWave for ${waveId}:`, error);
        throw error;
    }
}

/**
 * Failure Workflow: Cancel all intents and set status to failed
 */
async function handleWaveFailure(waveId, reason) {
    const waveRef = admin.firestore().collection("waves").doc(waveId);
    await waveRef.update({ status: "failed", failureReason: reason });

    const membersSnapshot = await admin.firestore().collection("waveMembers")
        .where("waveId", "==", waveId).get();

    for (const memberDoc of membersSnapshot.docs) {
        const member = memberDoc.data();
        try {
            // Cancel the authorization (only works if not captured)
            await stripe.paymentIntents.cancel(member.paymentIntentId);
        } catch (err) {
            logger.error(`Failed to cancel intent ${member.paymentIntentId}:`, err);
        }
        
        // Notify member of failure
        if (process.env.SENDGRID_API_KEY) {
            const userDoc = await admin.firestore().collection("users").doc(member.userId).get();
            if (userDoc.exists) {
                await sgMail.send({
                    to: userDoc.data().email,
                    from: "waves@collectivesavers.com",
                    subject: "Wave Update: Target Not Reached",
                    text: `Unfortunately, the wave for ${waveId} did not reach its target or failed during processing. No charges were made to your card.`
                }).catch(e => logger.error("Email failed", e));
            }
        }
    }
    logger.info(`Wave ${waveId} failure workflow complete.`);
}

/**
 * Success Notifications
 */
async function notifySuccess(waveId, waveData, members, finalPrice) {
    if (!process.env.SENDGRID_API_KEY) return;

    // Notify Supplier
    const supplierDoc = await admin.firestore().collection("suppliers").doc(waveData.supplierId).get();
    if (supplierDoc.exists) {
        await sgMail.send({
            to: supplierDoc.data().email,
            from: "waves@collectivesavers.com",
            subject: "Wave Succeeded! Action Required",
            text: `Your wave for ${waveData.productName} has succeeded with ${members.length} participants. Final Price: £${finalPrice}. Please log in to your dashboard to fulfill orders.`
        }).catch(e => logger.error("Supplier email failed", e));
    }

    // Notify Members
    for (const member of members) {
        const userDoc = await admin.firestore().collection("users").doc(member.userId).get();
        if (userDoc.exists) {
            await sgMail.send({
                to: userDoc.data().email,
                from: "waves@collectivesavers.com",
                subject: "Great news! Your Wave has succeeded",
                text: `The wave for ${waveData.productName} is successful. We've captured your payment of £${finalPrice}. Please provide your delivery address in the dashboard.`
            }).catch(e => logger.error("Member email failed", e));
        }
    }
}

/**
 * Cloud Functions
 */

exports.joinWave = onRequest(async (req, res) => {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
    const { waveId, userId } = req.body;
    if (!waveId || !userId) return res.status(400).send("Missing fields");

    try {
        const waveRef = admin.firestore().collection("waves").doc(waveId);
        const result = await admin.firestore().runTransaction(async (transaction) => {
            const waveDoc = await transaction.get(waveRef);
            if (!waveDoc.exists) throw new Error("Wave not found");
            const waveData = waveDoc.data();
            if (waveData.status !== "active") throw new Error("Wave not active");

            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(waveData.basePrice * 100),
                currency: "gbp",
                capture_method: "manual",
                metadata: { waveId, userId }
            });

            const waveMemberRef = admin.firestore().collection("waveMembers").doc();
            transaction.set(waveMemberRef, {
                id: waveMemberRef.id,
                userId,
                waveId,
                paymentIntentId: paymentIntent.id,
                joinedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            const newCount = (waveData.currentParticipants || 0) + 1;
            transaction.update(waveRef, { currentParticipants: newCount });
            return { paymentIntentId: paymentIntent.id };
        });
        res.status(200).json({ paymentIntentId: result.paymentIntentId });
    } catch (error) {
        logger.error("joinWave error:", error);
        res.status(500).json({ error: error.message });
    }
});

exports.lockWave = onRequest(async (req, res) => {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
    const { waveId } = req.body;
    if (!waveId) return res.status(400).send("Missing waveId");
    try {
        const result = await processLockWave(waveId);
        res.status(200).json({ message: "Wave locked successfully", finalPrice: result.finalPrice });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

exports.cronWaveFailure = onSchedule("every 5 minutes", async (event) => {
    const now = admin.firestore.Timestamp.now();
    
    // 1. Fail expired waves
    const expiredWaves = await admin.firestore().collection("waves")
        .where("status", "==", "active")
        .where("deadline", "<", now)
        .get();
    for (const doc of expiredWaves.docs) {
        await handleWaveFailure(doc.id, "Deadline passed without threshold");
    }

    // 2. Cleanup waves stuck in 'locking'
    const tenMinsAgo = admin.firestore.Timestamp.fromMillis(now.toMillis() - 10 * 60 * 1000);
    const stuckWaves = await admin.firestore().collection("waves")
        .where("status", "==", "locking")
        .where("updatedAt", "<", tenMinsAgo) // Assuming we have an updatedAt field
        .get();
    for (const doc of stuckWaves.docs) {
        await handleWaveFailure(doc.id, "Stuck in locking state");
        // Also notify admin in production
    }
});

exports.markOrderShipped = onRequest(async (req, res) => {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
    const { orderId, trackingNumber } = req.body;
    if (!orderId || !trackingNumber) return res.status(400).send("Missing fields");

    try {
        const orderRef = admin.firestore().collection("orders").doc(orderId);
        const orderDoc = await orderRef.get();
        if (!orderDoc.exists) return res.status(404).send("Order not found");

        await orderRef.update({
            status: "shipped",
            trackingNumber,
            shippedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        const userDoc = await admin.firestore().collection("users").doc(orderDoc.data().userId).get();
        if (userDoc.exists && process.env.SENDGRID_API_KEY) {
            await sgMail.send({
                to: userDoc.data().email,
                from: "orders@collectivesavers.com",
                subject: "Your order has shipped!",
                text: `Tracking number: ${trackingNumber}`
            }).catch(e => logger.error("Shipping email failed", e));
        }
        res.status(200).json({ message: "Order shipped" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Admin Overrides
 */
exports.adminForceFail = onRequest(async (req, res) => {
    // Auth check should be here in production
    const { waveId, reason } = req.body;
    await handleWaveFailure(waveId, reason || "Admin override");
    res.status(200).send("Wave failed");
});

/**
 * Firestore Trigger
 */
exports.onWaveThresholdReached = onDocumentUpdated("waves/{waveId}", async (event) => {
    const newValue = event.data.after.data();
    const oldValue = event.data.before.data();
    if (newValue.status === "active" && 
        newValue.currentParticipants >= newValue.threshold && 
        oldValue.currentParticipants < newValue.threshold) {
        try {
            await processLockWave(event.params.waveId);
        } catch (err) {
            logger.error(`Auto-lock failed for ${event.params.waveId}:`, err);
        }
    }
});
