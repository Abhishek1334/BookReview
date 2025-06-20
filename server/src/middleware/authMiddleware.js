import { verifyToken } from '../utils/jwtUtils.js';
import createError from '../utils/createError.js';
import User from '../models/User.js';

const verifyAccessToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(createError(401, 'No token provided'));
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = verifyToken(token);
        req.user = { id: decoded.userId };
        next();
    } catch (err) {
        return next(createError(401, 'Invalid or expired token'));
    }
};

const verifyAdmin = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return next(createError(401, 'Authentication required'));
        }
        const user = await User.findById(req.user.id);
        if (!user) {
            return next(createError(401, 'User not found'));
        }
        if (user.role !== 'admin') {
            return next(createError(403, 'Admin access required'));
        }
        next();
    } catch (error) {
        console.error('verifyAdmin error:', error);
        next(createError(500, 'Server error during admin check'));
    }
};

export { verifyAccessToken, verifyAdmin }; 