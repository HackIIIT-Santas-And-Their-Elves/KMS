import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export const registerForPushNotificationsAsync = async () => {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }

        try {
            // Get Expo Push Token
            const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.manifest?.extra?.eas?.projectId;
            if (!projectId) {
                console.log('Project ID not found in app config');
            }
            
            token = (await Notifications.getExpoPushTokenAsync({
                projectId: projectId
            })).data;
            console.log('Push Token:', token);

            // Save to AsyncStorage
            await AsyncStorage.setItem('pushToken', token);
            
            // Try syncing immediately in case user is already logged in
            await performTokenSync();
        } catch (e) {
            console.error('Error getting push token:', e);
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
};

// Sync token to backend
export const performTokenSync = async () => {
    try {
        const token = await AsyncStorage.getItem('pushToken');
        if (token) {
            console.log('Syncing push token to backend...');
            await authAPI.updatePushToken(token);
        }
    } catch (error) {
        console.error('Token sync failed:', error);
    }
};

// Listener hooks
export const useNotificationListeners = (navigation) => {
    // Implement listeners if needed to navigate when notification is tapped
};
