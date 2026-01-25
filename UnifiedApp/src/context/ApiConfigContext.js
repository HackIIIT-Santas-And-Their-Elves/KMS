import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ApiConfigContext = createContext();

export const useApiConfig = () => {
    const context = useContext(ApiConfigContext);
    if (!context) {
        throw new Error('useApiConfig must be used within ApiConfigProvider');
    }
    return context;
};

export const ApiConfigProvider = ({ children }) => {
    const [apiBaseUrl, setApiBaseUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStoredApiUrl();
    }, []);

    const loadStoredApiUrl = async () => {
        try {
            const storedUrl = await AsyncStorage.getItem('apiBaseUrl');
            if (storedUrl) {
                setApiBaseUrl(storedUrl);
            }
        } catch (error) {
            console.error('Error loading API URL:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveApiUrl = async (url) => {
        try {
            // Remove trailing slash if present
            const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
            await AsyncStorage.setItem('apiBaseUrl', cleanUrl);
            setApiBaseUrl(cleanUrl);
            return { success: true };
        } catch (error) {
            console.error('Error saving API URL:', error);
            return { success: false, message: 'Failed to save API URL' };
        }
    };

    const clearApiUrl = async () => {
        try {
            await AsyncStorage.removeItem('apiBaseUrl');
            setApiBaseUrl(null);
        } catch (error) {
            console.error('Error clearing API URL:', error);
        }
    };

    const value = {
        apiBaseUrl,
        loading,
        saveApiUrl,
        clearApiUrl,
        isConfigured: !!apiBaseUrl,
    };

    return <ApiConfigContext.Provider value={value}>{children}</ApiConfigContext.Provider>;
};
