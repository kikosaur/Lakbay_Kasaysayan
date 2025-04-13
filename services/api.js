import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import axios from 'axios';

// Use environment-based API URL
const API_URL = __DEV__ 
  ? Platform.OS === 'android' 
    ? 'http://10.0.2.2:50001/api'  // Android emulator with fallback port
    : 'http://localhost:50001/api'  // iOS simulator with fallback port
  : 'https://your-production-api.com/api';  // Production URL

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getHeaders = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  } catch (error) {
    console.error('Error getting headers:', error);
    return { 'Content-Type': 'application/json' };
  }
};

const fetchWithRetry = async (url, options, retries = MAX_RETRIES) => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network request failed' }));
      throw new Error(error.message || 'Network request failed');
    }
    
    return response.json();
  } catch (error) {
    console.error(`Request failed (${retries} retries left):`, error);
    if (retries > 0) {
      await sleep(RETRY_DELAY);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

const auth = {
  register: async (userData) => {
    return fetchWithRetry(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials) => {
    const data = await fetchWithRetry(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(credentials),
    });
    
    if (data.token) {
      await AsyncStorage.setItem('token', data.token);
    }
    return data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
  },
};

const runs = {
  create: async (data) => {
    const response = await axios.post(`${API_URL}/runs`, data);
    return response.data;
  },
  getAll: async () => {
    const response = await axios.get(`${API_URL}/runs`);
    return response.data;
  },
  getRecent: async (limit = 3) => {
    const response = await axios.get(`${API_URL}/runs/recent?limit=${limit}`);
    return response.data;
  }
};

const historicalEvents = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/historical-events`);
    return response.data;
  },
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/historical-events/${id}`);
    return response.data;
  }
};

const achievements = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/achievements`);
    return response.data;
  },
  check: async (userId) => {
    const response = await axios.get(`${API_URL}/achievements/check/${userId}`);
    return response.data;
  }
};

export { auth, runs, historicalEvents, achievements }; 