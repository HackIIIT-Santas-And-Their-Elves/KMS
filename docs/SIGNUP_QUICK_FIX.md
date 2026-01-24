# 🔧 Quick Signup Fix - Setup Instructions

## Immediate Actions Required

### 1. **FIX API URL** (Most Critical!)
The hardcoded IP address is likely the issue.

**Current file:** `UnifiedApp/src/config/api.js`

Find your machine IP:
```bash
# Linux/Mac
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

Update the file to use your IP:
```javascript
// UnifiedApp/src/config/api.js
export const API_BASE_URL = 'http://YOUR_MACHINE_IP:5000/api';
```

Or use localhost if testing on same machine:
```javascript
export const API_BASE_URL = 'http://localhost:5000/api';
```

---

### 2. **Ensure Backend is Running**
```bash
cd /home/shreyashchitkula/Desktop/HackIIIT/KMS/backend
npm start

# Should see:
# 🚀 KMS Backend Server running on port 5000
# MongoDB Connected: ...
```

---

### 3. **Test Signup Flow**

**From Expo/Frontend:**
1. Open registration screen
2. Select "Canteen Owner"
3. Canteen fields should appear (Name, Location)
4. Fill all fields
5. Click Sign Up
6. Watch console logs for:
   - `🔐 Attempting registration...`
   - `🌐 API Request...`
   - `✅ API Response...` or `❌ API Error...`

**From Terminal (cURL):**
```bash
curl -X POST http://YOUR_MACHINE_IP:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Owner",
    "email": "test@example.com",
    "password": "password123",
    "role": "CANTEEN",
    "canteenName": "Test Canteen",
    "canteenLocation": "Building A"
  }' | python3 -m json.tool
```

---

## What Was Fixed

✅ **Backend** - Auto-creates canteen during signup  
✅ **Frontend** - Collects canteen fields  
✅ **Validation** - Validates all required fields  
✅ **Error Logging** - Shows exact error in console  
✅ **Network Detection** - Identifies connection issues  

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Cannot connect to server" | Wrong IP or backend down | Update IP in api.js, start backend |
| "Canteen name required" | Field not filled | Fill "Canteen Name" field |
| "Location required" | Field not filled | Fill "Location" field |
| "Registration Failed" + no details | Check console logs | Open debugger to see detailed logs |
| "Canteen already exists" | Duplicate name | Use unique canteen name |
| "User already exists" | Duplicate email | Use different email |

---

## Files You Modified

**These changes are already in place:**
- ✅ `backend/routes/auth.js` - Auto-creates canteen
- ✅ `UnifiedApp/src/screens/RegisterScreen.js` - Collects canteen fields
- ✅ `UnifiedApp/src/context/AuthContext.js` - Better error handling
- ✅ `UnifiedApp/src/services/api.js` - Request/response logging
- ✅ `UnifiedApp/src/constants/colors.js` - Added lightBlue color

**You only need to update:**
- 🔴 `UnifiedApp/src/config/api.js` - Update API_BASE_URL

---

## Verify Success

After signup as canteen owner, verify:
1. ✅ No error shown in app
2. ✅ User auto-logged in
3. ✅ Canteen dashboard displayed (not student)
4. ✅ Backend logs show canteen created
5. ✅ Database has canteen + user records

---

## Debug Commands

**Check if backend is accessible:**
```bash
curl http://YOUR_IP:5000/health
```

**Test student signup (should work):**
```bash
curl -X POST http://YOUR_IP:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "student@example.com",
    "password": "password123",
    "role": "STUDENT"
  }'
```

**View backend logs in real-time:**
```bash
# Terminal where backend is running - should show:
# 📝 Register request: {...}
# 🍽️ Creating canteen for CANTEEN user
# ✅ Canteen created: <id>
# ✅ User registered successfully: <id>
```

---

## Ready to Test?

1. Update `API_BASE_URL` ← **DO THIS FIRST!**
2. Start backend: `npm start`
3. Test from Expo: Try canteen signup
4. Check logs in both frontend + backend
5. Verify in database

**Still having issues?** Check the detailed logs for the exact error message!

---

## Documentation Available

- `SIGNUP_FLOW_DOCUMENTATION.md` - Complete details
- `CANTEEN_SIGNUP_DEBUG_GUIDE.md` - Debugging tips
- `test-signup.sh` - Automated tests
- `SIGNUP_FIX_SUMMARY.md` - All changes made

Good luck! 🚀
