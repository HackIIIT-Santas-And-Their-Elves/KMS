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

        console.log('🌐 API Request:', {
            method: config.method.toUpperCase(),
            url: config.url,
            data: config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : 'no data'
        });

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data
        });
        return response;
    },
    async (error) => {
        console.error('❌ API Error:', {
            status: error.response?.status,
            url: error.config?.url,
            method: error.config?.method,
            data: error.response?.data,
            message: error.message
        });

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
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (currentPassword, newPassword) => api.put('/auth/password', { currentPassword, newPassword }),
    updatePushToken: (pushToken) => api.put('/auth/push-token', { pushToken }),
};

// Canteen APIs
export const canteenAPI = {
    getAll: () => api.get('/canteens'),
    getById: (id) => api.get(`/canteens/${id}`),
    create: (data) => api.post('/canteens', data),
    update: (id, data) => api.put(`/canteens/${id}`, data),
    delete: (id) => api.delete(`/canteens/${id}`),
    toggleOpen: (id) => api.post(`/canteens/${id}/toggle-open`),
    toggleStatus: (id, secretKey) => api.post(`/canteens/${id}/toggle-status`, { secretKey }),
    toggleOnlineOrders: (id) => api.post(`/canteens/${id}/toggle-online-orders`),
    getQueueStatus: (id) => api.get(`/canteens/${id}/queue`),
    getAllQueueStatus: () => api.get('/canteens/queue-status/all'),
};

// Menu APIs
export const menuAPI = {
    getByCanteen: (canteenId) => api.get(`/menu/canteen/${canteenId}`),
    getById: (id) => api.get(`/menu/${id}`),
    create: (data) => api.post('/menu', data),
    update: (id, data) => api.put(`/menu/${id}`, data),
    toggleAvailability: (id) => api.patch(`/menu/${id}/toggle-availability`),
    delete: (id) => api.delete(`/menu/${id}`),
};

// Order APIs
export const orderAPI = {
    create: (orderData) => api.post('/orders', orderData),
    getMy: () => api.get('/orders/my'),
    getAll: (status) => {
        const params = status ? `?status=${status}` : '';
        return api.get(`/orders/all${params}`);
    },
    getByCanteen: (canteenId, status) => {
        const params = status ? `?status=${status}` : '';
        return api.get(`/orders/canteen/${canteenId}${params}`);
    },
    getCompletedByCanteen: (canteenId) => api.get(`/orders/canteen/${canteenId}/completed`),
    getById: (id) => api.get(`/orders/${id}`),
    cancel: (id) => api.post(`/orders/${id}/cancel`),
    accept: (id) => api.post(`/orders/${id}/accept`),
    prepare: (id) => api.post(`/orders/${id}/prepare`),
    ready: (id) => api.post(`/orders/${id}/ready`),
    complete: (id, pickupCode) => api.post(`/orders/${id}/complete`, { pickupCode }),
    updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

// Payment APIs
export const paymentAPI = {
    initiate: (orderId) => api.post('/payments/initiate', { orderId }),
    confirm: (paymentId) => api.post(`/payments/${paymentId}/confirm`),
    getByOrder: (orderId) => api.get(`/payments/order/${orderId}`),
};

export default api;
