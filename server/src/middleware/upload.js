import multer from 'multer';
import createError from '../utils/createError.js';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
    // Check if file is an image
    if (!file.mimetype.startsWith('image/')) {
        return cb(createError(400, 'Only image files are allowed'), false);
    }
    
    // Check allowed image types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(createError(400, 'Only JPEG, JPG, and PNG files are allowed'), false);
    }
    
    cb(null, true);
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1, // Maximum 1 file
    },
});

// Middleware for single cover image upload
export const uploadCoverImage = upload.single('coverImage');

// Error handling middleware for multer errors
export const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return next(createError(400, 'File size too large. Maximum size is 5MB'));
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return next(createError(400, 'Too many files. Only one file is allowed'));
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return next(createError(400, 'Unexpected field name. Use "coverImage" for the file field'));
        }
        return next(createError(400, `Upload error: ${error.message}`));
    }
    
    // If it's not a multer error, pass it to the next error handler
    next(error);
};

export default upload; 