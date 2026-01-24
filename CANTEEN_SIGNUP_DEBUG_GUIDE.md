# 🔍 Canteen Signup Registration Fix Guide

## Issue: Registration Failed Error

When signing up as a canteen owner through the UI, the app shows "Registration Failed" without clear error details.

## Root Causes & Solutions

### 1. **Incorrect Backend IP Address**

**Current Setup:**
```javascript
// UnifiedApp/src/config/api.js
export const API_BASE_URL = 'http://10.2.142.214:5000/api';
```

**Problem:** The hardcoded IP `10.2.142.214` is network-specific and may not be correct for your current network.

**Solution:**

#### Option A: Use localhost (for local development)
```javascript
// UnifiedApp/src/config/api.js
export const API_BASE_URL = 'http://localhost:5000/api';
```

#### Option B: Use correct network IP
Find your actual machine IP:
```bash
# On Linux/Mac
ifconfig | grep "inet " | grep -v 127.0.0.1

# On Windows
ipconfig
```

Then update the config:
```javascript
export const API_BASE_URL = 'http://YOUR_MACHINE_IP:5000/api';
```

#### Option C: Use dynamic configuration (Recommended for Expo)
```javascript
// UnifiedApp/src/config/api.js
import Constants from 'expo-constants';

const localhost = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:5000/api';
export const API_BASE_URL = localhost;
```

Update `app.json`:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://YOUR_MACHINE_IP:5000/api"
    }
  }
}
```

---

### 2. **Backend Not Running or Not Accessible**

**Check if backend is running:**
```bash
# From KMS/backend directory
npm start

# Should see:
# 🚀 KMS Backend Server running on port 5000
# MongoDB Connected: ...
```

**Verify connectivity from your device/emulator:**
```bash
# From another terminal
curl -i http://localhost:5000/health
# Should return: 200 OK
```

---

### 3. **Enhanced Debugging Steps**

Now that we've added detailed logging, follow these steps:

#### Step 1: Check Frontend Logs
- Open Expo/React Native debugger
- Look for logs like:
  ```
  🔐 Attempting registration with data: { name: "...", email: "...", role: "CANTEEN", canteenName: "...", canteenLocation: "..." }
  🌐 API Request: { method: "POST", url: "/auth/register", data: {...} }
  ```

#### Step 2: Check Backend Logs
- Backend terminal should show:
  ```
  📝 Register request: { name: "...", email: "...", role: "CANTEEN", hasCanteenName: true, hasCanteenLocation: true }
  🍽️ Creating canteen for CANTEEN user
  ✅ Canteen created: <canteenId>
  ✅ User registered successfully: <userId> Role: CANTEEN
  ```

#### Step 3: Compare Request & Response
- Frontend logs show what was sent
- Backend logs show what was received
- Response logs show what was returned

---

## ✅ Testing Checklist

### Before Testing Signup

- [ ] Backend running: `npm start` in `/KMS/backend`
- [ ] MongoDB is accessible
- [ ] API_BASE_URL is correct in `/UnifiedApp/src/config/api.js`
- [ ] Device/Emulator can reach the IP address
- [ ] Port 5000 is not blocked by firewall

### Test Canteen Signup Flow

1. **Open Expo app or React Native debugger**
   - Clear console logs
   - Note the logs output area

2. **Navigate to Registration Screen**
   - Tap "Canteen Owner" role button
   - Canteen fields should appear (Canteen Name, Location)

3. **Fill Form**
   ```
   Name: Test Canteen Owner
   Email: test.canteen@example.com
   Canteen Name: My Test Canteen
   Location: Building A
   Password: password123
   Confirm Password: password123
   ```

4. **Submit**
   - Watch frontend logs for API request
   - Watch backend logs for received request
   - If error, check error logs for details

5. **Expected Success Logs**
   ```
   Frontend:
   🔐 Attempting registration with data: {...}
   🌐 API Request: POST /auth/register
   ✅ API Response: status 201
   ✅ Registration successful! User: test.canteen@example.com
   
   Backend:
   📝 Register request: {...}
   🍽️ Creating canteen for CANTEEN user
   ✅ Canteen created: <id>
   ✅ User registered successfully: <id> Role: CANTEEN
   ```

---

## 🔧 Common Error Messages & Fixes

### Error: "Cannot reach server" or "Network timeout"
**Cause:** Wrong IP address or backend not running
**Fix:** 
- Check IP address in `api.js`
- Verify backend is running: `npm start`
- Check firewall settings

### Error: "Canteen name and location are required"
**Cause:** Canteen fields not being sent
**Fix:**
- Ensure you fill Canteen Name field
- Ensure you fill Location field
- Check RegisterScreen logs to verify data is being collected

### Error: "Canteen with this name already exists"
**Cause:** Using a duplicate canteen name
**Fix:**
- Use a unique canteen name
- Add timestamp to name: "My Canteen 1234567890"

### Error: "User already exists"
**Cause:** Email already registered
**Fix:**
- Use a new email address
- Add timestamp: "test.canteen+1234567890@example.com"

### Error: "Invalid role"
**Cause:** Role value misspelled
**Fix:**
- Must be exactly: "STUDENT", "CANTEEN", or "ADMIN"
- Case-sensitive!

---

## 📋 Step-by-Step API Test (Using cURL)

Run the test script to verify API endpoints work:

```bash
# Make script executable
chmod +x /home/shreyashchitkula/Desktop/HackIIIT/KMS/test-signup.sh

# Run tests
./test-signup.sh
```

Or manually test canteen signup:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Canteen Owner",
    "email": "canteen.test@example.com",
    "password": "password123",
    "role": "CANTEEN",
    "canteenName": "Test Canteen",
    "canteenLocation": "Building A"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Test Canteen Owner",
    "email": "canteen.test@example.com",
    "role": "CANTEEN",
    "canteenId": "...",
    "token": "..."
  }
}
```

---

## 📝 Files Modified for Debugging

1. **UnifiedApp/src/context/AuthContext.js**
   - Added detailed logging for registration attempts
   - Logs error details before returning failure

2. **UnifiedApp/src/screens/RegisterScreen.js**
   - Added console logs when registration attempted
   - Logs success/failure with details

3. **UnifiedApp/src/services/api.js**
   - Request interceptor logs every API call
   - Response interceptor logs success/errors
   - Shows exact data sent and received

4. **backend/routes/auth.js**
   - Added detailed logging at each step
   - Logs validation errors
   - Logs canteen creation process
   - Logs user creation success

---

## 🚀 Next Steps After Fix

Once you fix the IP address issue:

1. Test student signup (should work)
2. Test canteen signup (should create canteen + user)
3. Test admin signup (should work)
4. Test login with each role
5. Verify each role sees correct dashboard

---

## ❓ FAQ

**Q: What IP address should I use?**
A: The IP of the machine running the backend. Use `ipconfig` (Windows) or `ifconfig` (Linux/Mac) to find it.

**Q: Can I use localhost on my phone/emulator?**
A: Only if the backend is running on the same device. For Expo on a separate device, use the machine's actual IP.

**Q: How do I test from my phone if backend is on my computer?**
A: Make sure both are on the same network, use your computer's IP address (not localhost), and disable firewall if needed.

**Q: What if I see "Failed to fetch"?**
A: Usually means the URL is wrong or the backend isn't responding. Check logs and verify IP.

---

## 🎯 Success Indicators

✅ Backend logs show canteen creation  
✅ Backend logs show user creation with canteenId  
✅ Frontend shows success message  
✅ Token is received and stored  
✅ User is automatically logged in  
✅ User sees canteen dashboard (not student or admin)  

---

If you're still having issues, check the detailed logs in both frontend and backend for the exact error message and let me know what it says!
