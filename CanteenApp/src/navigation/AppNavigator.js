import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import colors from '../constants/colors';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import MenuManagementScreen from '../screens/MenuManagementScreen';
import QRScannerScreen from '../screens/QRScannerScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return null;
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? (
                <Stack.Navigator
                    screenOptions={{
                        headerStyle: { backgroundColor: colors.primary },
                        headerTintColor: colors.white,
                        headerTitleStyle: { fontWeight: 'bold' },
                    }}
                >
                    <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Canteen Dashboard' }} />
                    <Stack.Screen name="MenuManagement" component={MenuManagementScreen} options={{ title: 'Manage Menu' }} />
                    <Stack.Screen name="QRScanner" component={QRScannerScreen} options={{ title: 'Scan Pickup Code' }} />
                </Stack.Navigator>
            ) : (
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Login" component={LoginScreen} />
                </Stack.Navigator>
            )}
        </NavigationContainer>
    );
};

export default AppNavigator;
