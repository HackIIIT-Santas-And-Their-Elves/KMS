# 🔍 KMS Debugging Guide

## Changes Made

### ✅ API Service Updates (UnifiedApp)
**File:** `UnifiedApp/src/services/api.js`

Added missing `orderAPI.getByCanteen()` function:
```javascript
getByCanteen: (canteenId, status) => {
    const params = status ? `?status=${status}` : '';
    return api.get(`/orders/canteen/${canteenId}${params}`);
},
```

Also added:
- `accept(id)` - Accept orders
- `updateStatus(id, status)` - Update order status

### ✅ Backend Logging (Backend)
**File:** `backend/server.js`

Added comprehensive request/response logging that shows:
- 📥 Full request details (method, path, URL)
- 📋 Query parameters
- 📤 Request body (with passwords hidden)
- 🔐 Authorization headers
- ✅ Response status codes
- ⏱️  Response times (in ms)
- 📊 Response data
- ❌ Error details with stack traces

### ✅ Logger Utility (Backend)
**File:** `backend/utils/logger.js` (Optional utility)

Comprehensive logging utility with:
- `logRequest()` - Log incoming requests
- `logResponse()` - Log responses with timing
- `logError()` - Log errors with stack traces
- `logDB()` - Log database operations
- `logAuth()` - Log authentication events
- `logValidation()` - Log validation errors
- `debug()` - Development-only debugging

---

## How to Use

### Starting Backend with Logging

```bash
cd backend
npm start
```

You'll see output like:
```
──────────────────────────────────────────────────────
📥 INCOMING REQUEST
2026-01-24T23:50:00.000Z
POST /api/orders/canteen/507f1f77bcf86cd799439011

🔗 Full URL: POST http://localhost:5000/api/orders/canteen/507f1f77bcf86cd799439011

📋 Query Params: {}

📤 Request Body:
{}

🔐 Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

✅ Response Status: 200
⏱️  Response Time: 145ms
📊 Response Data:
{
  "success": true,
  "count": 3,
  "data": [...]
}
──────────────────────────────────────────────────────
```

---

## Common API Endpoints to Test

### For Canteen (Get Orders)
```
GET /api/orders/canteen/{canteenId}
Headers: Authorization: Bearer {token}
Query Params (optional): status=PAID
```

**Response should show:**
- All orders for that canteen
- Order details with customer info
- Order status and items

### For Students (Get Own Orders)
```
GET /api/orders/my
Headers: Authorization: Bearer {token}
```

### Create Order
```
POST /api/orders
Headers: Authorization: Bearer {token}
Body: {
  "canteenId": "507f1f77bcf86cd799439011",
  "items": [
    {
      "menuItem": "507f1f77bcf86cd799439012",
      "quantity": 2
    }
  ]
}
```

---

## Debugging Checklist

### If API calls fail:

1. **Check Backend Logs**
   - Look for 📥 request logging
   - Check 📤 what data was sent
   - See ✅ response status and errors

2. **Verify Auth Token**
   - Token should appear in 🔐 Authorization logs
   - If missing, user not logged in
   - If invalid, backend will return 401

3. **Check Response Status**
   - 200-299: Success
   - 300-399: Redirects
   - 400-499: Client errors (bad request)
   - 500-599: Server errors

4. **API Service Functions**
   - `orderAPI.getByCanteen(canteenId)` - Get canteen orders
   - `orderAPI.getMy()` - Get my orders
   - `orderAPI.create(data)` - Create order
   - `orderAPI.accept(id)` - Accept order
   - `orderAPI.updateStatus(id, status)` - Update status

---

## Real Example Logs

### Successful Request:
```
──────────────────────────────────────────────────────
📥 INCOMING REQUEST
2026-01-24T23:52:30.123Z
GET /api/orders/canteen/507f1f77bcf86cd799439011

✅ Response Status: 200
⏱️  Response Time: 87ms
📊 Response Data:
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "userId": "...",
      "items": [...],
      "status": "PAID",
      "totalAmount": 250
    }
  ]
}
──────────────────────────────────────────────────────
```

### Failed Request (404):
```
──────────────────────────────────────────────────────
📥 INCOMING REQUEST
2026-01-24T23:52:45.456Z
GET /api/orders/invalid-id

❌ ERROR OCCURRED
Error Message: Cast to ObjectId failed for value "invalid-id"

✅ Response Status: 500
📊 Response Data:
{
  "success": false,
  "message": "Something went wrong!"
}
──────────────────────────────────────────────────────
```

---

## Tips for Debugging

1. **Keep Backend Logs Open**
   - Run backend in one terminal
   - Keep another terminal for running app
   - Watch logs in real-time as you test

2. **Test Endpoints with Postman/Curl**
   ```bash
   # Get canteen orders
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:5000/api/orders/canteen/CANTEEN_ID
   ```

3. **Check User Role**
   - STUDENT: Can only see their own orders
   - CANTEEN: Can see orders for their canteen
   - ADMIN: Can see all orders

4. **Common Issues**
   - ❌ `getByCanteen is not a function` → Was missing, now fixed
   - ❌ `401 Unauthorized` → Token not being sent or expired
   - ❌ `403 Forbidden` → User doesn't have permission for this resource
   - ❌ `404 Not Found` → Wrong endpoint or missing parameter

---

## Using the Logger Utility (Optional)

Instead of inline logging, you can use the logger utility in your routes:

```javascript
const Logger = require('../utils/logger');

router.get('/orders/canteen/:canteenId', protect, async (req, res) => {
    const startTime = Date.now();
    
    try {
        const orders = await Order.find({ canteenId: req.params.canteenId });
        
        const duration = Date.now() - startTime;
        Logger.logResponse(req, res, 200, duration, { 
            success: true, 
            count: orders.length, 
            data: orders 
        });
        
        res.json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        Logger.logError(req, error, 500);
        res.status(500).json({ success: false, message: error.message });
    }
});
```

---

## Next Steps

1. Restart backend: `npm start`
2. Open app in Expo Go
3. Try Canteen login
4. Check backend logs for requests
5. Watch the response data in logs
6. All API calls now have full logging! 🎉
