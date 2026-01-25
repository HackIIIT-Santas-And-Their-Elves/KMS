import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import colors from '../constants/colors';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Student Screens
import CanteenListScreen from '../screens/CanteenListScreen';
import MenuScreen from '../screens/MenuScreen';
import CartScreen from '../screens/CartScreen';
import PaymentScreen from '../screens/PaymentScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Canteen Screens
import CanteenDashboardScreen from '../screens/CanteenDashboardScreen';
import MenuManagementScreen from '../screens/MenuManagementScreen';
import QRScannerScreen from '../screens/QRScannerScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import CanteenManagementScreen from '../screens/CanteenManagementScreen';
import UserManagementScreen from '../screens/UserManagementScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack
const AuthStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.white,
            headerTitleStyle: { fontWeight: 'bold' },
        }}
    >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Sign Up' }} />
    </Stack.Navigator>
);

// Student Navigation
const StudentHomeStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.white,
            headerTitleStyle: { fontWeight: 'bold' },
        }}
    >
        <Stack.Screen name="CanteenList" component={CanteenListScreen} options={{ title: 'Canteens' }} />
        <Stack.Screen name="Menu" component={MenuScreen} options={{ title: 'Menu' }} />
        <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Cart' }} />
        <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment' }} />
        <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} options={{ title: 'Track Order' }} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} options={{ title: 'Order Details' }} />
    </Stack.Navigator>
);

const StudentOrdersStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.white,
            headerTitleStyle: { fontWeight: 'bold' },
        }}
    >
        <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} options={{ title: 'My Orders' }} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} options={{ title: 'Order Details' }} />
    </Stack.Navigator>
);

const StudentProfileStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.white,
            headerTitleStyle: { fontWeight: 'bold' },
        }}
    >
        <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Stack.Navigator>
);

const StudentTabs = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                if (route.name === 'Home') {
                    iconName = focused ? 'restaurant' : 'restaurant-outline';
                } else if (route.name === 'Orders') {
                    iconName = focused ? 'receipt' : 'receipt-outline';
                } else if (route.name === 'Profile') {
                    iconName = focused ? 'person' : 'person-outline';
                }
                return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textSecondary,
            headerShown: false,
        })}
    >
        <Tab.Screen name="Home" component={StudentHomeStack} />
        <Tab.Screen name="Orders" component={StudentOrdersStack} />
        <Tab.Screen name="Profile" component={StudentProfileStack} />
    </Tab.Navigator>
);

// Canteen Navigation
const CanteenStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.white,
            headerTitleStyle: { fontWeight: 'bold' },
        }}
    >
        <Stack.Screen name="Dashboard" component={CanteenDashboardScreen} options={{ title: 'Canteen Dashboard' }} />
        <Stack.Screen name="MenuManagement" component={MenuManagementScreen} options={{ title: 'Manage Menu' }} />
        <Stack.Screen name="QRScanner" component={QRScannerScreen} options={{ title: 'Scan Pickup Code' }} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} options={{ title: 'Order Details' }} />
    </Stack.Navigator>
);

// Admin Navigation
const AdminStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.white,
            headerTitleStyle: { fontWeight: 'bold' },
        }}
    >
        <Stack.Screen name="Dashboard" component={AdminDashboardScreen} options={{ title: 'Admin Dashboard' }} />
        <Stack.Screen name="CanteenManagement" component={CanteenManagementScreen} options={{ title: 'Manage Canteens' }} />
        <Stack.Screen name="UserManagement" component={UserManagementScreen} options={{ title: 'Manage Users' }} />
    </Stack.Navigator>
);

// Main App Navigator
const AppNavigator = () => {
    const { isAuthenticated, loading, userRole } = useAuth();

    if (loading) {
        return null; // Or a loading screen
    }

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

    return (
        <NavigationContainer>
            {isAuthenticated ? getNavigatorByRole() : <AuthStack />}
        </NavigationContainer>
    );
};

export default AppNavigator;
