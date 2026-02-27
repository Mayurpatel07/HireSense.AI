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
