import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import colors from '../constants/colors';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import CanteenManagementScreen from '../screens/CanteenManagementScreen';
import UserManagementScreen from '../screens/UserManagementScreen';

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
                    <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Admin Dashboard' }} />
                    <Stack.Screen name="CanteenManagement" component={CanteenManagementScreen} options={{ title: 'Manage Canteens' }} />
                    <Stack.Screen name="UserManagement" component={UserManagementScreen} options={{ title: 'Manage Users' }} />
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
