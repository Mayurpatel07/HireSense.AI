import { Router } from 'express';
import {
  createJob,
  getJobs,
  getAIMatchedJobs,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
  applyJob,
  getJobApplicationPrediction,
  getMyApplicationForJob,
  getJobApplications,
  generateJobInterviewQuestions,
  generateInterviewQuestionsFromDetails,
} from '../controllers/jobController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

/**
 * Job Routes
 */
router.post('/', authMiddleware, roleMiddleware(['company', 'admin']), createJob);
router.get('/', getJobs);
router.get('/ai-matches', authMiddleware, roleMiddleware(['user']), getAIMatchedJobs);
router.get('/my-jobs', authMiddleware, roleMiddleware(['company', 'admin']), getMyJobs);

/**
 * Interview Routes (no job ID required - must come before :id routes)
 */
router.post('/interview-questions/generate', authMiddleware, generateInterviewQuestionsFromDetails);

/**
 * Dynamic routes
 */
router.get('/:id', getJobById);
router.put('/:id', authMiddleware, updateJob);
router.delete('/:id', authMiddleware, deleteJob);

/**
 * Application Routes
 */
router.post('/:jobId/apply', authMiddleware, applyJob);
router.get('/:jobId/prediction', authMiddleware, getJobApplicationPrediction);
router.get('/:jobId/my-application', authMiddleware, getMyApplicationForJob);
router.get('/:jobId/interview-questions', authMiddleware, generateJobInterviewQuestions);
router.get('/:jobId/applications', authMiddleware, getJobApplications);

export default router;
