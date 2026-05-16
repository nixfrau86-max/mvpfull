# Detailed MVP Logic Requirements

## 1. Lock Wave Logic
- Trigger: `currentParticipants >= threshold` AND `now < deadline`.
- Step 1: Set status to `locking`.
- Step 2: Calculate `finalPrice` (lowest discount tier reached or `basePrice`).
- Step 3: Capture Stripe PaymentIntents for all members.
- Step 4: Create Order records (`status='paid'`, `totalAmount`, `commission`).
- Step 5: If any failure, abort, refund/cancel all, set status to `failed`, notify members.
- Step 6: If success, set status to `locked`.
- Step 7: Trigger `notifySupplierOfLock` and `requestMemberAddresses`.
- Step 8: Send confirmation email to members.

## 2. Notify Supplier Workflow
- Runs after Wave is `locked`.
- Group paid orders by supplier.
- Send email via SendGrid with order summary table and dashboard link.
- Remind supplier to mark as shipped.

## 3. Member Delivery Addresses
- **Email Link:** Send email to members with a unique/magic link to a secure address form.
- **Form Submission:** Update Order with `deliveryAddress` and `addressProvided = true`.
- **Supplier Notification:** (Optional) Notify supplier when all addresses are in.

## 4. In-App Address Collection (MVP Simpler Alternative)
- Show "Delivery address" form immediately on success page/dashboard.
- Save to Order document.

## 5. Supplier Dashboard - Fulfillment
- List Waves with status `locked`.
- View orders: Member name, address, quantity, product.
- "Mark as shipped" button -> Input tracking number -> Update status to `shipped` -> Notify member.

## 6. Failure Handling
- Trigger: Deadline passes without threshold OR capture process fails.
- Set status to `failed`.
- Cancel all Stripe PaymentIntents.
- Notify members (Explain target not reached, no charge).

## 7. Email Templates (SendGrid)
- Wave locked (Member)
- Wave locked (Supplier)
- Wave failed (Member)
- Order shipped (Member)
- Address confirmation (Member)

## 8. Admin Override
- Force Lock: Trigger `lockWave` manually.
- Force Fail: Trigger `failWave` manually.
- Log action with admin email and timestamp.

## 9. Scheduled Jobs
- Every 5 mins: Check active Waves past deadline -> `failWave`.
- Check Waves stuck in `locking` > 10 mins -> `failed`, notify admin.
