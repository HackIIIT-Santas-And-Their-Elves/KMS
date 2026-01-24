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

export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
};

export const canteenAPI = {
    getAll: () => api.get('/canteens'),
    create: (data) => api.post('/canteens', data),
    update: (id, data) => api.put(`/canteens/${id}`, data),
    delete: (id) => api.delete(`/canteens/${id}`),
};

export default api;
