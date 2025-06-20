import api from './axios';

/**
 * Users Service
 * Handles all user-related API calls with comprehensive validation and error handling
 */

// Input validation helpers
const validateUserId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return id.trim().length === 24 && /^[0-9a-fA-F]{24}$/.test(id); // MongoDB ObjectId validation
};

const validateName = (name) => {
  if (!name || typeof name !== 'string') return false;
  return name.trim().length >= 2 && name.trim().length <= 100;
};

// Sanitize text input
const sanitizeText = (text) => {
  if (typeof text !== 'string') return '';
  return text.trim().slice(0, 1000); // Prevent extremely long inputs
};

// Error handler
const handleError = (error, defaultMessage) => {
  if (!error.response) {
    throw {
      message: 'Network error. Please check your internet connection.',
      code: 'NETWORK_ERROR'
    };
  }
  
  const status = error.response.status;
  const message = error.response?.data?.message || error.message || defaultMessage;
  
  switch (status) {
    case 400:
      throw { message, code: 'VALIDATION_ERROR' };
    case 401:
      throw { message: 'Authentication required', code: 'UNAUTHORIZED' };
    case 403:
      throw { message: 'Permission denied', code: 'FORBIDDEN' };
    case 404:
      throw { message: 'User not found', code: 'NOT_FOUND' };
    case 409:
      throw { message: 'Email already exists', code: 'CONFLICT' };
    case 429:
      throw { message: 'Too many requests. Please try again later.', code: 'RATE_LIMIT' };
    case 500:
      throw { message: 'Server error. Please try again later.', code: 'SERVER_ERROR' };
    default:
      throw { message, code: 'UNKNOWN_ERROR' };
  }
};

// Get user profile by ID
export const getUserProfile = async (userId) => {
  try {
    // Validate user ID
    if (!validateUserId(userId)) {
      throw new Error('Invalid user ID format');
    }
    
    const response = await api.get(`/users/${userId}`);
    
    // Validate response structure
    if (!response.data || !response.data._id) {
      throw new Error('Invalid user data received from server');
    }
    
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch user profile');
  }
};

// Update user profile (name only, as per backend API)
export const updateUserProfile = async (userId, profileData) => {
  try {
    // Validate user ID
    if (!validateUserId(userId)) {
      throw new Error('Invalid user ID format');
    }
    
    // Input validation
    if (!profileData || typeof profileData !== 'object') {
      throw new Error('Invalid profile data provided');
    }
    
    const { name } = profileData;
    
    // Validate name (required field as per API docs)
    if (!validateName(name)) {
      throw new Error('Name is required and must be 2-100 characters long');
    }
    
    // Sanitize input
    const requestData = {
      name: sanitizeText(name)
    };

    const response = await api.put(`/users/${userId}`, requestData);
    
    // Validate response
    if (!response.data || !response.data._id) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to update user profile');
  }
};

// Get user statistics (mock implementation since no API endpoint exists)
export const getUserStats = async (userId) => {
  try {
    // Since there's no /users/:id/stats endpoint, we'll calculate from reviews
    // This is a client-side aggregation from reviews API
    const reviewsResponse = await api.get('/api/reviews', { 
      params: { user: userId, limit: 1000 } 
    });
    
    const reviews = reviewsResponse.data?.reviews || [];
    const totalReviews = reviews.length;
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;
    
    // Get user profile for join date (backend doesn't include createdAt in user profile)
    // We'll use the oldest review date as a fallback for join date
    const userProfile = await getUserProfile(userId);
    const oldestReviewDate = reviews.length > 0 
      ? reviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0]?.createdAt
      : null;
    
    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      joinedDate: userProfile.createdAt || oldestReviewDate || new Date().toISOString(),
      recentActivity: reviews.slice(0, 5), // Last 5 reviews
      favoriteGenres: [] // Would need book data to calculate this
    };
  } catch (error) {
    // For stats, return default values if calculation fails
    console.warn('Failed to calculate user stats, returning defaults:', error);
    return {
      totalReviews: 0,
      averageRating: 0,
      joinedDate: new Date().toISOString(),
      recentActivity: [],
      favoriteGenres: []
    };
  }
};



export default {
  getUserProfile,
  updateUserProfile,
  getUserStats
}; 