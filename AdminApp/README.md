# Admin App - Simplified Version

This is a simplified admin app. For a complete implementation, you can expand on this foundation.

## Quick Setup

The Admin App shares the same structure as the Student and Canteen apps.

### Basic Structure

```
AdminApp/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js (same as Canteen App)
│   │   ├── DashboardScreen.js
│   │   ├── CanteenManagementScreen.js
│   │   └── UserManagementScreen.js
│   ├── navigation/
│   │   └── AppNavigator.js
│   ├── context/
│   │   └── AuthContext.js (same as Canteen App)
│   ├── services/
│   │   └── api.js
│   └── constants/
│       └── colors.js (same as Student App)
├── App.js
├── package.json
├── app.json
└── babel.config.js
```

### Key Features

1. **Dashboard**: System overview with statistics
2. **Canteen Management**: Create, edit, delete canteens
3. **User Management**: View and manage users

### Installation

```bash
cd AdminApp
npm install
npx expo start
```

### Login Credentials

Use an admin user created via the API:

```json
POST http://localhost:5000/api/auth/register
{
  "name": "Admin",
  "email": "admin@test.com",
  "password": "password123",
  "role": "ADMIN"
}
```

## Note

The Admin App follows the same patterns as the Student and Canteen apps. You can:
- Copy the authentication flow from CanteenApp
- Copy the API service structure
- Implement canteen CRUD operations
- Add user management features

For the hackathon MVP, the backend API already supports all admin operations. The frontend can be built using the same patterns demonstrated in the Student and Canteen apps.
