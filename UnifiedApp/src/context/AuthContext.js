import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('userToken');
            const storedUser = await AsyncStorage.getItem('userData');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Error loading auth:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await authAPI.login(email, password);
            const { data } = response.data;

            await AsyncStorage.setItem('userToken', data.token);
            await AsyncStorage.setItem('userData', JSON.stringify(data));

            setToken(data.token);
            setUser(data);

            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            console.log('📝 Register attempt with data:', {
                name: userData.name,
                email: userData.email,
                role: userData.role,
                hasCanteenName: !!userData.canteenName,
                hasCanteenLocation: !!userData.canteenLocation
            });

            const response = await authAPI.register(userData);
            const { data } = response.data;

            await AsyncStorage.setItem('userToken', data.token);
            await AsyncStorage.setItem('userData', JSON.stringify(data));

            setToken(data.token);
            setUser(data);

            console.log('✅ Registration successful:', data.role);
            return { success: true, data };
        } catch (error) {
            let errorMessage = 'Registration failed';

            // Try to extract error message from various possible formats
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors?.length > 0) {
                errorMessage = error.response.data.errors[0].msg || error.response.data.errors[0].message;
            } else if (error.response?.data?.errors?.message) {
                errorMessage = error.response.data.errors.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            // Check for network errors
            if (error.code === 'ECONNABORTED') {
                errorMessage = 'Request timeout - server may be unreachable';
            } else if (error.code === 'ECONNREFUSED') {
                errorMessage = 'Cannot connect to server - check API URL and backend status';
            } else if (error.message?.includes('Network')) {
                errorMessage = 'Network error - check your connection and API URL';
            }

            console.error('❌ Registration error:', {
                message: errorMessage,
                status: error.response?.status,
                data: error.response?.data,
                code: error.code
            });

            return {
                success: false,
                message: errorMessage
            };
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
            setToken(null);
            setUser(null);
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const updateUser = async (updatedUserData) => {
        try {
            const newUserData = { ...user, ...updatedUserData };
            await AsyncStorage.setItem('userData', JSON.stringify(newUserData));
            setUser(newUserData);
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!token,
        userRole: user?.role, // STUDENT, CANTEEN, or ADMIN
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
