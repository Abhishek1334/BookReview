import api from './axios';

/**
 * Authentication Service
 * Handles all auth-related API calls with comprehensive validation and error handling
 */

// Input validation helpers
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6;
};

const validateName = (name) => {
  if (!name || typeof name !== 'string') return false;
  return name.trim().length >= 2;
};

// Sanitize user input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, 1000); // Prevent extremely long inputs
};

// Error message parser
const parseErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Network error handler
const handleNetworkError = (error) => {
  if (!error.response) {
    return {
      message: 'Network error. Please check your internet connection.',
      code: 'NETWORK_ERROR'
    };
  }
  
  const status = error.response.status;
  const message = parseErrorMessage(error);
  
  switch (status) {
    case 400:
      return { message, code: 'VALIDATION_ERROR' };
    case 401:
      return { message: 'Invalid credentials', code: 'UNAUTHORIZED' };
    case 403:
      return { message: 'Access forbidden', code: 'FORBIDDEN' };
    case 409:
      return { message: 'Account already exists', code: 'CONFLICT' };
    case 429:
      return { message: 'Too many requests. Please try again later.', code: 'RATE_LIMIT' };
    case 500:
      return { message: 'Server error. Please try again later.', code: 'SERVER_ERROR' };
    default:
      return { message, code: 'UNKNOWN_ERROR' };
  }
};

// Register a new user
export const registerUser = async (userData) => {
  try {
    // Input validation
    if (!userData || typeof userData !== 'object') {
      throw new Error('Invalid user data provided');
    }

    const { name, email, password } = userData;

    // Validate required fields
    if (!validateName(name)) {
      throw new Error('Name must be at least 2 characters long');
    }
    
    if (!validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }
    
    if (!validatePassword(password)) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Sanitize input
    const sanitizedData = {
      name: sanitizeInput(name),
      email: sanitizeInput(email).toLowerCase(),
      password: password // Don't sanitize password to preserve special characters
    };

    const response = await api.post('/auth/register', sanitizedData);
    
    // Validate response structure
    if (!response.data || !response.data.accessToken || !response.data.user) {
      throw new Error('Invalid response from server');
    }

    return response.data;
  } catch (error) {
    const errorDetails = handleNetworkError(error);
    throw errorDetails;
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    // Input validation
    if (!credentials || typeof credentials !== 'object') {
      throw new Error('Invalid credentials provided');
    }

    const { email, password } = credentials;

    if (!validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }
    
    if (!password || typeof password !== 'string') {
      throw new Error('Password is required');
    }

    // Sanitize input
    const sanitizedCredentials = {
      email: sanitizeInput(email).toLowerCase(),
      password: password
    };

    const response = await api.post('/auth/login', sanitizedCredentials);
    
    // Validate response structure
    if (!response.data || !response.data.accessToken || !response.data.user) {
      throw new Error('Invalid response from server');
    }

    return response.data;
  } catch (error) {
    const errorDetails = handleNetworkError(error);
    throw errorDetails;
  }
};

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
  
  console.log('🧹 AuthService: All authentication data cleared from localStorage');
};

// Refresh access token
export const refreshToken = async () => {
  try {
    const response = await api.post('/auth/refresh');
    
    // Validate response structure - backend returns { success: true, data: { accessToken, user } }
    if (!response.data || !response.data.success || !response.data.data || !response.data.data.accessToken) {
      throw new Error('Invalid response from server');
    }

    const { accessToken, user } = response.data.data;
    
    // Update localStorage
    localStorage.setItem('accessToken', accessToken);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }

    return response.data.data;
  } catch (error) {
    // Refresh failed - refresh token expired, clear all auth data
    console.log('❌ AuthService: Refresh token expired, clearing all auth data');
    clearAllAuthData();
    throw new Error('Session expired');
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    const response = await api.post('/auth/logout');
    
    // Always clear local storage, even if API call fails
    clearAllAuthData();
    
    return response.data || { message: 'Logged out successfully' };
  } catch (error) {
    // Clear local data even if API call fails
    clearAllAuthData();
    
    // Don't throw error for logout failures - user intent is to logout
    console.warn('Logout API call failed, but local data cleared:', error);
    return { message: 'Logged out successfully' };
  }
};

// Get current user info
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    
    // Validate response structure - /auth/me returns { success: true, data: { id, name, email, role } }
    if (!response.data || !response.data.data || !response.data.data.id) {
      throw new Error('Invalid user data received from server');
    }

    return response.data.data;
  } catch (error) {
    const errorDetails = handleNetworkError(error);
    
    // Special handling for unauthorized errors
    if (errorDetails.code === 'UNAUTHORIZED') {
      clearAllAuthData();
    }
    
    throw errorDetails;
  }
};

// Utility function to check if user is authenticated
export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    
    if (!token || !user) return false;
    
    // Try to parse user data
    JSON.parse(user);
    return true;
  } catch {
    // Clear corrupted data
    clearAllAuthData();
    return false;
  }
};

// Utility function to get stored user data
export const getStoredUser = () => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Failed to parse stored user data:', error);
    clearAllAuthData();
    return null;
  }
};

export default {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getCurrentUser,
  isAuthenticated,
  getStoredUser
}; 