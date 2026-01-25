# Backend — KMS

This folder contains the Node/Express backend service for the KMS (Khana Management System) project. This API powers the mobile app for food pre-ordering.

Quick links
- Server entry: [server.js](server.js)
- DB config: [config/db.js](config/db.js)

Folder layout
- `config/` — database and environment configuration.
- `middleware/` — Express middleware (auth).
- `models/` — Mongoose models for `User`, `Canteen`, `MenuItem`, `Order`, `Payment`.
- `routes/` — Express route handlers grouped by resource (auth, canteens, menu, orders, payments).
- `utils/` — helper utilities (`logger.js`, `notifications.js`).

## API Endpoints

| Base Route       | Description                            |
|------------------|----------------------------------------|
| `/api/auth`      | User authentication (register, login)  |
| `/api/canteens`  | Canteen management and status          |
| `/api/menu`      | Menu item management                   |
| `/api/orders`    | Order lifecycle management             |
| `/api/payments`  | Payment processing                     |

## How to run

1. Install dependencies

```powershell
cd backend
npm install
```

2. Configure environment

Create a `.env` in `backend/` or copy from `.env.example`:

```
PORT=5000
MONGODB_URI=mongodb+srv://your_connection_string
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d

# Paytm Configuration (for production)
PAYTM_MERCHANT_ID=your_merchant_id
PAYTM_MERCHANT_KEY=your_merchant_key
PAYTM_WEBSITE=WEBSTAGING
PAYTM_CHANNEL_ID=WEB
PAYTM_INDUSTRY_TYPE=Retail
```

3. Start the server

```powershell
node server.js
# or use nodemon for development
npx nodemon server.js
```

4. Health check

- Visit `http://localhost:5000/health` — returns health status
- Visit `http://localhost:5000/` — returns API info and available endpoints

## Notes on development

- Add new routes under `routes/` and register them in `server.js`.
- Models are defined in `models/` as Mongoose schemas — use consistent naming and include validation.
- Authentication middleware is in `middleware/auth.js` and uses JWT.
- Request logging is built into `server.js` — all requests and responses are logged to console.

## Testing

- Test files such as `test-auth.js` can be run with `node test-auth.js`.

## Useful files

- [config/db.js](config/db.js) — MongoDB connection logic
- [middleware/auth.js](middleware/auth.js) — JWT authentication middleware
- [routes/auth.js](routes/auth.js) — auth endpoints (register, login, profile)
- [routes/canteens.js](routes/canteens.js) — canteen CRUD and status
- [routes/orders.js](routes/orders.js) — order workflow (create, update, pickup codes)
- [routes/payments.js](routes/payments.js) — payment initiation and verification
- [utils/notifications.js](utils/notifications.js) — notification helpers
