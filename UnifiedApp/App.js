import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import AppNavigator from './src/navigation/AppNavigator';
import { registerForPushNotificationsAsync } from './src/utils/notifications';

export default function App() {
    useEffect(() => {
        // Register for push notifications on app start
        registerForPushNotificationsAsync();
    }, []);

    return (
        <AuthProvider>
            <CartProvider>
                <AppNavigator />
                <StatusBar style="light" />
            </CartProvider>
        </AuthProvider>
    );
}
