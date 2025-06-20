import express from 'express';
import {
  createReview,
  getReviewsForBook,
  updateReview,
  deleteReview,
  getAllReviews
} from '../controllers/reviewController.js';
import { verifyAccessToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/:bookId', getReviewsForBook);
router.get('/', getAllReviews);

// Protected
router.post('/:bookId', verifyAccessToken, createReview);
router.put('/:reviewId', verifyAccessToken, updateReview);
router.delete('/:reviewId', verifyAccessToken, deleteReview);

export default router; 