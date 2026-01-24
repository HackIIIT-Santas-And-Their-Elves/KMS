# ✅ SIGNUP FIX - ACTION CHECKLIST

## 🚨 CRITICAL: Do This First!

### Step 1: Get Your Machine IP Address
```bash
# Linux/Mac - Copy the inet address (not 127.0.0.1)
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

**Example output:** `inet 192.168.1.100` → Use `192.168.1.100`

### Step 2: Update API URL
**File:** `UnifiedApp/src/config/api.js`

**Current (Wrong):**
```javascript
export const API_BASE_URL = 'http://10.2.142.214:5000/api';
```

**Change to (Your IP):**
```javascript
export const API_BASE_URL = 'http://192.168.1.100:5000/api';
// Replace 192.168.1.100 with your actual IP!
```

**Or use localhost (if testing on same machine):**
```javascript
export const API_BASE_URL = 'http://localhost:5000/api';
```

---

## ✅ Verify Backend is Running

**Open a terminal:**
```bash
cd /home/shreyashchitkula/Desktop/HackIIIT/KMS/backend
npm start
```

**Should see:**
```
🚀 KMS Backend Server running on port 5000
📍 API URL: http://localhost:5000
MongoDB Connected: ac-kexowb0-shard-00-00.0micdzj.mongodb.net
```

✅ Keep this terminal open while testing!

---

## ✅ Test Signup Flow

### Quick Test with cURL (Terminal)
```bash
# Test Student (should work)
curl -X POST http://YOUR_IP:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test Student",
    "email":"student'$(date +%s)'@test.com",
    "password":"password123",
    "role":"STUDENT"
  }' | python3 -m json.tool

# Test Canteen (should create canteen!)
curl -X POST http://YOUR_IP:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test Canteen Owner",
    "email":"canteen'$(date +%s)'@test.com",
    "password":"password123",
    "role":"CANTEEN",
    "canteenName":"Test Canteen '$(date +%s)'",
    "canteenLocation":"Building A"
  }' | python3 -m json.tool
```

### Full UI Test (Expo/Frontend)
1. Open Expo app
2. Open browser console/debugger
3. Go to Register screen
4. **Select "Canteen Owner"** - Canteen fields should appear ✅
5. Fill all fields:
   - Full Name: Test Owner
   - Email: test@example.com (use unique)
   - Canteen Name: My Test Canteen
   - Location: Building A
   - Password: password123
   - Confirm: password123
6. Click "Sign Up"
7. **Watch console for logs:**
   - Should see: `🔐 Attempting registration...`
   - Should see: `🌐 API Request: POST /auth/register`
   - Should see: `✅ API Response: status 201`
   - Should see: `✅ Registration successful!`
8. App should auto-login and show Canteen Dashboard ✅

---

## 📊 Expected Results

### Successful Canteen Signup:
```
Frontend Console:
✅ 🔐 Attempting registration with data: {...}
✅ 🌐 API Request: {method: "POST", url: "/auth/register", data: {...}}
✅ ✅ API Response: {status: 201, url: "/auth/register", data: {...}}
✅ ✅ Registration successful! User: test@example.com

Backend Console:
✅ 📝 Register request: {name: "...", email: "...", role: "CANTEEN", ...}
✅ 🍽️ Creating canteen for CANTEEN user
✅ ✅ Canteen created: 507f1f77bcf86cd799439011
✅ ✅ User registered successfully: 507f1f77bcf86cd799439012 Role: CANTEEN
```

---

## ❌ If It Still Fails

### Check These in Order:

#### 1. API Connection
```bash
# Can you reach the backend?
curl http://YOUR_IP:5000/health
# Should return: OK (or similar)
# If fails: Backend not running or wrong IP
```

#### 2. Frontend Logs
- Open debugger/console
- Look for error message after clicking signup
- Copy exact error message

#### 3. Backend Logs
- Check terminal where `npm start` is running
- Look for errors in that terminal
- Copy exact error message

#### 4. API URL
- Make sure you updated `src/config/api.js`
- Make sure IP is correct (not 10.2.142.214)
- Restart Expo app to reload config

---

## 📋 Verification Checklist

- [ ] Got machine IP address
- [ ] Updated `src/config/api.js` with correct IP
- [ ] Backend is running (`npm start`)
- [ ] Can reach backend with curl
- [ ] Frontend shows canteen fields for CANTEEN role
- [ ] Can fill all fields without errors
- [ ] Can submit form
- [ ] Frontend shows success message (no error)
- [ ] Backend logs show canteen created
- [ ] User auto-logged in to canteen dashboard
- [ ] Canteen dashboard loads (not student dashboard)

---

## 📚 Documentation Reference

If you get stuck, read these in order:

1. **SIGNUP_QUICK_FIX.md** ← Start here if confused
2. **CANTEEN_SIGNUP_DEBUG_GUIDE.md** ← If still failing
3. **SIGNUP_FLOW_DOCUMENTATION.md** ← Complete reference
4. **SIGNUP_COMPLETE_FIX.md** ← Technical details

---

## 🆘 Common Issues & Quick Fixes

| Issue | Solution |
|-------|----------|
| "Cannot connect to server" | Update IP in api.js, restart app |
| "Canteen fields don't appear" | Select CANTEEN role, refresh UI |
| "Canteen name required" error | Fill the Canteen Name field |
| "Location required" error | Fill the Location field |
| Backend logs show nothing | Make sure backend is running |
| Error message is unclear | Check console logs with filter "API Error" |
| Signup works but wrong dashboard | Wait for app to fully load |

---

## ✨ Success!

Once you see:
1. ✅ No error message in app
2. ✅ User auto-logged in  
3. ✅ Canteen dashboard displayed (with order list)
4. ✅ Backend logs show "User registered successfully"
5. ✅ Database has new canteen and user records

**YOU'RE DONE!** 🎉

The signup flow is fully fixed and working!

---

## 🚀 Next Steps After Signup Works

1. Test student signup (no canteen fields)
2. Test admin signup (no canteen fields)
3. Test login with each role
4. Verify each role sees correct dashboard
5. Test canteen features (menu management, orders, etc.)

---

**Remember:** The most important step is updating the API URL! 💡
