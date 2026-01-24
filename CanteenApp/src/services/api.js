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

// Request interceptor
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth APIs
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
};

// Canteen APIs
export const canteenAPI = {
    getById: (id) => api.get(`/canteens/${id}`),
    toggleOpen: (id) => api.post(`/canteens/${id}/toggle-open`),
    toggleOnlineOrders: (id) => api.post(`/canteens/${id}/toggle-online-orders`),
};

// Menu APIs
export const menuAPI = {
    getByCanteen: (canteenId) => api.get(`/menu/canteen/${canteenId}`),
    create: (data) => api.post('/menu', data),
    update: (id, data) => api.put(`/menu/${id}`, data),
    toggleAvailability: (id) => api.patch(`/menu/${id}/toggle-availability`),
    delete: (id) => api.delete(`/menu/${id}`),
};

// Order APIs
export const orderAPI = {
    getByCanteen: (canteenId, status) => api.get(`/orders/canteen/${canteenId}`, { params: { status } }),
    getById: (id) => api.get(`/orders/${id}`),
    accept: (id) => api.post(`/orders/${id}/accept`),
    prepare: (id) => api.post(`/orders/${id}/prepare`),
    ready: (id) => api.post(`/orders/${id}/ready`),
    complete: (id, pickupCode) => api.post(`/orders/${id}/complete`, { pickupCode }),
};

export default api;
