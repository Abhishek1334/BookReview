import Review from '../models/Review.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import createError from '../utils/createError.js';

// Create a review
export const createReview = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;
        const { bookId } = req.params;
        if (!rating || rating < 1 || rating > 5) {
            return next(createError(400, 'Rating must be between 1 and 5'));
        }
        // Check if book exists
        const book = await Book.findById(bookId);
        if (!book) return next(createError(404, 'Book not found'));
        // Check if user already reviewed this book
        const existing = await Review.findOne({ book: bookId, user: req.user.id });
        if (existing) return next(createError(400, 'You have already reviewed this book'));
        const review = new Review({
            book: bookId,
            user: req.user.id,
            rating,
            comment
        });
        await review.save();
        res.status(201).json({ success: true, data: review });
    } catch (error) {
        if (error.code === 11000) {
            return next(createError(400, 'You have already reviewed this book'));
        }
        console.error('Create review error:', error);
        next(createError(500, 'Server error creating review'));
    }
};

// Get all reviews for a book
export const getReviewsForBook = async (req, res, next) => {
    try {
        const { bookId } = req.params;
        const reviews = await Review.find({ book: bookId })
            .populate('user', 'name email -_id')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: reviews });
    } catch (error) {
        console.error('Get reviews error:', error);
        next(createError(500, 'Server error fetching reviews'));
    }
};

// Update a review
export const updateReview = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
        const review = await Review.findById(reviewId);
        if (!review) return next(createError(404, 'Review not found'));
        if (review.user.toString() !== req.user.id) {
            return next(createError(403, 'You are not authorized to update this review'));
        }
        if (rating !== undefined) {
            if (rating < 1 || rating > 5) {
                return next(createError(400, 'Rating must be between 1 and 5'));
            }
            review.rating = rating;
        }
        if (comment !== undefined) review.comment = comment;
        await review.save();
        res.json({ success: true, data: review });
    } catch (error) {
        console.error('Update review error:', error);
        next(createError(500, 'Server error updating review'));
    }
};

// Delete a review
export const deleteReview = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const review = await Review.findById(reviewId);
        if (!review) return next(createError(404, 'Review not found'));
        
        // Get user details to check role
        const user = await User.findById(req.user.id);
        if (!user) return next(createError(401, 'User not found'));
        
        // Check authorization: admin can delete any review, regular users can only delete their own reviews
        const isAdmin = user.role === 'admin';
        const isReviewOwner = review.user.toString() === req.user.id;
        
        if (!isAdmin && !isReviewOwner) {
            return next(createError(403, 'You are not authorized to delete this review'));
        }
        
        await review.deleteOne();
        res.json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Delete review error:', error);
        next(createError(500, 'Server error deleting review'));
    }
};

export const getAllReviews = async (req, res, next) => {
    try {
        let { page = 1, limit = 10, book, user, sort = '-createdAt' } = req.query;
        page = parseInt(page, 10);
        limit = parseInt(limit, 10);
        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(limit) || limit < 1) limit = 10;
        if (limit > 100) limit = 100;

        const query = {};
        if (book) query.book = book;
        if (user) query.user = user;

        const totalReviews = await Review.countDocuments(query);
        const totalPages = Math.ceil(totalReviews / limit);
        const reviews = await Review.find(query)
            .populate('user', 'name email -_id')
            .populate('book', 'title author coverImage genres')
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        res.json({
            success: true,
            reviews,
            totalReviews,
            totalPages,
            page,
            limit
        });
    } catch (error) {
        console.error('Get all reviews error:', error);
        next(createError(500, 'Server error fetching reviews'));
    }
}; 