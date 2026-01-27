import { Router } from 'express';
import {
  uploadResume,
  analyzeResumeAgainstJob,
  getUserApplications,
  updateApplicationStatus,
  downloadResume,
  viewResume,
  viewResumeFile,
} from '../controllers/resumeController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { uploadResume as uploadMiddleware } from '../config/supabase';

const router = Router();

/**
 * Resume Routes
 */
router.post('/upload', authMiddleware, uploadMiddleware.single('resume'), uploadResume);
router.post('/analyze/:jobId', authMiddleware, analyzeResumeAgainstJob);

/**
 * Application Routes
 */
router.get('/applications', authMiddleware, getUserApplications);
router.put('/applications/:applicationId/status', authMiddleware, updateApplicationStatus);

/**
 * Resume Download/View Routes
 */
router.get('/download', authMiddleware, downloadResume);
router.get('/download/:applicationId', authMiddleware, downloadResume);
router.get('/view', authMiddleware, viewResume);
router.get('/view/:applicationId', authMiddleware, viewResumeFile);

export default router;

// 2026-04-19 10:45:00 - feat(backend): create Analytics model


// 2026-04-30 09:15:00 - feat(backend): implement email service with Nodemailer


// 2026-05-06 13:30:00 - feat(backend): create Application model


// 2026-05-17 11:24:00 - feat(backend): create analytics routes


// 2026-06-01 15:20:00 - feat(backend): add file upload service


// Update: 2026-01-07 11:29:00 - test: add component tests


// Update: 2026-01-09 09:22:00 - feat(backend): implement skills extraction


// Update: 2026-01-27 09:01:00 - feat(frontend): implement JobCard component

