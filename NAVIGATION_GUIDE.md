# 🗺️ KMS Unified App - Complete Navigation Guide

## 📱 App Navigation Overview

### Authentication Flow
```
App Start
   ↓
[Check if logged in]
   ├─ YES → Role-based Navigation
   └─ NO → Auth Stack (Login/Register)
```

---

## 🔐 Auth Stack (Unauthenticated Users)

### Login Screen
- **Path:** `/src/screens/LoginScreen.js`
- **Features:**
  - ✅ Email & password input
  - ✅ Login button
  - ✅ "Don't have account?" link → Register
  - ✅ Auto-detects role from backend
  - ✅ Shows success message with role

**Navigation:**
- `Register` - Navigate to registration
- Auto → Role-based screen after login

---

### Register Screen
- **Path:** `/src/screens/RegisterScreen.js`
- **Features:**
  - ✅ Name, email, password fields
  - ✅ **Role Selection (Student/Canteen/Admin)** 📍
  - ✅ Password confirmation
  - ✅ Register button
  - ✅ Link back to Login

**Navigation:**
- Back to `Login` - Click "Already have account?"
- Auto → Role-based screen after register

---

## 🎓 Student Navigation Flow

### Entry Point: Student Tabs (Bottom Navigation)
- **Active Tabs:** Home | Orders | Profile

```
Student Tabs (Bottom Navigation)
├── Home Stack
│   ├── CanteenList (Main)
│   │   └── Menu
│   │       └── Cart
│   │           └── Payment
│   ├── OrderTracking
│   └── OrderDetails
│
├── Orders Stack
│   ├── OrderHistory (Main)
│   └── OrderDetails
│
└── Profile Stack
    └── Profile (with Logout)
```

### Home Stack Screens

#### 1. CanteenListScreen
- **Path:** `/src/screens/CanteenListScreen.js`
- **Features:**
  - ✅ List of all canteens
  - ✅ Refresh functionality
  - ✅ Search/filter

**Navigation:**
- Tap canteen → `MenuScreen`
- Tab: `Orders` → Order history
- Tab: `Profile` → Profile page

#### 2. MenuScreen
- **Path:** `/src/screens/MenuScreen.js`
- **Features:**
  - ✅ Menu items from selected canteen
  - ✅ Add items to cart
  - ✅ View item details
  - ✅ Quantity selection

**Navigation:**
- Back → `CanteenListScreen`
- "Go to Cart" → `CartScreen`

#### 3. CartScreen
- **Path:** `/src/screens/CartScreen.js`
- **Features:**
  - ✅ View cart items
  - ✅ Update quantities
  - ✅ Remove items
  - ✅ Total calculation
  - ✅ Place order button

**Navigation:**
- Back → Previous screen
- "Place Order" → `PaymentScreen`

#### 4. PaymentScreen
- **Path:** `/src/screens/PaymentScreen.js`
- **Features:**
  - ✅ Payment details
  - ✅ Order summary
  - ✅ Payment method selection
  - ✅ Confirm payment

**Navigation:**
- Back → `CartScreen`
- "Confirm Payment" → `OrderTrackingScreen`

#### 5. OrderTrackingScreen
- **Path:** `/src/screens/OrderTrackingScreen.js`
- **Features:**
  - ✅ Real-time order status
  - ✅ Estimated time
  - ✅ Map view (optional)
  - ✅ Order details

**Navigation:**
- Tap order → `OrderDetailsScreen`
- Back → Previous screen

#### 6. OrderDetailsScreen
- **Path:** `/src/screens/OrderDetailsScreen.js`
- **Features:**
  - ✅ Full order details
  - ✅ Items breakdown
  - ✅ Order status
  - ✅ Cancel option (if applicable)

**Navigation:**
- Back → Previous screen
- "Track" → `OrderTrackingScreen`

### Orders Stack Screens

#### 1. OrderHistoryScreen
- **Path:** `/src/screens/OrderHistoryScreen.js`
- **Features:**
  - ✅ List of past orders
  - ✅ Filter by status
  - ✅ Refresh functionality

**Navigation:**
- Tap order → `OrderDetailsScreen`
- Tab: `Home` → Home
- Tab: `Profile` → Profile

#### 2. OrderDetailsScreen (Same as above)
- Shows complete order information
- Can review order

### Profile Stack Screens

#### 1. ProfileScreen
- **Path:** `/src/screens/ProfileScreen.js`
- **Features:**
  - ✅ User information display
  - ✅ Avatar
  - ✅ Name & email
  - ✅ Role badge
  - ✅ Settings options
  - ✅ **Logout Button** ✅

**Navigation:**
- "Logout" → Confirmation → Back to Login
- Tab: `Home` → Home
- Tab: `Orders` → Orders

---

## 🍽️ Canteen Owner Navigation Flow

### Entry Point: Canteen Stack (Single Screen)

```
Canteen Stack
├── Dashboard (Main) ⭐ WITH LOGOUT BUTTON
│   ├── Manage Menu button
│   └── Accept/Process orders
│
├── MenuManagement
│   ├── Add items
│   ├── Edit items
│   └── Delete items
│
└── QRScanner
    └── Scan pickup codes
```

### Canteen Screens

#### 1. CanteenDashboardScreen ✨ UPDATED
- **Path:** `/src/screens/CanteenDashboardScreen.js`
- **Features:**
  - ✅ Canteen name display
  - ✅ **Logout button in header** 🎉 NEW
  - ✅ Owner email display
  - ✅ Toggle: "Canteen Open" switch
  - ✅ Toggle: "Online Orders" switch
  - ✅ "Manage Menu" button
  - ✅ Active orders list
  - ✅ Order action buttons (Accept/Prepare/Ready/Scan)
  - ✅ Real-time refresh (15 seconds)

**Navigation:**
- "Manage Menu" → `MenuManagementScreen`
- "Scan Pickup" → `QRScannerScreen`
- Logout button (top-right) → Confirmation → Login

#### 2. MenuManagementScreen
- **Path:** `/src/screens/MenuManagementScreen.js`
- **Features:**
  - ✅ List of menu items
  - ✅ Add new items
  - ✅ Edit existing items
  - ✅ Delete items
  - ✅ Enable/disable items

**Navigation:**
- Back → `CanteenDashboardScreen`
- Add item → Form screen
- Edit item → Form screen

#### 3. QRScannerScreen
- **Path:** `/src/screens/QRScannerScreen.js`
- **Features:**
  - ✅ Camera access for QR scanning
  - ✅ Scan pickup codes
  - ✅ Mark order as picked up

**Navigation:**
- Back → `CanteenDashboardScreen`

---

## 👔 Admin Navigation Flow

### Entry Point: Admin Stack (Single Screen)

```
Admin Stack
├── Dashboard (Main) ⭐ WITH LOGOUT BUTTON
│   ├── View statistics
│   └── Quick actions
│
├── CanteenManagement
│   ├── List all canteens
│   ├── Add canteen
│   ├── Edit canteen
│   └── Delete canteen
│
└── UserManagement
    ├── List all users
    ├── Add user
    ├── Edit user
    └── Delete user
```

### Admin Screens

#### 1. AdminDashboardScreen ✨ UPDATED
- **Path:** `/src/screens/AdminDashboardScreen.js`
- **Features:**
  - ✅ **Logout button in header** 🎉 NEW
  - ✅ Statistics cards:
    - Total canteens
    - Currently open
    - Online orders enabled
  - ✅ Quick action buttons
  - ✅ Refresh functionality

**Navigation:**
- "Manage Canteens" → `CanteenManagementScreen`
- "Manage Users" → `UserManagementScreen`
- Logout button (top-right) → Confirmation → Login

#### 2. CanteenManagementScreen
- **Path:** `/src/screens/CanteenManagementScreen.js`
- **Features:**
  - ✅ List all canteens
  - ✅ Add new canteen
  - ✅ Edit canteen details
  - ✅ Delete canteen
  - ✅ View canteen stats

**Navigation:**
- Back → `AdminDashboardScreen`
- Add/Edit → Form screen

#### 3. UserManagementScreen
- **Path:** `/src/screens/UserManagementScreen.js`
- **Features:**
  - ✅ List all users
  - ✅ Filter by role
  - ✅ Add new user
  - ✅ Edit user
  - ✅ Deactivate user

**Navigation:**
- Back → `AdminDashboardScreen`
- Add/Edit → Form screen

---

## 🔄 Navigation Function Reference

### Common Navigation Methods

```javascript
// Navigate to a screen
navigation.navigate('ScreenName')

// Navigate with parameters
navigation.navigate('ScreenName', { id: '123' })

// Go back to previous screen
navigation.goBack()

// Reset to home screen
navigation.popToTop()

// Push (add to stack)
navigation.push('ScreenName')

// Replace current screen
navigation.replace('ScreenName')
```

### Logout Flow (All Screens)
```javascript
import { useAuth } from '../context/AuthContext';

const { logout } = useAuth();

const handleLogout = () => {
    Alert.alert(
        'Logout',
        'Are you sure?',
        [
            { text: 'Cancel' },
            { text: 'Logout', onPress: logout }
        ]
    );
};
```

---

## 📊 Screen Navigation Summary

| Screen | Role | Has Logout | Navigation Options |
|--------|------|-----------|-------------------|
| LoginScreen | All | No | Register |
| RegisterScreen | All | No | Login |
| CanteenListScreen | Student | No | Menu, Orders, Profile tabs |
| MenuScreen | Student | No | Cart |
| CartScreen | Student | No | Payment |
| PaymentScreen | Student | No | OrderTracking |
| OrderTrackingScreen | Student | No | OrderDetails |
| OrderDetailsScreen | Student | No | Back |
| OrderHistoryScreen | Student | No | OrderDetails, Tabs |
| ProfileScreen | Student | ✅ YES | Logout |
| CanteenDashboardScreen | Canteen | ✅ YES | MenuManagement, QRScanner, Logout |
| MenuManagementScreen | Canteen | No | Back |
| QRScannerScreen | Canteen | No | Back |
| AdminDashboardScreen | Admin | ✅ YES | CanteenManagement, UserManagement, Logout |
| CanteenManagementScreen | Admin | No | Back |
| UserManagementScreen | Admin | No | Back |

---

## ✅ Logout Button Locations

### ✅ ADDED/UPDATED
1. **CanteenDashboardScreen** - Top-right corner (icon button)
2. **AdminDashboardScreen** - Top-right corner (icon button)
3. **ProfileScreen** - Full-width button (existing)

---

## 🎨 Header Design for Dashboards

### Canteen & Admin Dashboards
```
┌─────────────────────────────────────┐
│  Dashboard Title              [🚪]  │
│  Subtitle/Email                     │
├─────────────────────────────────────┤
│                                     │
│     Main Content Area              │
│                                     │
└─────────────────────────────────────┘
```

- **Left side:** Title & info
- **Right side:** Logout button (icon)
- **Icon:** `log-out-outline` from Ionicons
- **Color:** Red (error color)
- **Confirmation:** Alert popup before logout

---

## 🔐 Authentication Context Usage

```javascript
import { useAuth } from '../context/AuthContext';

const MyComponent = () => {
    const { 
        user,           // Current user object
        token,          // Auth token
        loading,        // Loading state
        login,          // Login function
        register,       // Register function
        logout,         // Logout function
        isAuthenticated,// Boolean
        userRole        // 'STUDENT', 'CANTEEN', 'ADMIN'
    } = useAuth();
};
```

---

## 🚀 Testing Navigation

### Test Student Flow
1. Login as Student
2. Verify bottom tabs visible
3. Browse canteens
4. Add items to cart
5. Complete order
6. Check order history
7. Verify logout works from Profile

### Test Canteen Flow
1. Login as Canteen
2. See dashboard with logout button
3. Verify toggles work
4. Go to menu management
5. Go to QR scanner
6. Click logout → Confirmation → Login

### Test Admin Flow
1. Login as Admin
2. See dashboard with logout button
3. See statistics
4. Navigate to canteen management
5. Navigate to user management
6. Click logout → Confirmation → Login

---

## 📝 Notes

- ✅ All dashboards have logout buttons
- ✅ Logout shows confirmation alert
- ✅ Proper navigation between screens
- ✅ Role-based access control
- ✅ Refresh functionality where needed
- ✅ Real-time updates (canteen orders)

---

## 🎉 Navigation Complete!

All screens have proper navigation and logout functionality is implemented across all user roles! 🚀
