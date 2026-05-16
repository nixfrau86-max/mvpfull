# The Collective Savers MVP Schematic

## Overview
Collective buying platform (no subscriptions).
- Suppliers create "Waves".
- Members join, pre-authorize card.
- Threshold reached -> charge all cards.
- Tech: Firebase, Stripe, SendGrid.

## Data Model (Firestore)
- users: uid, email, name, createdAt
- suppliers: supplierId, companyName, email, stripeConnectAccountId, performanceBondPaid, createdAt
- waves: waveId, supplierId, productName, description, basePrice, threshold, deadline, discountTiers, status, currentParticipants, finalPrice, createdAt
- waveMembers: id, userId, waveId, paymentIntentId, joinedAt, deliveryAddress
- orders: orderId, userId, waveId, supplierId, totalAmount, commission, status, trackingNumber, createdAt, shippedAt, deliveredAt

## Pages
- Public Landing
- Sign-up/Login
- Member Dashboard (Active Waves, Detail, Order History)
- Supplier Dashboard (Manage Waves, Orders)
- Admin Dashboard (Override)

## Workflows
- Member Joins Wave (PaymentIntent manual capture)
- Lock Wave (Capture PaymentIntents, Create Orders, Notifications)
- Wave Failure (Cancel intents, notify)
- Supplier Shipping (Update status, notify)

## Tech Stack
- Firebase Project ID/Number: 63446592652
- Firebase (Auth, Firestore, Cloud Functions)
- Stripe (PaymentIntents)
- SendGrid
