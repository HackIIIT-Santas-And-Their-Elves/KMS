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

// Main Screens
import CanteenListScreen from '../screens/CanteenListScreen';
import MenuScreen from '../screens/MenuScreen';
import CartScreen from '../screens/CartScreen';
import PaymentScreen from '../screens/PaymentScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

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

const HomeStack = () => (
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

const OrdersStack = () => (
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

const ProfileStack = () => (
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

const MainTabs = () => (
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
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Orders" component={OrdersStack} />
        <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
);

const AppNavigator = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return null; // Or a loading screen
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? <MainTabs /> : <AuthStack />}
        </NavigationContainer>
    );
};

export default AppNavigator;
