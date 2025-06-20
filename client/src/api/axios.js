import axios from 'axios';

// Create axios instance with enhanced configuration
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request retry configuration
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

// Track if we're currently refreshing token to avoid multiple refresh calls
let isRefreshing = false;
let refreshSubscribers = [];

// Add failed requests to queue while refreshing
const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

// Process queue after successful refresh
const onRrefreshed = (token) => {
  refreshSubscribers.map(cb => cb(token));
  refreshSubscribers = [];
};

// Add request retry counter
const addRetryFlag = (config) => {
  config.__retryCount = config.__retryCount || 0;
  return config;
};

// Delay function for retries
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Comprehensive cleanup function for expired tokens
const clearAllAuthData = () => {
  // Clear all possible auth-related localStorage items
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  
  // Also clear any other potential auth-related items that might exist
  Object.keys(localStorage).forEach(key => {
    if (key.toLowerCase().includes('token') || 
        key.toLowerCase().includes('auth') || 
        key.toLowerCase().includes('user')) {
      localStorage.removeItem(key);
    }
  });
  
  console.log('🧹 All authentication data cleared from localStorage');
};

// Enhanced redirect to login function
const redirectToLogin = () => {
  clearAllAuthData();
  
  // Only redirect if not already on login/register page
  if (window.location.pathname !== '/login' && 
      window.location.pathname !== '/register') {
    console.log('🔄 Redirecting to login page due to expired tokens');
    window.location.href = '/login';
  }
};

// Request interceptor to add auth token and handle retries
instance.interceptors.request.use(
  (config) => {
    // Add retry flag
    config = addRetryFlag(config);
    
    // Add auth token if available
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Handle FormData content type
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  () => Promise.reject(new Error('Request failed'))
);

// Refresh token function
const refreshAccessToken = async () => {
  try {
    console.log('🔄 Attempting to refresh access token...');
    const response = await axios.post(
      `${instance.defaults.baseURL}/auth/refresh`,
      {},
      { withCredentials: true }
    );
    
    if (response.data?.success && response.data?.data?.accessToken) {
      const { accessToken, user } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      console.log('✅ Token refresh successful');
      return accessToken;
    } else {
      console.error('❌ Invalid refresh response:', response.data);
      throw new Error('Invalid refresh response');
    }
  } catch (error) {
    console.error('❌ Token refresh failed:', error.response?.data || error.message);
    // Refresh failed, clear all auth data
    clearAllAuthData();
    throw error;
  }
};

// Response interceptor with enhanced error handling and token refresh logic
instance.interceptors.response.use(
  (response) => {
    // Add response time for debugging
    if (response.config.metadata) {
      response.config.metadata.endTime = new Date();
      response.config.metadata.duration = response.config.metadata.endTime - response.config.metadata.startTime;
    }
    
    return response;
  },
  async (error) => {
    const config = error.config;
    
    // Handle network errors with retry
    if (!error.response) {
      if (config && config.__retryCount < MAX_RETRY_ATTEMPTS) {
        config.__retryCount += 1;
        await delay(RETRY_DELAY * config.__retryCount);
        return instance(config);
      }
      
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
        code: 'NETWORK_ERROR',
        originalError: error
      });
    }
    
    const status = error.response.status;
    
    // Handle specific HTTP status codes
    switch (status) {
      case 401:
        console.log('🔒 401 Unauthorized received for:', config.url);
        
        // Don't attempt refresh for auth endpoints or if already retrying
        if (config.url?.includes('/auth/') || config.__isRetryRequest) {
          console.log('⚠️ Skipping refresh for auth endpoint or retry request');
          // Clear all auth data and redirect for auth endpoint failures
          redirectToLogin();
          break;
        }

        // Also skip refresh if this is the getCurrentUser call during app initialization
        // Let the AuthContext handle token refresh in this case
        if (config.url?.includes('/auth/me') && window.location.pathname === '/') {
          console.log('⚠️ Skipping axios refresh for getCurrentUser during app init - letting AuthContext handle it');
          return Promise.reject(error);
        }

        // Attempt token refresh
        if (!isRefreshing) {
          isRefreshing = true;
          
          try {
            const newToken = await refreshAccessToken();
            isRefreshing = false;
            onRrefreshed(newToken);
            
            // Retry original request with new token
            config.headers.Authorization = `Bearer ${newToken}`;
            config.__isRetryRequest = true;
            return instance(config);
            
          } catch (refreshError) {
            isRefreshing = false;
            refreshSubscribers = [];
            
            // Refresh failed, clear all data and redirect
            console.log('❌ Refresh token expired or invalid, redirecting to login');
            redirectToLogin();
            
            return Promise.reject(error);
          }
        } else {
          // If already refreshing, queue this request
          return new Promise((resolve) => {
            subscribeTokenRefresh((token) => {
              config.headers.Authorization = `Bearer ${token}`;
              config.__isRetryRequest = true;
              resolve(instance(config));
            });
          });
        }
        
      case 403:
        // Forbidden - user doesn't have permission
        break;
        
      case 429:
        // Rate limiting - retry after delay
        if (config && config.__retryCount < MAX_RETRY_ATTEMPTS) {
          config.__retryCount += 1;
          const retryAfter = error.response.headers['retry-after'] || 5;
          await delay(retryAfter * 1000);
          return instance(config);
        }
        break;
        
      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors - retry with exponential backoff
        if (config && config.__retryCount < MAX_RETRY_ATTEMPTS) {
          config.__retryCount += 1;
          const retryDelay = RETRY_DELAY * Math.pow(2, config.__retryCount - 1);
          await delay(retryDelay);
          return instance(config);
        }
        break;
        
      default:
        // Other errors - pass through
    }
    
    return Promise.reject(error);
  }
);

// Health check function - using root endpoint since /health might not exist
export const healthCheck = async () => {
  try {
    const response = await instance.get('/');
    return response.data || { status: 'ok', message: 'API is running' };
  } catch {
    return { status: 'error', message: 'API is not available' };
  }
};

// Clear auth data utility - exported for use in other parts of the app
export const clearAuthData = clearAllAuthData;

// Check if API is available
export const isApiAvailable = async () => {
  try {
    await healthCheck();
    return true;
  } catch {
    return false;
  }
};

export default instance; 