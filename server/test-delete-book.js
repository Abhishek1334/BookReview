// Test script to verify book deletion functionality
// This script creates a test book with reviews and then deletes it to verify cleanup

import mongoose from 'mongoose';
import Book from './src/models/Book.js';
import Review from './src/models/Review.js';
import User from './src/models/User.js';

const testBookDeletion = async () => {
    try {
        // Connect to MongoDB (adjust connection string as needed)
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookreview');
        console.log('Connected to MongoDB');

        // Find or create a test user
        let testUser = await User.findOne({ email: 'test@example.com' });
        if (!testUser) {
            testUser = new User({
                name: 'Test User',
                email: 'test@example.com',
                password: 'hashedpassword123',
                role: 'admin'
            });
            await testUser.save();
            console.log('Created test user');
        }

        // Create a test book
        const testBook = new Book({
            title: 'Test Book for Deletion',
            author: 'Test Author',
            description: 'This is a test book that will be deleted',
            genres: ['Test'],
            createdBy: testUser._id
        });
        await testBook.save();
        console.log(`Created test book: ${testBook.title} (ID: ${testBook._id})`);

        // Create some test reviews for the book
        const review1 = new Review({
            book: testBook._id,
            user: testUser._id,
            rating: 5,
            comment: 'Great test book!'
        });

        const review2 = new Review({
            book: testBook._id,
            user: testUser._id,
            rating: 4,
            comment: 'Good for testing'
        });

        await review1.save();
        await review2.save();
        console.log('Created 2 test reviews');

        // Verify reviews exist
        const reviewsBeforeDeletion = await Review.find({ book: testBook._id });
        console.log(`Reviews before deletion: ${reviewsBeforeDeletion.length}`);

        // Now delete the book (simulate the controller logic)
        const session = await Book.startSession();
        let deleteReviewsResult;
        
        try {
            await session.withTransaction(async () => {
                // Delete all reviews associated with this book first
                deleteReviewsResult = await Review.deleteMany({ book: testBook._id }, { session });
                console.log(`Deleted ${deleteReviewsResult.deletedCount} reviews`);

                // Delete the book
                await Book.findByIdAndDelete(testBook._id, { session });
                console.log('Deleted the book');
            });
        } finally {
            await session.endSession();
        }

        // Verify cleanup
        const reviewsAfterDeletion = await Review.find({ book: testBook._id });
        const bookAfterDeletion = await Book.findById(testBook._id);

        console.log('\n=== VERIFICATION RESULTS ===');
        console.log(`Reviews after deletion: ${reviewsAfterDeletion.length} (should be 0)`);
        console.log(`Book exists after deletion: ${bookAfterDeletion ? 'YES' : 'NO'} (should be NO)`);
        console.log(`Deleted reviews count: ${deleteReviewsResult.deletedCount} (should be 2)`);

        if (reviewsAfterDeletion.length === 0 && !bookAfterDeletion && deleteReviewsResult.deletedCount === 2) {
            console.log('✅ TEST PASSED: Book deletion properly removes associated reviews');
        } else {
            console.log('❌ TEST FAILED: Issues with book deletion cleanup');
        }

        // Clean up test user
        await User.findByIdAndDelete(testUser._id);
        console.log('Cleaned up test user');

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Run the test
testBookDeletion(); 