import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import bookRoutes from './routes/bookRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import userRoutes from './routes/userRoutes.js';


// Load environment variables
dotenv.config({ path: './.env' });

const app = express();

// Middleware
const allowedOrigins = [
    'http://localhost:5173', // Vite default
    'http://localhost:3000', // React dev server
    'http://localhost:4173', // Vite preview
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
];

// Add CLIENT_URL from environment variables if it exists
if (process.env.CLIENT_URL) {
    allowedOrigins.push(process.env.CLIENT_URL);
    console.log(`✅ Added CLIENT_URL to CORS: ${process.env.CLIENT_URL}`);
}

// Log all allowed origins on startup
console.log('📋 CORS allowed origins:', allowedOrigins);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            console.log(`✅ CORS: Allowed origin - ${origin}`);
            callback(null, true);
        } else {
            console.warn(`❌ CORS: Blocked origin - ${origin}`);
            console.log(`📋 Allowed origins: ${allowedOrigins.join(', ')}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/users', userRoutes);

// Health check route
app.get('/', (req, res) => {
    res.json({ message: 'Book Review Platform API is running' });
});

// Centralized error handler
app.use(errorHandler);

export default app;