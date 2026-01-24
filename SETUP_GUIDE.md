# Quick Setup Guide

## Step 1: Start MongoDB

Open a **NEW terminal** and run:

```bash
mongod
```

If you don't have MongoDB installed, download it from: https://www.mongodb.com/try/download/community

**OR** use MongoDB Atlas (cloud):
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in `backend/.env`

---

## Step 2: Create Admin User (Using API)

Once MongoDB is running, open **another terminal** and run these commands:

### For Windows PowerShell:

```powershell
# Create Admin User
$body = @{
    name = "Admin"
    email = "admin@kms.com"
    password = "admin123"
    role = "ADMIN"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

### For Command Prompt or Git Bash:

```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Admin\",\"email\":\"admin@kms.com\",\"password\":\"admin123\",\"role\":\"ADMIN\"}"
```

---

## Step 3: Login Credentials

After creating the admin user, use these credentials:

**Admin App:**
- Email: `admin@kms.com`
- Password: `admin123`

**Student App:**
- Register normally through the app
- Email: `student@test.com`
- Password: `student123`

**Canteen App:**
- First create a canteen via Admin
- Then create canteen user via API (see below)

---

## Step 4: Create Canteen (After Admin Login)

Use the Admin app or API to create a canteen, then create a canteen user:

```powershell
# First, login as admin to get token
$loginBody = @{
    email = "admin@kms.com"
    password = "admin123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.data.token

# Create canteen
$canteenBody = @{
    name = "Main Canteen"
    location = "Ground Floor"
    description = "Main campus canteen"
    maxBulkSize = 50
} | ConvertTo-Json

$canteenResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/canteens" -Method POST -Body $canteenBody -ContentType "application/json" -Headers @{Authorization="Bearer $token"}
$canteenId = $canteenResponse.data._id

# Create canteen staff user
$staffBody = @{
    name = "Canteen Staff"
    email = "canteen@kms.com"
    password = "canteen123"
    role = "CANTEEN"
    canteenId = $canteenId
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $staffBody -ContentType "application/json"
```

---

## Quick Test Commands

Check if backend is running:
```bash
curl http://localhost:5000/health
```

Check MongoDB connection:
- Look for "MongoDB Connected" in backend terminal

---

## Summary of Credentials

| App | Email | Password |
|-----|-------|----------|
| Admin | admin@kms.com | admin123 |
| Canteen | canteen@kms.com | canteen123 |
| Student | student@test.com | student123 |

---

## Troubleshooting

**"Registration failed" on Student App:**
- MongoDB not running → Start `mongod`
- Backend crashed → Check backend terminal for errors
- Network issue → Both devices on same network?

**Backend won't start:**
- Port 5000 already in use → Kill the process or use different port
- MongoDB connection failed → Check if MongoDB is running

**Can't connect from phone:**
- Firewall blocking → Allow Node.js through firewall
- Different networks → Connect both to same WiFi
