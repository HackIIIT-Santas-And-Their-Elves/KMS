# UnifiedApp — Mobile application (React Native)

This folder contains the React Native mobile application used by students, canteen staff, and admins. It is organized to be easy to navigate and extend.

Key files
- App entry: [UnifiedApp/App.js](UnifiedApp/App.js)
- API config: [UnifiedApp/src/config/api.js](UnifiedApp/src/config/api.js)
- Cloudinary config: [UnifiedApp/src/config/cloudinary.js](UnifiedApp/src/config/cloudinary.js)

Folder structure (src)
- `assets/` — images, fonts and static assets.
- `config/` — app configuration such as API base URL and cloudinary keys.
- `constants/` — shared constants (colors, sizes).
- `context/` — React Context providers (`AuthContext`, `CartContext`).
- `navigation/` — app navigator(s). Primary file: [UnifiedApp/src/navigation/AppNavigator.js](UnifiedApp/src/navigation/AppNavigator.js).
- `screens/` — individual screens (Login, Register, Menu, Cart, Orders, Admin dashboard, etc.). Add screens here and register them in the navigator.
- `services/` — API wrappers (e.g., `api.js`) for HTTP calls.
- `utils/` — utilities such as `imageUpload.js`.

How to run

1. Install dependencies

```powershell
cd UnifiedApp
npm install
```

2. Start the app

If this is an Expo-managed project:

```powershell
npm start
# or
expo start
```

For bare React Native projects use `npx react-native run-android` or `run-ios` (requires native toolchains).

Configuration
- API base URL: update [UnifiedApp/src/config/api.js](UnifiedApp/src/config/api.js). For a device use `http://<your-host-ip>:<port>/api` instead of `localhost`.
- Cloudinary keys: [UnifiedApp/src/config/cloudinary.js](UnifiedApp/src/config/cloudinary.js).

Development notes
- Add a new screen: create a file in `src/screens/`, then add it to `AppNavigator.js`.
- To call backend APIs centrally, use `src/services/api.js` so authentication headers and error handling are consistent.
- Use `context/` for global state (auth, cart). Prefer Context + Reducer for complex state.

Code style
- Follow existing file naming and component structure. Prefer function components with hooks.

Common tasks
- Update API endpoints: change `API_BASE_URL` in `src/config/api.js`.
- Add UI: create components/screens in `src/screens` and update navigator.
- Image uploads: use `src/utils/imageUpload.js` and cloudinary config.

If you want, I can add a troubleshooting section and common emulator/device tips.
# KMS Unified App

A unified React Native application for the Khana Management System (KMS) that combines Student, Canteen, and Admin functionalities into a single app with role-based access.

## Features

### Role-Based Authentication
- **Students**: Browse canteens, order food, track orders, view history
- **Canteen Owners**: Manage menu items, scan pickup codes, view orders
- **Admins**: Manage canteens, manage users, system oversight

### Key Capabilities
- Single login/registration with automatic role-based navigation
- Shared authentication and cart management
- Unified design system and components
- All features from the three original apps

## Project Structure

```
UnifiedApp/
├── App.js                          # Main app entry with context providers
├── src/
│   ├── navigation/
│   │   └── AppNavigator.js         # Role-based navigation logic
│   ├── context/
│   │   ├── AuthContext.js          # Authentication with role support
│   │   └── CartContext.js          # Shopping cart for students
│   ├── screens/
│   │   ├── LoginScreen.js          # Universal login
│   │   ├── RegisterScreen.js       # Registration with role selection
│   │   ├── Student Screens/        # Student-specific screens
│   │   ├── Canteen Screens/        # Canteen-specific screens
│   │   └── Admin Screens/          # Admin-specific screens
│   ├── services/
│   │   └── api.js                  # API integration
│   ├── config/
│   │   └── api.js                  # API configuration
│   └── constants/
│       └── colors.js               # App color scheme
└── package.json                    # Dependencies
```

## Installation

1. **Navigate to the UnifiedApp directory:**
   ```bash
   cd KMS/UnifiedApp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Update API Configuration:**
   Edit `src/config/api.js` to set your backend URL:
   ```javascript
   export const API_BASE_URL = 'http://YOUR_IP:3000/api';
   ```

4. **Start the app:**
   ```bash
   npm start
   ```

   Then:
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with Expo Go app

## How It Works

### Authentication Flow
1. User opens the app and sees the login screen
2. User can choose to:
   - **Login**: Enter credentials, backend returns user data with role
   - **Register**: Select role (Student/Canteen/Admin) and create account
3. Based on the user's role, they are automatically routed to:
   - **STUDENT**: Tab navigator with Home, Orders, and Profile
   - **CANTEEN**: Stack navigator with Dashboard, Menu Management, QR Scanner
   - **ADMIN**: Stack navigator with Dashboard, Canteen Management, User Management

### Role-Based Navigation
The `AppNavigator` component checks the authenticated user's role and renders the appropriate navigation structure:

```javascript
const getNavigatorByRole = () => {
    switch (userRole) {
        case 'STUDENT':
            return <StudentTabs />;
        case 'CANTEEN':
            return <CanteenStack />;
        case 'ADMIN':
            return <AdminStack />;
        default:
            return <AuthStack />;
    }
};
```

## Testing Different Roles

### Student Account
- Register with role: **Student**
- Access: Browse canteens, place orders, track deliveries

### Canteen Account  
- Register with role: **Canteen Owner**
- Access: Manage menu items, view orders, scan QR codes

### Admin Account
- Register with role: **Admin**
- Access: Manage all canteens, manage users, system administration

## Key Files Modified

- **LoginScreen.js**: Generic login for all roles with automatic routing
- **RegisterScreen.js**: Added role selection (Student/Canteen/Admin)
- **AuthContext.js**: Enhanced to expose `userRole` for navigation decisions
- **AppNavigator.js**: Complete rewrite with role-based navigation logic

## Differences from Original Apps

1. **Single codebase**: All three apps merged into one
2. **Role-based routing**: Automatic navigation based on user role
3. **Unified authentication**: One login system for all users
4. **Shared components**: Common screens and utilities across roles
5. **Better maintenance**: Single app to maintain instead of three

## Backend Requirements

The backend must return user role in login/register responses:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",  // or "CANTEEN" or "ADMIN"
    "token": "..."
  }
}
```

## Troubleshooting

**Issue**: App doesn't navigate after login  
**Solution**: Ensure backend returns `role` field in auth responses

**Issue**: Wrong screens showing for user  
**Solution**: Check that `userRole` matches backend role values exactly

**Issue**: Navigation errors  
**Solution**: Verify all screen imports in AppNavigator.js are correct

## Development

To add new features:
1. Create screen components in `src/screens/`
2. Add route in appropriate navigator (Student/Canteen/Admin)
3. Update context if shared state is needed
4. Add API calls in `src/services/api.js`
