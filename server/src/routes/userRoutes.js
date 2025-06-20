import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';
import { verifyAccessToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:id', getUserProfile);
router.put('/:id', verifyAccessToken, updateUserProfile);

export default router; 