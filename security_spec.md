# Security Specification & Threat Model

This document outlines the security architecture and validation constraints for the Nangsal Firestore database.

## Data Invariants
1. **User Identity Isolation**: A user's profile (/users/{userId}) can only be written to and read by the authenticated user with a matching UID.
2. **Sub-resource Sovereignty**: Cart items (/users/{userId}/cart/{cartId}) are private sandboxes. Only the corresponding `{userId}` has access.
3. **Write-Once Orders**: Placed orders (/orders/{orderId}) are immutable audit logs. Once submitted, they can never be modified or deleted.
4. **Order Ownership**: If an order specifies a `userId`, it must match the submitting caller's authenticated UID to prevent identity spoofing.

---

## The "Dirty Dozen" Threat Payloads

### 1. Identity Spoofing (Write Profile for Another User)
* **Target**: `/users/attacker_uid`
* **Payload**: Attempting to create or update `users/victim_uid` where `request.auth.uid == 'attacker_uid'`.
* **Result**: `PERMISSION_DENIED`

### 2. Malicious User Profile Update (Modify Someone Else's Info)
* **Target**: `/users/victim_uid`
* **Payload**: `{"name": "Hacker", "phone": "999"}` sent by user with UID `attacker_uid`.
* **Result**: `PERMISSION_DENIED`

### 3. Denial of Wallet / Resource Poisoning (Giant Name)
* **Target**: `/users/attacker_uid`
* **Payload**: `{"uid": "attacker_uid", "name": "A" * 10000}` (exceeding maximum size boundaries).
* **Result**: `PERMISSION_DENIED`

### 4. Shadow Path Injection (Junk ID Characters)
* **Target**: `/users/attacker$$%20`
* **Payload**: Any valid payload attempting to create a profile under a bloated, non-standard key.
* **Result**: `PERMISSION_DENIED`

### 5. Hijacked Cart Item Access (Create in Other's Cart)
* **Target**: `/users/victim_uid/cart/item_123`
* **Payload**: `{"productId": "relaxed-fit-tee", "selectedSize": "M", "quantity": 1}` sent by `attacker_uid`.
* **Result**: `PERMISSION_DENIED`

### 6. Cart Item Quantity Poisoning (Negative Qty)
* **Target**: `/users/attacker_uid/cart/item_123`
* **Payload**: `{"productId": "relaxed-fit-tee", "selectedSize": "M", "quantity": -5}`
* **Result**: `PERMISSION_DENIED`

### 7. Cart Item Over-sizing (Extreme Qty)
* **Target**: `/users/attacker_uid/cart/item_123`
* **Payload**: `{"productId": "relaxed-fit-tee", "selectedSize": "M", "quantity": 9999}`
* **Result**: `PERMISSION_DENIED`

### 8. Order Identity Stealing (Submit under Victim's UID)
* **Target**: `/orders/order_xyz`
* **Payload**: `{"userId": "victim_uid", "name": "Buyer", "phone": "9844226095", "address": "KTM", "totalAmount": 1450, "items": [], "createdAt": "request.time"}`
* **Result**: `PERMISSION_DENIED`

### 9. Order Tampering (Post-submission Update)
* **Target**: `/orders/order_xyz`
* **Payload**: `{"totalAmount": 0}` sent to modify an existing order.
* **Result**: `PERMISSION_DENIED`

### 10. Order Erasure (Delete order history)
* **Target**: `/orders/order_xyz`
* **Action**: Delete request on an existing order.
* **Result**: `PERMISSION_DENIED`

### 11. Read Sweep Attack (Listing all Orders globally)
* **Target**: `/orders`
* **Query**: `getDocs(collection(db, "orders"))` by any standard customer.
* **Result**: `PERMISSION_DENIED` (List operations are strictly locked down to filter by user's own `userId` or forbidden globally).

### 12. Spoofed Server Timestamps (Client provides backdated orders)
* **Target**: `/orders/order_xyz`
* **Payload**: `{"createdAt": "2020-01-01T00:00:00Z"}` instead of server timestamp constraint.
* **Result**: `PERMISSION_DENIED`

---

## Hardened Security Rules Draft (`DRAFT_firestore.rules`)

We enforce security with Zero-Trust principles using rigorous helper validations.
