import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (data) => api.post('/auth/register', data),
    getProfile: () => api.get('/auth/me'),
};

// Canteen APIs
export const canteenAPI = {
    getAll: () => api.get('/canteens'),
    getById: (id) => api.get(`/canteens/${id}`),
};

// Menu APIs
export const menuAPI = {
    getByCanteen: (canteenId) => api.get(`/menu/canteen/${canteenId}`),
    getById: (id) => api.get(`/menu/${id}`),
};

// Order APIs
export const orderAPI = {
    create: (orderData) => api.post('/orders', orderData),
    getMy: () => api.get('/orders/my'),
    getById: (id) => api.get(`/orders/${id}`),
    cancel: (id) => api.post(`/orders/${id}/cancel`),
};

// Payment APIs
export const paymentAPI = {
    initiate: (orderId) => api.post('/payments/initiate', { orderId }),
    confirm: (paymentId) => api.post(`/payments/${paymentId}/confirm`),
    getByOrder: (orderId) => api.get(`/payments/order/${orderId}`),
};

export default api;
