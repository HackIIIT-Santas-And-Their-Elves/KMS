<!-- 
# Khana Management System (KMS)

## 1. Overview

Khana Management System (KMS) is a smart campus canteen platform that solves two major problems:

1. **Uncertain canteen availability** using a physical ON/OFF switch that reflects real-time open/close status.
2. **Long waiting times** using a smart pre-order system where students order in advance and pick up food only when it is ready.

The system ensures:
- Zero wasted trips
- Zero waiting in queues
- Only paid, verified orders reach canteens
- Only the rightful customer can pick up an order

---

## 2. Core Concepts

### 2.1 Physical Availability Switch

Each canteen has a physical IoT switch:

- ON → Canteen is OPEN
- OFF → Canteen is CLOSED

This status is reflected live in the system.

### 2.2 Online Order Acceptance Switch

Each canteen also has a software switch:

- Accepting Online Orders → Students can pre-order
- Online Orders Paused → Only walk-in customers allowed

### 2.3 Combined State Logic

| Physical Switch | Online Orders | Student View |
|-----------------|---------------|--------------|
| OFF | ANY | Closed |
| ON | ON | Open + Preorder Available |
| ON | OFF | Open (Walk-in Only) |

---

## 3. System Roles

- Student (Customer)
- Canteen Owner
- Admin (System Operator)

---

## 4. Order & Payment State Machine

### 4.1 Order States

```

CREATED (UNPAID)
→ PAID
→ ACCEPTED
→ PREPARING
→ READY
→ COMPLETED

FAILED / CANCELLED (terminal)

````

---

## 5. Payment Workflow (Paytm UPI)

1. Student creates order
2. Backend generates orderId and paymentId
3. Backend generates Paytm UPI payment intent / QR
4. Student completes payment
5. Paytm redirects / webhook notifies backend
6. Backend verifies signature and amount
7. If success:
   - Order becomes PAID
   - Order is visible to canteen
8. If failed:
   - Order is CANCELLED

Rules:
- Only PAID orders reach canteen
- No COD
- No unpaid order can be prepared

---

## 6. Secure Pickup Workflow

Each paid order gets:
- Unique Order ID
- Secure Pickup Code or QR Code

Pickup Flow:
1. Student shows QR / code at counter
2. Canteen scans or enters code
3. Backend verifies:
   - Order exists
   - Status = READY
   - Not already collected
4. Order marked COMPLETED

---

## 7. Bulk Order Workflow

### 7.1 Student Side

- Bulk order toggle
- Add many items
- Add per-item notes
- Marked as `isBulkOrder = true`

### 7.2 Canteen Side

- Bulk orders highlighted
- Can:
  - Accept
  - Reject
  - Delay
- Can set max bulk size or disable bulk orders

---

## 8. Student View Features

### 8.1 Discovery

- View all canteens
- Live open/closed status
- See:
  - Open + Preorder
  - Open (Walk-in only)
  - Closed

### 8.2 Menu & Cart

- Browse menu
- Add/remove items
- Increase/decrease quantity

### 8.3 Ordering & Payment

- Place order
- Pay via Paytm UPI
- See payment status

### 8.4 Order Tracking

- Live status updates:
  - PAID
  - ACCEPTED
  - PREPARING
  - READY

### 8.5 Pickup

- Show QR / pickup code

### 8.6 History

- Past orders
- Repeat order

---

## 9. Canteen Owner View Features

### 9.1 Availability Control

- Physical switch controls open/close
- Software switch controls online orders

### 9.2 Order Dashboard

- View:
  - New paid orders
  - Preparing orders
  - Ready orders

### 9.3 Order Processing

- Accept / Reject orders
- Mark:
  - Preparing
  - Ready
  - Completed

### 9.4 Pickup Verification

- Scan QR / enter code
- Complete order

### 9.5 Menu Management

- Add / edit / remove items
- Mark item out of stock

### 9.6 Bulk Order Controls

- Accept/reject bulk orders
- Set bulk order limits

---

## 10. Admin View Features

### 10.1 Canteen Management

- Add/remove canteens
- Map physical switches to canteens

### 10.2 User Management

- Manage students and canteen owners

### 10.3 Payment Monitoring

- View:
  - All transactions
  - Failed payments
  - Successful payments

### 10.4 System Monitoring

- See:
  - Live canteen status
  - Live switch status

### 10.5 Dispute Resolution

- Force cancel orders
- Trigger refunds (future)

---

## 11. End-to-End System Workflow

1. Canteen turns ON physical switch
2. System marks canteen OPEN
3. Student places order
4. Student pays via Paytm
5. Order becomes PAID
6. Canteen accepts order
7. Canteen prepares food
8. Canteen marks READY
9. Student picks up using QR
10. Order marked COMPLETED
11. Canteen turns OFF switch → system closes

---

## 12. Basic Data Models

```js
Order {
  id,
  userId,
  canteenId,
  items[],
  amount,
  isBulkOrder,
  status,
  pickupCode,
  paymentId
}

Payment {
  id,
  orderId,
  amount,
  status,
  provider: "PAYTM"
}
````

---

## 13. Future Enhancements

* Wallet
* Refund automation
* Ratings & reviews
* Smart prep-time prediction
* Order batching AI
* Analytics dashboard

---

## 14. Hackathon MVP Scope

* Live canteen status
* Student ordering
* Paytm UPI payment
* Canteen dashboard
* Order status tracking
* QR pickup

---

```

--- -->


# Khana Management System (KMS)
## Software Architecture & System Design (Hackathon Version)

---

# 1. System Goals

KMS is a campus canteen platform that provides:

- Canteen open/close status (software toggle for now)
- Online pre-ordering
- Paytm UPI payments
- Secure pickup using QR / codes
- Bulk ordering
- Canteen-side order management
- Admin supervision

Note:
- Physical switch integration is a **future extension**
- Currently, canteen manually toggles OPEN / CLOSED
- Later, the switch will simply call the same API

---

# 2. High-Level Architecture

```

[ Student Web App ]     [ Canteen Web App ]     [ Admin Web App ]
\                    |                     /
\                   |                    /
------------------ REST API ------------------/
|
[ Backend ]
|
[ Database ]

````

---

# 3. Tech Stack (Suggested)

- Frontend: React / Next.js
- Backend: Node.js + Express / NestJS
- Database: MongoDB / PostgreSQL
- Auth: JWT
- Payments: Paytm UPI
- QR: Any JS QR library

---

# 4. Frontend Architecture

## 4.1 Three Apps

- Student App
- Canteen Dashboard
- Admin Dashboard

(These can also be role-based views in a single app)

## 4.2 Shared Modules

- Auth
- API client
- QR generator / scanner
- Payment handler
- Order status tracker

---

# 5. Backend Architecture (Simple Monolith)

Single backend service with modules:

- Auth Module
- User Module
- Canteen Module
- Menu Module
- Order Module
- Payment Module
- Admin Module

---

# 6. Core Data Models

## 6.1 User

```ts
User {
  id
  name
  email
  role: STUDENT | CANTEEN | ADMIN
  canteenId?   // if role = CANTEEN
}
````

## 6.2 Canteen

```ts
Canteen {
  id
  name
  location
  isOpen              // software toggle (later from switch)
  isOnlineOrdersEnabled
  maxBulkSize
}
```

## 6.3 MenuItem

```ts
MenuItem {
  id
  canteenId
  name
  price
  isAvailable
}
```

## 6.4 Order

```ts
Order {
  id
  userId
  canteenId
  items[]
  amount
  isBulkOrder
  status
  pickupCode
  createdAt
}
```

## 6.5 Payment

```ts
Payment {
  id
  orderId
  provider: "PAYTM"
  amount
  status
  txnRef
}
```

---

# 7. State Machines

## 7.1 Order State Machine

```
CREATED (UNPAID)
 → PAID
 → ACCEPTED
 → PREPARING
 → READY
 → COMPLETED

FAILED / CANCELLED
```

---

# 8. Canteen Open/Close Logic

* Canteen owner has a toggle:

  * isOpen = true / false
* If isOpen = false:

  * Canteen is CLOSED
  * No new orders allowed
* If isOpen = true:

  * Canteen is OPEN
  * Online orders depend on isOnlineOrdersEnabled

Later:

* Physical switch will simply call:

  ```
  POST /canteens/{id}/set-open
  ```

  instead of the UI

---

# 9. Payment Architecture (Paytm UPI)

## Flow

1. Student creates order
2. Backend creates payment record
3. Backend generates Paytm UPI link / QR
4. Student pays
5. Paytm redirects / webhook hits backend
6. Backend verifies payment
7. If success:

   * Payment = SUCCESS
   * Order → PAID
8. If failed:

   * Order → CANCELLED

Rules:

* Only PAID orders visible to canteen
* No COD

---

# 10. Secure Pickup Architecture

* Each order generates:

  * pickupCode (random 6-digit or QR)
* Pickup flow:

  1. Student shows QR / code
  2. Canteen enters / scans it
  3. Backend verifies:

     * Order is READY
     * Code unused
  4. Order marked COMPLETED

---

# 11. Bulk Order Architecture

* Flag: isBulkOrder = true
* Backend enforces:

  * maxBulkSize from canteen config
* UI:

  * Bulk orders highlighted

---

# 12. API Design (Representative)

## Auth

* POST /auth/login

## Canteen

* GET /canteens
* POST /canteens/{id}/toggle-open
* POST /canteens/{id}/toggle-online-orders

## Menu

* GET /canteens/{id}/menu
* POST /menu
* PATCH /menu/{id}

## Orders

* POST /orders
* GET /orders/my
* GET /orders/canteen
* POST /orders/{id}/accept
* POST /orders/{id}/prepare
* POST /orders/{id}/ready
* POST /orders/{id}/complete

## Payments

* POST /payments/initiate
* POST /payments/webhook/paytm

---

# 13. Security

* JWT auth
* Role-based access control
* Payment verification via Paytm checksum
* Pickup code single-use

---

# 14. Deployment

* Single backend server
* Single DB
* Frontend hosted on Vercel / Netlify
* Backend on Render / Railway / EC2

---

# 15. Hackathon MVP Scope

* Student ordering app
* Canteen dashboard
* Open/close toggle
* Menu management
* Order flow
* Paytm UPI payment
* QR pickup

---

# 16. Future Extensions

* Physical switch integration (just call same API)
* Analytics
* Refunds
* Notifications
* Wallet

---