# 📝 KMS Signup Flow - Complete Documentation

## 🔧 Issue Fixed
**Problem:** "canteenId: Path `canteenId` is required" error when signing up as canteen owner.

**Root Cause:** The signup flow was trying to create a user without a canteen, but the User model requires `canteenId` for CANTEEN role users.

**Solution:** Updated both frontend and backend to automatically create a canteen when a canteen owner signs up.

---

## 📋 Signup Flow Overview

### Three User Roles
1. **STUDENT** - Regular student ordering food
2. **CANTEEN** - Canteen owner managing orders and menu
3. **ADMIN** - System administrator managing canteens and users

---

## 🎓 Student Signup Flow

### Frontend (RegisterScreen.js)
```
User selects "Student" role
    ↓
Fills basic info:
  - Full Name
  - Email
  - Password
  - Confirm Password
    ↓
Submits registration
    ↓
Backend creates User (no canteenId)
    ↓
Auto login & navigate to Student Dashboard
```

### Fields Required
- ✅ Full Name (required)
- ✅ Email (required, must be valid)
- ✅ Password (required, min 6 chars)
- ✅ Confirm Password (must match)

### Backend Behavior
- Creates User record with role = 'STUDENT'
- No canteenId assigned
- Returns token and user data
- User can immediately start ordering

### Sample Request Body
```json
{
  "name": "John Doe",
  "email": "student@example.com",
  "password": "password123",
  "role": "STUDENT"
}
```

---

## 🍽️ Canteen Owner Signup Flow

### Frontend (RegisterScreen.js)
```
User selects "Canteen Owner" role
    ↓
Filled basic info + ADDITIONAL canteen fields:
  - Full Name
  - Email
  - Password
  - Confirm Password
  - Canteen Name ⭐
  - Canteen Location ⭐
    ↓
Info box displays:
"📍 Your canteen will be created and 
you can manage it from your dashboard."
    ↓
Submits registration
    ↓
Backend creates Canteen record
    ↓
Backend creates User with canteenId reference
    ↓
Auto login & navigate to Canteen Dashboard
```

### Fields Required
- ✅ Full Name (required)
- ✅ Email (required, must be valid)
- ✅ Password (required, min 6 chars)
- ✅ Confirm Password (must match)
- ✅ **Canteen Name** (required, must be unique)
- ✅ **Canteen Location** (required)

### Validation Rules
1. **Basic Fields Validation:**
   - All fields must be filled
   - Email must be valid format
   - Password min 6 characters
   - Passwords must match

2. **Canteen Fields Validation:**
   - Canteen name is required (if role = CANTEEN)
   - Location is required (if role = CANTEEN)
   - Canteen name must be unique in database

### Backend Behavior (AUTO-CREATE CANTEEN)
1. Validates basic user fields
2. Checks if user email already exists
3. If role = CANTEEN:
   - Validates canteen name and location provided
   - Checks if canteen name already exists
   - **Creates new Canteen record** with:
     - name: canteenName
     - location: canteenLocation
     - isOpen: false (starts closed)
     - isOnlineOrdersEnabled: true
4. Creates User record with:
   - role: 'CANTEEN'
   - canteenId: reference to created canteen
5. Returns token and user data
6. User can immediately access canteen dashboard

### Sample Request Body
```json
{
  "name": "Raj Kumar",
  "email": "canteen@example.com",
  "password": "password123",
  "role": "CANTEEN",
  "canteenName": "Main Canteen",
  "canteenLocation": "Building A, Ground Floor"
}
```

### Sample Response
```json
{
  "success": true,
  "data": {
    "_id": "user123",
    "name": "Raj Kumar",
    "email": "canteen@example.com",
    "role": "CANTEEN",
    "canteenId": "canteen123",
    "token": "eyJhbGc..."
  }
}
```

---

## 👔 Admin Signup Flow

### Frontend (RegisterScreen.js)
```
User selects "Admin" role
    ↓
Fills basic info:
  - Full Name
  - Email
  - Password
  - Confirm Password
    ↓
Submits registration
    ↓
Backend creates User (no canteenId)
    ↓
Auto login & navigate to Admin Dashboard
```

### Fields Required
- ✅ Full Name (required)
- ✅ Email (required, must be valid)
- ✅ Password (required, min 6 chars)
- ✅ Confirm Password (must match)

### Backend Behavior
- Creates User record with role = 'ADMIN'
- No canteenId assigned
- Returns token and user data
- User can manage canteens and users immediately

### Sample Request Body
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "role": "ADMIN"
}
```

---

## 🔄 Complete Registration Flow Diagram

```
                    Registration Screen
                           ↓
         ┌──────────────────┼──────────────────┐
         ↓                  ↓                  ↓
    STUDENT              CANTEEN              ADMIN
         ↓                  ↓                  ↓
    [Simple Form]     [Form + Canteen]   [Simple Form]
    Basic fields      Basic + Location   Basic fields
         ↓                  ↓                  ↓
    POST /register   POST /register     POST /register
    name, email      name, email        name, email
    password         password           password
    role: STUDENT    canteenName        role: ADMIN
                     canteenLocation
                     role: CANTEEN
         ↓                  ↓                  ↓
   Backend:           Backend:           Backend:
   Create User     Create Canteen       Create User
   no canteenId    Create User w/       no canteenId
                   canteenId reference
         ↓                  ↓                  ↓
      Return token    Return token       Return token
         ↓                  ↓                  ↓
   Auto-login       Auto-login          Auto-login
         ↓                  ↓                  ↓
  Student Dash    Canteen Dash         Admin Dash
```

---

## 📂 Files Modified

### Frontend Changes
1. **UnifiedApp/src/screens/RegisterScreen.js**
   - Added `canteenName` and `canteenLocation` state
   - Added `validateCanteenFields()` function
   - Added conditional rendering of canteen fields when role = CANTEEN
   - Added info box with helpful text for canteen owners
   - Updated `handleRegister()` to pass canteen data in registration payload
   - Added `editable={!loading}` to all inputs for better UX
   - Added new styles: `infoBox`, `infoText`

2. **UnifiedApp/src/constants/colors.js**
   - Added `lightBlue: '#E3F2FD'` for info box styling

### Backend Changes
1. **backend/routes/auth.js**
   - Added `Canteen` model import
   - Updated register endpoint to extract `canteenName` and `canteenLocation`
   - Added validation for canteen fields when role = CANTEEN
   - Added duplicate canteen name check
   - **Auto-create Canteen record for CANTEEN role users**
   - Pass `canteenId` to User.create() for CANTEEN users

### Database Schema
1. **User Model** (unchanged behavior)
   - `canteenId` required when role = 'CANTEEN'
   - Optional for STUDENT and ADMIN

2. **Canteen Model** (unchanged structure)
   - Created automatically during signup
   - Default values:
     - `isOpen: false`
     - `isOnlineOrdersEnabled: true`

---

## ✅ Testing Checklist

### Test Student Signup
- [ ] Load signup screen
- [ ] Select "Student" role
- [ ] Fill in basic fields
- [ ] No canteen fields should appear
- [ ] Click sign up
- [ ] Should login and show student dashboard
- [ ] Verify in DB: User created with no canteenId

### Test Canteen Signup
- [ ] Load signup screen
- [ ] Select "Canteen Owner" role
- [ ] **Canteen fields should appear** ✨
- [ ] Info box should display
- [ ] Fill all basic + canteen fields
- [ ] Click sign up
- [ ] Should create canteen AND user
- [ ] Should login and show canteen dashboard
- [ ] Verify in DB:
  - Canteen record created
  - User created with canteenId reference

### Test Admin Signup
- [ ] Load signup screen
- [ ] Select "Admin" role
- [ ] Fill in basic fields
- [ ] No canteen fields should appear
- [ ] Click sign up
- [ ] Should login and show admin dashboard
- [ ] Verify in DB: User created with no canteenId

### Test Error Cases

#### Canteen Signup - Missing Canteen Fields
- [ ] Select canteen role
- [ ] Don't fill canteen fields
- [ ] Click sign up
- [ ] Should show: "Please provide canteen name and location"

#### Canteen Signup - Duplicate Canteen Name
- [ ] Create first canteen with name "Test Canteen"
- [ ] Try to create second with same name
- [ ] Should show: "Canteen with this name already exists"

#### All Roles - Duplicate Email
- [ ] Create user with email "test@example.com"
- [ ] Try to register another with same email
- [ ] Should show: "User already exists"

#### All Roles - Weak Password
- [ ] Try password with less than 6 characters
- [ ] Should show: "Password must be at least 6 characters"

#### All Roles - Mismatched Passwords
- [ ] Enter password and different confirm password
- [ ] Should show: "Passwords do not match"

---

## 🚀 API Endpoints Reference

### Register Endpoint
```
POST /api/auth/register
Content-Type: application/json

Body:
{
  "name": "string (required)",
  "email": "string (required, email format)",
  "password": "string (required, min 6 chars)",
  "role": "STUDENT | CANTEEN | ADMIN (required)",
  "canteenName": "string (required if role=CANTEEN)",
  "canteenLocation": "string (required if role=CANTEEN)"
}

Success Response (201):
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "STUDENT|CANTEEN|ADMIN",
    "canteenId": "canteen_id (only if CANTEEN)",
    "token": "jwt_token"
  }
}

Error Responses:
400 - Validation errors or duplicate data
500 - Server error
```

---

## 🔐 Security Considerations

1. **Password Security**
   - Minimum 6 characters enforced
   - Hashed with bcrypt before storage
   - Confirm password validation on frontend

2. **Email Uniqueness**
   - Email must be unique across all users
   - Backend validates before creation

3. **Canteen Name Uniqueness**
   - Canteen names must be unique
   - Prevents duplicate canteen creation

4. **Role Validation**
   - Only valid roles accepted
   - Enum validation on backend

5. **Automatic Logout on Signup**
   - Any existing session cleared
   - Fresh token provided after signup

---

## 📊 User Flow Summary

| Step | Student | Canteen | Admin |
|------|---------|---------|-------|
| 1 | Select Student | Select Canteen | Select Admin |
| 2 | Fill name, email | Fill name, email | Fill name, email |
| 3 | Fill password | Fill password | Fill password |
| 4 | Submit | Add canteen info | Submit |
| 5 | - | Canteen auto-created | - |
| 6 | Token received | Token received | Token received |
| 7 | Student dashboard | Canteen dashboard | Admin dashboard |

---

## 🎉 Signup Flow Complete!

All three roles now have proper signup flows with appropriate field validation and automatic record creation where needed! 🚀

The canteen owner signup is now **fully functional** with automatic canteen creation during registration.
