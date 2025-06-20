import Book from '../models/Book.js';
import User from '../models/User.js';
import createError from '../utils/createError.js';
import Review from '../models/Review.js';
import { uploadImage, deleteImage, extractPublicId } from '../utils/cloudinary.js';

// Create a new book
export const createBook = async (req, res, next) => {
    try {
        const { title, author, description, genres } = req.body;
        
        // Parse genres if it's a string (from form-data)
        let parsedGenres = genres;
        if (typeof genres === 'string') {
            try {
                parsedGenres = JSON.parse(genres);
            } catch (error) {
                // If parsing fails, treat as single genre
                parsedGenres = [genres];
            }
        }

        if (!title || !author) {
            return next(createError(400, 'Title and author are required'));
        }

        let coverImageUrl = null;
        
        // Handle image upload if file is provided
        if (req.file) {
            try {
                coverImageUrl = await uploadImage(req.file.buffer);
            } catch (error) {
                console.error('Image upload error:', error);
                return next(createError(500, 'Failed to upload cover image'));
            }
        }

        const book = new Book({
            title,
            author,
            description,
            genres: parsedGenres,
            coverImage: coverImageUrl,
            createdBy: req.user.id
        });

        await book.save();
        res.status(201).json({ success: true, data: book });
    } catch (error) {
        console.error('Create book error:', error);
        next(createError(500, 'Server error during book creation'));
    }
};

// Get all books
export const getAllBooks = async (req, res, next) => {
    try {
        let { page = 1, limit = 10, search = '', genre, sort = '-createdAt' } = req.query;
        page = parseInt(page, 10);
        limit = parseInt(limit, 10);
        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(limit) || limit < 1) limit = 10;
        if (limit > 100) limit = 100;

        // Build query
        const query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } }
            ];
        }
        if (genre) {
            query.genres = genre;
        }

        // Only allow safe sort fields
        const allowedSortFields = ['createdAt', 'title', 'author'];
        let sortOption = '-createdAt';
        if (typeof sort === 'string' && sort.length > 0) {
            let sortField = sort.replace(/^-/, '');
            if (allowedSortFields.includes(sortField)) {
                sortOption = sort;
            }
        }

        const totalBooks = await Book.countDocuments(query);
        const totalPages = Math.ceil(totalBooks / limit);
        const books = await Book.find(query)
            .populate('createdBy', 'name email -_id')
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        // Aggregate review stats for all books in the page
        const bookIds = books.map(b => b._id);
        const reviewStats = await Review.aggregate([
            { $match: { book: { $in: bookIds } } },
            { $group: {
                _id: '$book',
                averageRating: { $avg: '$rating' },
                reviewCount: { $sum: 1 }
            }}
        ]);
        const statsMap = {};
        reviewStats.forEach(stat => {
            statsMap[stat._id.toString()] = {
                averageRating: stat.averageRating ? Math.round(stat.averageRating * 10) / 10 : null,
                reviewCount: stat.reviewCount || 0
            };
        });
        const booksWithStats = books.map(book => {
            const stats = statsMap[book._id.toString()] || { averageRating: null, reviewCount: 0 };
            return {
                ...book.toJSON(),
                averageRating: stats.averageRating,
                reviewCount: stats.reviewCount
            };
        });

        res.json({
            books: booksWithStats,
            totalBooks,
            totalPages,
            page,
            limit
        });
    } catch (error) {
        console.error('Get all books error:', error);
        next(createError(500, 'Server error fetching books'));
    }
};

// Get book by ID
export const getBookById = async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate('createdBy', 'name email -_id')
            .exec();
        if (!book) return next(createError(404, 'Book not found'));

        // Aggregate review stats for this book
        const reviewStats = await Review.aggregate([
            { $match: { book: book._id } },
            { $group: {
                _id: '$book',
                averageRating: { $avg: '$rating' },
                reviewCount: { $sum: 1 }
            }}
        ]);
        const stats = reviewStats[0] || { averageRating: null, reviewCount: 0 };
        res.json({
            ...book.toJSON(),
            averageRating: stats.averageRating ? Math.round(stats.averageRating * 10) / 10 : null,
            reviewCount: stats.reviewCount || 0
        });
    } catch (error) {
        console.error('Get book by ID error:', error);
        next(createError(500, 'Server error fetching book'));
    }
};

// Update book
export const updateBook = async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return next(createError(404, 'Book not found'));
        if (book.createdBy.toString() !== req.user.id) {
            return next(createError(403, 'You are not authorized to update this book'));
        }

        const { title, author, description, genres } = req.body;
        
        // Parse genres if it's a string (from form-data)
        let parsedGenres = genres;
        if (typeof genres === 'string') {
            try {
                parsedGenres = JSON.parse(genres);
            } catch (error) {
                // If parsing fails, treat as single genre
                parsedGenres = [genres];
            }
        }

        // Handle image upload if new file is provided
        let newCoverImageUrl = book.coverImage; // Keep existing image by default
        
        if (req.file) {
            try {
                // Delete old image from Cloudinary if it exists
                if (book.coverImage) {
                    const oldPublicId = extractPublicId(book.coverImage);
                    if (oldPublicId) {
                        try {
                            await deleteImage(oldPublicId);
                        } catch (deleteError) {
                            console.warn('Failed to delete old image:', deleteError.message);
                        }
                    }
                }
                
                // Upload new image
                newCoverImageUrl = await uploadImage(req.file.buffer);
            } catch (error) {
                console.error('Image upload error:', error);
                return next(createError(500, 'Failed to upload cover image'));
            }
        }

        // Update book fields
        if (title !== undefined) book.title = title;
        if (author !== undefined) book.author = author;
        if (description !== undefined) book.description = description;
        if (parsedGenres !== undefined) book.genres = parsedGenres;
        book.coverImage = newCoverImageUrl;

        await book.save();
        res.json({ success: true, data: book });
    } catch (error) {
        console.error('Update book error:', error);
        next(createError(500, 'Server error updating book'));
    }
};

// Delete book
export const deleteBook = async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return next(createError(404, 'Book not found'));
        
        // Get user details to check role
        const user = await User.findById(req.user.id);
        if (!user) return next(createError(401, 'User not found'));
        
        // Check authorization: admin can delete any book, regular users can only delete their own books
        const isAdmin = user.role === 'admin';
        const isCreator = book.createdBy.toString() === req.user.id;
        
        if (!isAdmin && !isCreator) {
            return next(createError(403, 'You are not authorized to delete this book'));
        }

        // Use transaction to ensure atomicity
        const session = await Book.startSession();
        let deleteReviewsResult;
        
        try {
            await session.withTransaction(async () => {
                // Delete all reviews associated with this book first
                deleteReviewsResult = await Review.deleteMany({ book: req.params.id }, { session });
                console.log(`Deleted ${deleteReviewsResult.deletedCount} reviews for book: ${book.title}`);

                // Delete the book
                await Book.findByIdAndDelete(req.params.id, { session });
            });
        } finally {
            await session.endSession();
        }

        // Delete cover image from Cloudinary (after successful database operations)
        if (book.coverImage) {
            const publicId = extractPublicId(book.coverImage);
            if (publicId) {
                try {
                    await deleteImage(publicId);
                } catch (deleteError) {
                    console.warn('Failed to delete image from Cloudinary:', deleteError.message);
                    // Don't fail the request if image deletion fails since the book is already deleted
                }
            }
        }
        
        res.json({ 
            success: true, 
            message: 'Book and all associated reviews deleted successfully',
            deletedReviewsCount: deleteReviewsResult?.deletedCount || 0
        });
    } catch (error) {
        console.error('Delete book error:', error);
        next(createError(500, 'Server error deleting book'));
    }
}; 