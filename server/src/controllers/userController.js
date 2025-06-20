import User from '../models/User.js';
import createError from '../utils/createError.js';

// Get user profile by ID
export const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('_id name email role');
        if (!user) {
            return next(createError(404, 'User not found'));
        }
        res.json(user);
    } catch (error) {
        next(createError(500, 'Server error fetching user'));
    }
};

// Update user profile (name only)
export const updateUserProfile = async (req, res, next) => {
    try {
        // Check if user is trying to update their own profile
        if (req.user.id !== req.params.id) {
            return next(createError(403, 'You are not authorized to update this profile'));
        }

        const { name } = req.body;
        if (!name) {
            return next(createError(400, 'Name is required'));
        }

        const update = {};
        
        // Validate and update name
        if (name) {
            if (typeof name !== 'string' || name.trim().length === 0) {
                return next(createError(400, 'Name must be a non-empty string'));
            }
            update.name = name.trim();
        }

        const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, select: '_id name email role' });
        if (!user) {
            return next(createError(404, 'User not found'));
        }
        res.json(user);
    } catch (error) {
        next(createError(500, 'Server error updating user'));
    }
}; 