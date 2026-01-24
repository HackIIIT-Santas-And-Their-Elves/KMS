# 🚀 Quick Start Guide - KMS Unified App

## Prerequisites
- Node.js installed
- Expo CLI installed (`npm install -g expo-cli`)
- Expo Go app on your phone (for testing)
- Backend server running

## Setup Steps

### 1. Navigate to Unified App
```bash
cd KMS/UnifiedApp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Backend URL
Edit `src/config/api.js`:
```javascript
export const API_BASE_URL = 'http://YOUR_IP_ADDRESS:3000/api';
```

Replace `YOUR_IP_ADDRESS` with:
- Your computer's local IP (e.g., 192.168.1.100)
- Or `localhost` if using emulator

### 4. Start the App
```bash
npm start
```

### 5. Open on Device
- Scan the QR code with Expo Go (Android)
- Or scan with Camera app (iOS)

---

## Testing Different Roles

### Test as Student 🎓
1. Open app → "Don't have an account? Sign Up"
2. Fill in details
3. Select **"Student"** role
4. Sign Up
5. ✅ You'll see: Canteens list with bottom tabs

**What to test:**
- Browse canteens
- View menu items
- Add items to cart
- Place an order
- Track order status
- View order history

---

### Test as Canteen Owner 🍔
1. Logout from student account
2. Register new account
3. Select **"Canteen Owner"** role
4. Sign Up
5. ✅ You'll see: Canteen Dashboard

**What to test:**
- View dashboard statistics
- Manage menu items (add/edit/delete)
- Scan QR codes for order pickup
- View incoming orders

---

### Test as Admin 👔
1. Logout from canteen account
2. Register new account
3. Select **"Admin"** role
4. Sign Up
5. ✅ You'll see: Admin Dashboard

**What to test:**
- View system overview
- Manage canteens
- Manage users
- System administration

---

## Troubleshooting

### Issue: "Network request failed"
**Solution:** 
- Check backend is running (`npm start` in backend folder)
- Verify API URL in `src/config/api.js`
- Ensure phone and computer on same WiFi

### Issue: "Cannot find module"
**Solution:**
```bash
rm -rf node_modules
npm install
```

### Issue: App doesn't navigate after login
**Solution:**
- Check backend returns `role` field in response
- Valid roles: `STUDENT`, `CANTEEN`, `ADMIN` (uppercase)

### Issue: Registration fails
**Solution:**
- Password must be at least 6 characters
- Email must be unique
- All fields are required

---

## Quick Commands

```bash
# Start app
npm start

# Start on Android emulator
npm run android

# Start on iOS simulator  
npm run ios

# Clear cache and restart
expo start -c

# View logs
# Already shown in terminal when you run npm start
```

---

## File Locations (for debugging)

```
UnifiedApp/
├── App.js                    # Main entry point
├── src/
│   ├── navigation/
│   │   └── AppNavigator.js   # Role-based routing logic
│   ├── context/
│   │   └── AuthContext.js    # Login/register/logout functions
│   ├── screens/
│   │   ├── LoginScreen.js    # Universal login
│   │   └── RegisterScreen.js # Registration with role selection
│   └── config/
│       └── api.js            # ⚠️ CONFIGURE THIS FIRST
```

---

## Expected Behavior

### Login Flow:
```
1. Enter email & password
2. Press "Login"
3. Backend validates & returns user data with role
4. App automatically navigates based on role:
   - STUDENT → Bottom tabs (Home, Orders, Profile)
   - CANTEEN → Canteen dashboard
   - ADMIN → Admin dashboard
```

### Registration Flow:
```
1. Click "Don't have an account? Sign Up"
2. Fill in name, email, password
3. Select role: Student / Canteen Owner / Admin
4. Press "Sign Up"
5. Account created & automatically logged in
6. Navigate to role-specific interface
```

---

## Success Indicators ✅

You'll know it's working when:
- ✅ Login shows welcome message with detected role
- ✅ Students see bottom navigation tabs
- ✅ Canteen owners see dashboard with menu management
- ✅ Admins see system management screens
- ✅ Logout returns to login screen
- ✅ Different accounts show different interfaces

---

## Need Help?

1. Check the main README: `UnifiedApp/README.md`
2. Review migration guide: `UNIFIED_APP_MIGRATION.md`
3. Compare with original apps if needed
4. Check backend logs for API errors

---

## 🎉 You're Ready!

The unified app is now set up and ready to use. Test all three roles to see how the role-based navigation works seamlessly!
