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

// 2026-03-15 09:15:00 - perf(backend): optimize database indexes


// 2026-04-14 15:20:00 - feat(backend): implement job recommendation engine


// 2026-05-19 15:20:00 - test(backend): add API tests


// 2026-05-23 14:40:00 - feat(backend): add resume scoring and feedback


// 2026-06-03 10:45:00 - feat(backend): create Application model


// 2026-06-13 10:45:00 - feat(backend): create user registration and login endpoints


// Update: 2026-01-02 09:46:00 - test: add E2E tests


// Update: 2026-01-16 10:01:00 - feat(frontend): implement auth service


// Update: 2026-03-02 11:46:00 - chore: configure CI/CD pipeline

