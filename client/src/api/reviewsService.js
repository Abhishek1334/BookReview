import api from './axios';

/**
 * Reviews Service
 * Handles all review-related API calls with comprehensive validation and error handling
 */

// Input validation helpers
const validateObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return id.trim().length === 24 && /^[0-9a-fA-F]{24}$/.test(id); // MongoDB ObjectId validation
};

const validateRating = (rating) => {
  const num = Number(rating);
  return Number.isInteger(num) && num >= 1 && num <= 5;
};

const validateComment = (comment) => {
  if (!comment) return true; // Optional field
  if (typeof comment !== 'string') return false;
  return comment.trim().length <= 2000;
};

// Query parameters validation
const validateQueryParams = (params) => {
  const validatedParams = {};
  
  // Page validation
  if (params.page !== undefined) {
    const page = parseInt(params.page);
    if (Number.isInteger(page) && page >= 1 && page <= 1000) {
      validatedParams.page = page;
    }
  }
  
  // Limit validation
  if (params.limit !== undefined) {
    const limit = parseInt(params.limit);
    if (Number.isInteger(limit) && limit >= 1 && limit <= 100) {
      validatedParams.limit = limit;
    }
  }
  
  // Book ID validation
  if (params.book && validateObjectId(params.book)) {
    validatedParams.book = params.book;
  }
  
  // User ID validation
  if (params.user && validateObjectId(params.user)) {
    validatedParams.user = params.user;
  }
  
  // Sort validation
  if (params.sort && typeof params.sort === 'string') {
    const allowedSorts = ['createdAt', '-createdAt', 'rating', '-rating', 'updatedAt', '-updatedAt'];
    if (allowedSorts.includes(params.sort)) {
      validatedParams.sort = params.sort;
    }
  }
  
  return validatedParams;
};

// Sanitize text input
const sanitizeText = (text) => {
  if (typeof text !== 'string') return '';
  return text.trim().slice(0, 2000); // Prevent extremely long inputs
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
      throw { message: 'Review or book not found', code: 'NOT_FOUND' };
    case 409:
      throw { message: 'You have already reviewed this book', code: 'CONFLICT' };
    case 429:
      throw { message: 'Too many requests. Please try again later.', code: 'RATE_LIMIT' };
    case 500:
      throw { message: 'Server error. Please try again later.', code: 'SERVER_ERROR' };
    default:
      throw { message, code: 'UNKNOWN_ERROR' };
  }
};

// Get all reviews with pagination and filters
export const getAllReviews = async (params = {}) => {
  try {
    // Validate and sanitize parameters
    const validatedParams = validateQueryParams(params);
    
    const response = await api.get('/api/reviews', { params: validatedParams });
    
    // Validate response structure
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid response from server');
    }
    
    const { 
      reviews = [], 
      totalReviews = 0, 
      totalPages = 1, 
      page = 1, 
      limit = 10 
    } = response.data;
    
    // Validate response data types
    if (!Array.isArray(reviews)) {
      throw new Error('Invalid reviews data received');
    }
    
    return {
      reviews,
      totalReviews: Math.max(0, parseInt(totalReviews) || 0),
      totalPages: Math.max(1, parseInt(totalPages) || 1),
      page: Math.max(1, parseInt(page) || 1),
      limit: Math.max(1, parseInt(limit) || 10)
    };
  } catch (error) {
    handleError(error, 'Failed to fetch reviews');
  }
};

// Get reviews for a specific book
export const getBookReviews = async (bookId) => {
  try {
    // Validate book ID
    if (!validateObjectId(bookId)) {
      throw new Error('Invalid book ID format');
    }
    
    const response = await api.get(`/api/reviews/${bookId}`);
    
    // Validate response structure - API returns { success: true, data: [...] }
    if (!response.data || !response.data.success || !Array.isArray(response.data.data)) {
      throw new Error('Invalid reviews data received');
    }
    
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch book reviews');
  }
};

// Add a review for a book
export const addReview = async (bookId, reviewData) => {
  try {
    // Validate book ID
    if (!validateObjectId(bookId)) {
      throw new Error('Invalid book ID format');
    }
    
    // Input validation
    if (!reviewData || typeof reviewData !== 'object') {
      throw new Error('Invalid review data provided');
    }
    
    const { rating, comment } = reviewData;
    
    // Validate required fields
    if (!validateRating(rating)) {
      throw new Error('Rating must be an integer between 1 and 5');
    }
    
    // Validate optional fields
    if (!validateComment(comment)) {
      throw new Error('Comment must be less than 2000 characters');
    }
    
    // Sanitize input
    const sanitizedData = {
      rating: parseInt(rating),
      ...(comment && { comment: sanitizeText(comment) })
    };
    
    const response = await api.post(`/api/reviews/${bookId}`, sanitizedData);
    
    // Validate response - API returns { success: true, data: { review object } }
    if (!response.data || !response.data.success || !response.data.data || !response.data.data._id) {
      throw new Error('Invalid response from server');
    }
    
    return response.data.data;
  } catch (error) {
    handleError(error, 'Failed to add review');
  }
};

// Update a review
export const updateReview = async (reviewId, reviewData) => {
  try {
    // Validate review ID
    if (!validateObjectId(reviewId)) {
      throw new Error('Invalid review ID format');
    }
    
    // Input validation
    if (!reviewData || typeof reviewData !== 'object') {
      throw new Error('Invalid review data provided');
    }
    
    const { rating, comment } = reviewData;
    
    // Validate fields if provided (all optional for updates)
    if (rating !== undefined && !validateRating(rating)) {
      throw new Error('Rating must be an integer between 1 and 5');
    }
    
    if (comment !== undefined && !validateComment(comment)) {
      throw new Error('Comment must be less than 2000 characters');
    }
    
    // Sanitize input
    const sanitizedData = {};
    if (rating !== undefined) sanitizedData.rating = parseInt(rating);
    if (comment !== undefined) sanitizedData.comment = sanitizeText(comment);
    
    // Ensure at least one field is being updated
    if (Object.keys(sanitizedData).length === 0) {
      throw new Error('At least one field (rating or comment) must be provided for update');
    }
    
    const response = await api.put(`/api/reviews/${reviewId}`, sanitizedData);
    
    // Validate response - API returns { success: true, data: { review object } }
    if (!response.data || !response.data.success || !response.data.data || !response.data.data._id) {
      throw new Error('Invalid response from server');
    }
    
    return response.data.data;
  } catch (error) {
    handleError(error, 'Failed to update review');
  }
};

// Delete a review
export const deleteReview = async (reviewId) => {
  try {
    // Validate review ID
    if (!validateObjectId(reviewId)) {
      throw new Error('Invalid review ID format');
    }
    
    const response = await api.delete(`/api/reviews/${reviewId}`);
    // API returns { success: true, message: "Review deleted successfully" }
    return response.data || { message: 'Review deleted successfully' };
  } catch (error) {
    handleError(error, 'Failed to delete review');
  }
};

// Get user's review for a specific book
export const getUserBookReview = async (bookId, userId) => {
  try {
    // Validate IDs
    if (!validateObjectId(bookId)) {
      throw new Error('Invalid book ID format');
    }
    
    if (!validateObjectId(userId)) {
      throw new Error('Invalid user ID format');
    }
    
    const params = { book: bookId, user: userId, limit: 1 };
    const response = await api.get('/api/reviews', { params });
    
    // API returns { success: true, reviews: [...] } - Return the first review or null
    return response.data?.reviews?.[0] || null;
  } catch (error) {
    // Return null for any error - this is a helper function
    console.warn('Failed to fetch user review:', error);
    return null;
  }
};

// Get reviews by user
export const getUserReviews = async (userId, params = {}) => {
  try {
    // Validate user ID
    if (!validateObjectId(userId)) {
      throw new Error('Invalid user ID format');
    }
    
    // Validate and sanitize parameters
    const allParams = { ...params, user: userId };
    const validatedParams = validateQueryParams(allParams);
    
    const response = await api.get('/api/reviews', { params: validatedParams });
    
    // Validate response structure
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid response from server');
    }
    
    const { 
      reviews = [], 
      totalReviews = 0, 
      totalPages = 1, 
      page = 1, 
      limit = 10 
    } = response.data;
    
    // Validate response data types
    if (!Array.isArray(reviews)) {
      throw new Error('Invalid reviews data received');
    }
    
    return {
      reviews,
      totalReviews: Math.max(0, parseInt(totalReviews) || 0),
      totalPages: Math.max(1, parseInt(totalPages) || 1),
      page: Math.max(1, parseInt(page) || 1),
      limit: Math.max(1, parseInt(limit) || 10)
    };
  } catch (error) {
    handleError(error, 'Failed to fetch user reviews');
  }
};

// Utility function to check if user can review a book
export const canUserReviewBook = async (bookId, userId) => {
  try {
    if (!validateObjectId(bookId) || !validateObjectId(userId)) {
      return false;
    }
    
    const existingReview = await getUserBookReview(bookId, userId);
    return !existingReview; // Can review if no existing review found
  } catch (error) {
    console.warn('Failed to check review eligibility:', error);
    return false;
  }
};

export default {
  getAllReviews,
  getBookReviews,
  addReview,
  updateReview,
  deleteReview,
  getUserBookReview,
  getUserReviews,
  canUserReviewBook
}; 