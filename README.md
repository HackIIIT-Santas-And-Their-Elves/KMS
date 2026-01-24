# KMS - Khana Management System

Complete food ordering system for campus canteens with React Native mobile apps and Node.js backend.

## 🎯 Features

### Student App
- Browse canteens and view open/close status
- Browse menu items with veg/non-veg indicators
- Add items to cart and place orders
- Mock Paytm UPI payment integration
- Real-time order tracking
- QR code for secure pickup
- Order history

### Canteen App
- Dashboard with canteen open/close toggle
- Online orders enable/disable
- Menu management (Add, Edit, Delete, Toggle Availability)
- View and manage incoming orders
- Update order status (Accept → Preparing → Ready)
- QR scanner for order pickup verification

### Admin App
- System overview dashboard
- Canteen management
- User management

## 🏗️ Architecture

- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React Native with Expo
- **Authentication**: JWT with role-based access control
- **Payment**: Mock Paytm UPI (production-ready structure)
- **QR Codes**: For secure order pickup

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Expo CLI
- Expo Go app on your mobile device

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend
npm install

# Create .env file (copy from .env.example)
# Update MONGODB_URI if needed

# Start MongoDB (if running locally)
# mongod

# Start backend server
npm run dev
```

The backend will run on `http://localhost:5000`

### 2. Student App Setup

```bash
cd StudentApp
npm install

# Update API URL in src/config/api.js if needed
# For physical device, use your computer's IP address

npx expo start
```

Scan the QR code with Expo Go app to run on your device.

### 3. Canteen App Setup

```bash
cd CanteenApp
npm install
npx expo start
```

### 4. Admin App Setup

```bash
cd AdminApp
npm install
npx expo start
```

## 📱 Testing the System

### Create Test Users

Use a tool like Postman or Thunder Client to create test users:

**Student User:**
```json
POST http://localhost:5000/api/auth/register
{
  "name": "Test Student",
  "email": "student@test.com",
  "password": "password123",
  "role": "STUDENT"
}
```

**Canteen User:**
```json
POST http://localhost:5000/api/auth/register
{
  "name": "Canteen Staff",
  "email": "canteen@test.com",
  "password": "password123",
  "role": "CANTEEN",
  "canteenId": "<canteen_id_here>"
}
```

**Admin User:**
```json
POST http://localhost:5000/api/auth/register
{
  "name": "Admin",
  "email": "admin@test.com",
  "password": "password123",
  "role": "ADMIN"
}
```

### Create a Canteen (Admin only)

```json
POST http://localhost:5000/api/auth/login
{
  "email": "admin@test.com",
  "password": "password123"
}

# Use the token from login response
POST http://localhost:5000/api/canteens
Authorization: Bearer <token>
{
  "name": "Main Canteen",
  "location": "Ground Floor, Building A",
  "description": "Main campus canteen",
  "maxBulkSize": 50
}
```

### Complete Order Flow

1. **Student App**: Login → Browse canteens → View menu → Add to cart → Checkout → Pay (mock)
2. **Canteen App**: Login → Toggle canteen open → View incoming order → Accept → Prepare → Mark Ready
3. **Student App**: View order status → See QR code when ready
4. **Canteen App**: Scan QR code → Complete order

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Canteens
- `GET /api/canteens` - List all canteens
- `POST /api/canteens` - Create canteen (Admin)
- `POST /api/canteens/:id/toggle-open` - Toggle open/close
- `POST /api/canteens/:id/toggle-online-orders` - Toggle online orders

### Menu
- `GET /api/menu/canteen/:canteenId` - Get menu for canteen
- `POST /api/menu` - Create menu item (Canteen/Admin)
- `PUT /api/menu/:id` - Update menu item
- `PATCH /api/menu/:id/toggle-availability` - Toggle availability
- `DELETE /api/menu/:id` - Delete menu item

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my` - Get user's orders
- `GET /api/orders/canteen/:canteenId` - Get canteen orders
- `POST /api/orders/:id/accept` - Accept order
- `POST /api/orders/:id/prepare` - Mark as preparing
- `POST /api/orders/:id/ready` - Mark as ready
- `POST /api/orders/:id/complete` - Complete with pickup code

### Payments
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/:id/confirm` - Confirm payment (mock)

## 📂 Project Structure

```
Heck/
├── backend/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── StudentApp/
│   ├── src/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── context/
│   │   ├── services/
│   │   └── constants/
│   └── App.js
├── CanteenApp/
│   └── (similar structure)
└── AdminApp/
    └── (similar structure)
```

## 🔧 Configuration

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kms
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

### Frontend (src/config/api.js)
```javascript
export const API_BASE_URL = 'http://localhost:5000/api';
// For physical device: 'http://192.168.1.x:5000/api'
```

## 🐛 Troubleshooting

### Backend won't start
- Ensure MongoDB is running
- Check if port 5000 is available
- Verify .env file exists with correct values

### Can't connect from mobile app
- Use your computer's IP address instead of localhost
- Ensure both devices are on the same network
- Check firewall settings

### QR Scanner not working
- Grant camera permissions in device settings
- Ensure you're using a physical device (camera doesn't work in simulator)

## 🚀 Future Enhancements

- Real Paytm UPI integration
- Push notifications
- Analytics dashboard
- Order refunds
- User ratings and reviews
- Multiple payment methods
- Physical switch integration for canteen open/close

## 📄 License

MIT

## 👥 Contributors

Built for HackIIIT 2026
