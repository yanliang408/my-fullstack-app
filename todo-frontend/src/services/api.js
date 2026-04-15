import axios from 'axios';
import { getAccessToken } from '../utils/auth';

const apiBaseUrl = process.env.VITE_API_URL || 'http://localhost:3003';

const api = axios.create({
  baseURL: apiBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
