import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Retry logic with exponential backoff
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const shouldRetry = (error) => {
  // Retry on network errors or 5xx server errors
  return (
    !error.response || 
    (error.response.status >= 500 && error.response.status < 600)
  );
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Handle errors and retries
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Initialize retry count
    if (!config.__retryCount) {
      config.__retryCount = 0;
    }
    
    // Check if we should retry
    if (config.__retryCount < MAX_RETRIES && shouldRetry(error)) {
      config.__retryCount++;
      
      // Exponential backoff: 1s, 2s, 4s
      const delayMs = RETRY_DELAY * Math.pow(2, config.__retryCount - 1);
      console.log(`Retrying request (${config.__retryCount}/${MAX_RETRIES}) after ${delayMs}ms...`);
      
      await delay(delayMs);
      
      return api(config);
    }
    
    // Handle 401 (unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;