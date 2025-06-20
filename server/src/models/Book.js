import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    genres: [{
        type: String,
        trim: true
    }],
    coverImage: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

bookSchema.virtual('averageRating');
bookSchema.virtual('reviewCount');

export default mongoose.model('Book', bookSchema); 