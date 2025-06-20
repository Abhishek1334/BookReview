import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwtUtils.js';
import { validationResult } from 'express-validator';
import createError from '../utils/createError.js';
import { verifyToken } from '../utils/jwtUtils.js';

// Register a new user
export const register = async (req, res, next) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(createError(400, 'Validation failed'));
        }

        const { name, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(createError(400, 'Email already registered'));
        }

        // Create new user
        const user = new User({ name, email, password });
        await user.save();

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Set refresh token in cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(201).json({
            message: 'User registered successfully',
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        next(createError(500, error.message || 'Server error'));
    }
};

// Login user
export const login = async (req, res, next) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(createError(400, 'Validation failed'));
        }

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return next(createError(401, 'Invalid credentials'));
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return next(createError(401, 'Invalid credentials'));
        }

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Set refresh token in cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            message: 'Login successful',
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        next(createError(500, error.message || 'Server error'));
    }
};

export const refreshToken = async (req, res, next) => {
    try {
        console.log('🔄 Refresh token endpoint called');
        console.log('📋 Headers:', req.headers);
        console.log('🍪 Cookies received:', req.cookies);
        
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            console.log('❌ No refresh token found in cookies');
            return next(createError(401, 'Refresh token missing'));
        }
        
        console.log('✅ Refresh token found, verifying...');
        let payload;
        try {
            payload = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
            console.log('✅ Token verified, payload:', { userId: payload.userId });
        } catch (err) {
            console.log('❌ Token verification failed:', err.message);
            return next(createError(403, 'Invalid or expired refresh token'));
        }
        
        const user = await User.findById(payload.userId).select('-password');
        if (!user) {
            console.log('❌ User not found for ID:', payload.userId);
            return next(createError(401, 'User not found'));
        }
        
        console.log('✅ User found, generating new access token');
        const accessToken = generateAccessToken(user._id);
        res.json({
            success: true,
            data: {
                accessToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        });
        console.log('✅ New access token sent successfully');
    } catch (error) {
        console.error('❌ Refresh token error:', error);
        next(createError(500, 'Server error during token refresh'));
    }
};

export const logout = async (req, res, next) => {
    try {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        });
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        next(createError(500, 'Server error during logout'));
    }
};
