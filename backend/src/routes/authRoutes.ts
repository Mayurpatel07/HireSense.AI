import { Router } from 'express';
import { register, login, googleLogin, firebaseRegister, firebaseLogin, getProfile, updateProfile } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * Auth Routes
 */

// Firebase Authentication Routes (Recommended)
router.post('/firebase-register', firebaseRegister);
router.post('/firebase-login', firebaseLogin);

// OAuth Routes
router.post('/google-login', googleLogin);

// Legacy Routes (for backwards compatibility)
router.post('/register', register);
router.post('/login', login);

// Protected Routes
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

export default router;
