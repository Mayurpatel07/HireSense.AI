import { Router } from 'express';
import {
  getDashboardStats,
  approveJob,
  rejectJob,
  getAllUsers,
  deleteUser,
  getPendingJobs,
} from '../controllers/adminController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

/**
 * Admin Routes
 */
router.get('/stats', authMiddleware, roleMiddleware(['admin']), getDashboardStats);
router.get('/users', authMiddleware, roleMiddleware(['admin']), getAllUsers);
router.delete('/users/:userId', authMiddleware, roleMiddleware(['admin']), deleteUser);
router.get('/jobs/pending', authMiddleware, roleMiddleware(['admin']), getPendingJobs);
router.put('/jobs/:jobId/approve', authMiddleware, roleMiddleware(['admin']), approveJob);
router.put('/jobs/:jobId/reject', authMiddleware, roleMiddleware(['admin']), rejectJob);

export default router;
