import express from 'express';
import { analyzeUploadedResume } from '../controllers/resumeAnalyzerController';
import { uploadResume } from '../config/supabase';

const router = express.Router();

/**
 * @route   POST /api/resume-analyzer/analyze
 * @desc    Analyze uploaded resume with AI
 * @access  Public (can be protected with authMiddleware if needed)
 */
router.post('/analyze', uploadResume.single('resume'), analyzeUploadedResume);

export default router;
