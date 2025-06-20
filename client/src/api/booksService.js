import api from './axios';

/**
 * Books Service
 * Handles all book-related API calls with comprehensive validation and error handling
 */

// Input validation helpers
const validateBookId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return id.trim().length === 24 && /^[0-9a-fA-F]{24}$/.test(id); // MongoDB ObjectId validation
};

const validateTitle = (title) => {
  if (!title || typeof title !== 'string') return false;
  return title.trim().length >= 1 && title.trim().length <= 200;
};

const validateAuthor = (author) => {
  if (!author || typeof author !== 'string') return false;
  return author.trim().length >= 1 && author.trim().length <= 100;
};

const validateDescription = (description) => {
  if (!description) return true; // Optional field
  if (typeof description !== 'string') return false;
  return description.trim().length <= 2000;
};

const validateGenres = (genres) => {
  if (!genres) return true; // Optional field
  if (!Array.isArray(genres)) return false;
  return genres.length <= 10 && genres.every(genre => 
    typeof genre === 'string' && genre.trim().length > 0 && genre.trim().length <= 50
  );
};

const validateImageFile = (file) => {
  if (!file) return true; // Optional field
  
  // Check if it's a File object
  if (!(file instanceof File)) return false;
  
  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) return false;
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  return allowedTypes.includes(file.type);
};

// Sanitize text input
const sanitizeText = (text) => {
  if (typeof text !== 'string') return '';
  return text.trim().slice(0, 2000); // Prevent extremely long inputs
};

// Sanitize genres array
const sanitizeGenres = (genres) => {
  if (!Array.isArray(genres)) return [];
  return genres
    .filter(genre => typeof genre === 'string' && genre.trim().length > 0)
    .map(genre => sanitizeText(genre))
    .slice(0, 10); // Limit to 10 genres
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
  
  // Search validation
  if (params.search && typeof params.search === 'string') {
    const search = params.search.trim();
    if (search.length > 0 && search.length <= 100) {
      validatedParams.search = search;
    }
  }
  
  // Genre validation
  if (params.genre && typeof params.genre === 'string') {
    const genre = params.genre.trim();
    if (genre.length > 0 && genre.length <= 50) {
      validatedParams.genre = genre;
    }
  }
  
  // Sort validation
  if (params.sort && typeof params.sort === 'string') {
    const allowedSorts = ['createdAt', '-createdAt', 'title', '-title', 'author', '-author', 'averageRating', '-averageRating'];
    if (allowedSorts.includes(params.sort)) {
      validatedParams.sort = params.sort;
    }
  }
  
  return validatedParams;
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
      throw { message: 'Book not found', code: 'NOT_FOUND' };
    case 413:
      throw { message: 'File too large. Maximum size is 5MB.', code: 'FILE_TOO_LARGE' };
    case 415:
      throw { message: 'Invalid file type. Only JPEG, JPG, and PNG are allowed.', code: 'INVALID_FILE_TYPE' };
    case 429:
      throw { message: 'Too many requests. Please try again later.', code: 'RATE_LIMIT' };
    case 500:
      throw { message: 'Server error. Please try again later.', code: 'SERVER_ERROR' };
    default:
      throw { message, code: 'UNKNOWN_ERROR' };
  }
};

// Get all books with pagination, search, filter, and sorting
export const getBooks = async (params = {}) => {
  try {
    // Validate and sanitize parameters
    const validatedParams = validateQueryParams(params);
    
    const response = await api.get('/api/books', { params: validatedParams });
    
    // Validate response structure
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid response from server');
    }
    
    const { books = [], totalPages = 1, totalBooks = 0, page = 1, limit = 10 } = response.data;
    
    // Validate response data types
    if (!Array.isArray(books)) {
      throw new Error('Invalid books data received');
    }
    
    return {
      books,
      totalPages: Math.max(1, parseInt(totalPages) || 1),
      totalBooks: Math.max(0, parseInt(totalBooks) || 0),
      page: Math.max(1, parseInt(page) || 1),
      limit: Math.max(1, parseInt(limit) || 10)
    };
  } catch (error) {
    handleError(error, 'Failed to fetch books');
  }
};

// Get book by ID
export const getBookById = async (bookId) => {
  try {
    // Validate book ID
    if (!validateBookId(bookId)) {
      throw new Error('Invalid book ID format');
    }
    
    const response = await api.get(`/api/books/${bookId}`);
    
    // Validate response structure
    if (!response.data || !response.data._id) {
      throw new Error('Invalid book data received');
    }
    
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch book details');
  }
};

// Add a new book (admin only)
export const addBook = async (bookData) => {
  try {
    // Handle FormData directly (as it comes from the admin form)
    if (bookData instanceof FormData) {
      // Extract values from FormData for validation
      const title = bookData.get('title');
      const author = bookData.get('author');
      const description = bookData.get('description');
      const genres = bookData.get('genres');
      const coverImage = bookData.get('coverImage');
      
      // Validate required fields
      if (!validateTitle(title)) {
        throw new Error('Title is required and must be 1-200 characters long');
      }
      
      if (!validateAuthor(author)) {
        throw new Error('Author is required and must be 1-100 characters long');
      }
      
      // Validate optional fields
      if (description && !validateDescription(description)) {
        throw new Error('Description must be less than 2000 characters');
      }
      
      if (genres) {
        try {
          const parsedGenres = JSON.parse(genres);
          if (!validateGenres(parsedGenres)) {
            throw new Error('Genres must be an array with maximum 10 items');
          }
        } catch {
          throw new Error('Invalid genres format');
        }
      }
      
      if (coverImage && coverImage instanceof File && !validateImageFile(coverImage)) {
        throw new Error('Cover image must be JPEG, JPG, or PNG format and less than 5MB');
      }

      // Send FormData directly without Content-Type header (let browser set it)
      const response = await api.post('/api/books', bookData);
      
      // Validate response - API returns { success: true, data: { book object } }
      if (!response.data || !response.data.success || !response.data.data || !response.data.data._id) {
        throw new Error('Invalid response from server');
      }
      
      return response.data.data;
    }
    
    // Fallback for object input (legacy support)
    if (!bookData || typeof bookData !== 'object') {
      throw new Error('Invalid book data provided');
    }
    
    const { title, author, description, genres, coverImage } = bookData;
    
    // Validate required fields
    if (!validateTitle(title)) {
      throw new Error('Title is required and must be 1-200 characters long');
    }
    
    if (!validateAuthor(author)) {
      throw new Error('Author is required and must be 1-100 characters long');
    }
    
    // Validate optional fields
    if (!validateDescription(description)) {
      throw new Error('Description must be less than 2000 characters');
    }
    
    if (!validateGenres(genres)) {
      throw new Error('Genres must be an array with maximum 10 items');
    }
    
    if (!validateImageFile(coverImage)) {
      throw new Error('Cover image must be JPEG, JPG, or PNG format and less than 5MB');
    }
    
    // Create FormData for file upload
    const formData = new FormData();
    
    // Add sanitized text fields
    formData.append('title', sanitizeText(title));
    formData.append('author', sanitizeText(author));
    
    if (description) {
      formData.append('description', sanitizeText(description));
    }
    
    // Handle genres
    if (genres && genres.length > 0) {
      const sanitizedGenres = sanitizeGenres(genres);
      formData.append('genres', JSON.stringify(sanitizedGenres));
    }
    
    // Add cover image if provided
    if (coverImage instanceof File) {
      formData.append('coverImage', coverImage);
    }

    const response = await api.post('/api/books', formData);
    
    // Validate response - API returns { success: true, data: { book object } }
    if (!response.data || !response.data.success || !response.data.data || !response.data.data._id) {
      throw new Error('Invalid response from server');
    }
    
    return response.data.data;
  } catch (error) {
    handleError(error, 'Failed to add book');
  }
};

// Update a book (creator only)
export const updateBook = async (bookId, bookData) => {
  try {
    // Validate book ID
    if (!validateBookId(bookId)) {
      throw new Error('Invalid book ID format');
    }
    
    // Handle FormData directly (as it comes from the admin form)
    if (bookData instanceof FormData) {
      // Extract values from FormData for validation
      const title = bookData.get('title');
      const author = bookData.get('author');
      const description = bookData.get('description');
      const genres = bookData.get('genres');
      const coverImage = bookData.get('coverImage');
      
      // Validate fields if provided (all optional for updates)
      if (title && !validateTitle(title)) {
        throw new Error('Title must be 1-200 characters long');
      }
      
      if (author && !validateAuthor(author)) {
        throw new Error('Author must be 1-100 characters long');
      }
      
      // Validate optional fields
      if (description && !validateDescription(description)) {
        throw new Error('Description must be less than 2000 characters');
      }
      
      if (genres) {
        try {
          const parsedGenres = JSON.parse(genres);
          if (!validateGenres(parsedGenres)) {
            throw new Error('Genres must be an array with maximum 10 items');
          }
        } catch {
          throw new Error('Invalid genres format');
        }
      }
      
      if (coverImage && coverImage instanceof File && !validateImageFile(coverImage)) {
        throw new Error('Cover image must be JPEG, JPG, or PNG format and less than 5MB');
      }

      // Send FormData directly without Content-Type header (let browser set it)
      const response = await api.put(`/api/books/${bookId}`, bookData);
      
      // Validate response - API returns { success: true, data: { book object } }
      if (!response.data || !response.data.success || !response.data.data || !response.data.data._id) {
        throw new Error('Invalid response from server');
      }
      
      return response.data.data;
    }
    
    // Input validation for object data
    if (!bookData || typeof bookData !== 'object') {
      throw new Error('Invalid book data provided');
    }
    
    const { title, author, description, genres, coverImage } = bookData;
    
    // Validate fields if provided (all optional for updates)
    if (title !== undefined && !validateTitle(title)) {
      throw new Error('Title must be 1-200 characters long');
    }
    
    if (author !== undefined && !validateAuthor(author)) {
      throw new Error('Author must be 1-100 characters long');
    }
    
    if (description !== undefined && !validateDescription(description)) {
      throw new Error('Description must be less than 2000 characters');
    }
    
    if (genres !== undefined && !validateGenres(genres)) {
      throw new Error('Genres must be an array with maximum 10 items');
    }
    
    if (coverImage !== undefined && !validateImageFile(coverImage)) {
      throw new Error('Cover image must be JPEG, JPG, or PNG format and less than 5MB');
    }

    let requestData;
    let headers = {};

    // Check if we have a file to upload
    if (coverImage instanceof File) {
      const formData = new FormData();
      
      // Add text fields if they exist
      if (title !== undefined) formData.append('title', sanitizeText(title));
      if (author !== undefined) formData.append('author', sanitizeText(author));
      if (description !== undefined) formData.append('description', sanitizeText(description));
      
      // Handle genres
      if (genres !== undefined) {
        const sanitizedGenres = sanitizeGenres(genres);
        formData.append('genres', JSON.stringify(sanitizedGenres));
      }
      
      formData.append('coverImage', coverImage);
      requestData = formData;
      headers['Content-Type'] = 'multipart/form-data';
    } else {
      // No file upload, send as JSON
      requestData = {};
      if (title !== undefined) requestData.title = sanitizeText(title);
      if (author !== undefined) requestData.author = sanitizeText(author);
      if (description !== undefined) requestData.description = sanitizeText(description);
      if (genres !== undefined) requestData.genres = sanitizeGenres(genres);
    }

    const response = await api.put(`/api/books/${bookId}`, requestData, { headers });
    
    // Validate response - API returns { success: true, data: { book object } }
    if (!response.data || !response.data.success || !response.data.data || !response.data.data._id) {
      throw new Error('Invalid response from server');
    }
    
    return response.data.data;
  } catch (error) {
    handleError(error, 'Failed to update book');
  }
};

// Delete a book (creator only)
export const deleteBook = async (bookId) => {
  try {
    // Validate book ID
    if (!validateBookId(bookId)) {
      throw new Error('Invalid book ID format');
    }
    
    const response = await api.delete(`/api/books/${bookId}`);
    // API returns { success: true, message: "Book deleted successfully" }
    return response.data || { message: 'Book deleted successfully' };
  } catch (error) {
    handleError(error, 'Failed to delete book');
  }
};

// Get available genres (static list since no API endpoint exists)
export const getGenres = async () => {
  // Return hardcoded genres since backend doesn't have /api/books/genres endpoint
  return [
    'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
    'Fantasy', 'Biography', 'History', 'Self-Help', 'Business',
    'Philosophy', 'Poetry', 'Horror', 'Thriller', 'Young Adult',
    'Children', 'Memoir', 'Travel', 'Health', 'Cooking',
    'Art', 'Music', 'Sports', 'Politics', 'Religion'
  ];
};

export default {
  getBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
  getGenres
}; 