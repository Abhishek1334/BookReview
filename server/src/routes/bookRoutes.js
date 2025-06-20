import express from 'express';
import {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook
} from '../controllers/bookController.js';
import { verifyAccessToken, verifyAdmin } from '../middleware/authMiddleware.js';
import { uploadCoverImage, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getAllBooks);
router.get('/:id', getBookById);

// Protected routes with file upload
router.post('/', 
  verifyAccessToken, 
  verifyAdmin, 
  uploadCoverImage, 
  handleUploadError, 
  createBook
);

router.put('/:id', 
  verifyAccessToken, 
  uploadCoverImage, 
  handleUploadError, 
  updateBook
);

router.delete('/:id', verifyAccessToken, deleteBook);

export default router; 