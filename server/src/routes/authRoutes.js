import express from 'express';
import { body } from 'express-validator';
import { register, login, refreshToken, logout } from '../controllers/authController.js';
import { verifyAccessToken } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import createError from '../utils/createError.js';

const router = express.Router();

// Register validation rules
const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];

// Login validation rules
const loginValidation = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

// GET /me - get current user info
router.get('/me', verifyAccessToken, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return next(createError(404, 'User not found'));
        res.json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        next(createError(500, err.message || 'Server error'));
    }
});

export default router;
