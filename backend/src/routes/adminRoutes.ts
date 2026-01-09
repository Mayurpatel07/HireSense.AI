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

// 2026-03-30 13:41:00 - feat(backend): implement email service with Nodemailer


// 2026-05-06 14:31:00 - chore: configure environment variables


// 2026-06-02 09:15:00 - feat(backend): add job status update functionality


// Update: 2026-01-07 18:03:00 - feat(frontend): add constants file


// Update: 2026-01-09 10:17:00 - feat(frontend): create AdminDashboard

