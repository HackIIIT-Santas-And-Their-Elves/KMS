
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
