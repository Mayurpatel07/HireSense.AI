import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Job from '../models/Job';
import Application from '../models/Application';
import { analyzeResume, predictHireLikelihood, generateInterviewQuestions } from '../services/aiResumeAnalysis';
import User from '../models/User';
import axios from 'axios';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { extractResumeText } from '../utils/resumeParser';

const extractResumeTextFromUrl = async (resumeUrl: string): Promise<string> => {
  try {
    const response = await axios.get(resumeUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    const parsedUrl = new URL(resumeUrl);
    const extFromUrl = path.extname(parsedUrl.pathname).toLowerCase();
    const ext = extFromUrl === '.doc' ? '.docx' : extFromUrl || '.pdf';
    const tempPath = path.join(os.tmpdir(), `resume-${Date.now()}${ext}`);

    fs.writeFileSync(tempPath, buffer);
    const text = await extractResumeText(tempPath);
    fs.unlinkSync(tempPath);
    return text;
  } catch (error) {
    console.warn('⚠️ Failed to extract resume text from URL:', error);
    return '';
  }
};

const getUserResumeContext = async (userId: string) => {
  const user = await User.findById(userId).select('resume resumeUrl resumeAnalysis');
  const resumeToUse = user?.resumeUrl || user?.resume;

  if (!resumeToUse) {
    throw new Error('Please upload your resume in profile before checking AI matching');
  }

  let resumeText = user?.resumeAnalysis?.extractedText || '';
  if (!resumeText && typeof resumeToUse === 'string' && resumeToUse.startsWith('http')) {
    resumeText = await extractResumeTextFromUrl(resumeToUse);
  }

  return {
    resumeToUse,
    resumeText: resumeText || '',
  };
};

const buildUserPredictionForJob = async (userId: string, job: any) => {
  const { resumeText, resumeToUse } = await getUserResumeContext(userId);

  const prediction = await predictHireLikelihood(resumeText, {
    title: job.title,
    description: job.description,
    skills: job.skills,
    requirements: job.requirements,
  });

  return { prediction, resumeToUse };
};

/**
 * Create a new job posting
 */
export const createJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (req.user.role !== 'company' && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Only companies and admins can post jobs' });
      return;
    }

    const {
      title,
      description,
      requirements,
      skills,
      salary,
      jobType,
      experienceLevel,
      location,
      workplaceType,
      applicationDeadline,
      company,
    } = req.body;

    const job = await Job.create({
      title,
      description,
      requirements,
      skills,
      salary,
      jobType,
      experienceLevel,
      location,
      workplaceType,
      company,
      companyId: req.user.id,
      applicationDeadline,
      status: 'published',
    });

    res.status(201).json({
      message: 'Job created successfully',
      job,
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Failed to create job' });
  }
};

/**
 * Get all jobs with filters and search
 */
export const getJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, location, jobType, experienceLevel, workplaceType, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter: any = { status: 'published' };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    if (location) filter.location = { $regex: location, $options: 'i' };
    if (jobType) filter.jobType = jobType;
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (workplaceType) filter.workplaceType = workplaceType;

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const jobs = await Job.find(filter)
      .populate('companyId', 'name avatar')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments(filter);

    res.status(200).json({
      jobs,
      pagination: {
        total,
        pages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
      },
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
};

/**
 * Get jobs with AI-powered matching score for logged-in job seeker
 */
export const getAIMatchedJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (req.user.role !== 'user') {
      res.status(403).json({ message: 'Only job seekers can use AI matching' });
      return;
    }

    const { search, location, jobType, experienceLevel, workplaceType, page = 1, limit = 10 } = req.query;

    const filter: any = { status: 'published' };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    if (location) filter.location = { $regex: location, $options: 'i' };
    if (jobType) filter.jobType = jobType;
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (workplaceType) filter.workplaceType = workplaceType;

    const skip = (Number(page) - 1) * Number(limit);

    const jobs = await Job.find(filter)
      .populate('companyId', 'name avatar')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments(filter);

    const { resumeText } = await getUserResumeContext(req.user.id);

    const jobsWithAIMatch = await Promise.all(
      jobs.map(async (jobDoc: any) => {
        const job = typeof jobDoc.toObject === 'function' ? jobDoc.toObject() : jobDoc;
        const analysis = await analyzeResume(
          resumeText,
          [job.description, ...(job.requirements || []), ...(job.skills || [])].join('\n')
        );

        const score = Math.max(0, Math.min(100, analysis.fitScore || 0));
        const verdict = score >= 70 ? 'strong' : score >= 45 ? 'moderate' : 'low';

        return {
          ...job,
          aiMatch: {
            score,
            verdict,
            missingSkills: (analysis.missingSkills || []).slice(0, 5),
          },
        };
      })
    );

    jobsWithAIMatch.sort((a, b) => b.aiMatch.score - a.aiMatch.score);

    res.status(200).json({
      jobs: jobsWithAIMatch,
      pagination: {
        total,
        pages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
      },
      aiMatching: true,
    });
  } catch (error) {
    console.error('Get AI matched jobs error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch AI matched jobs';
    res.status(500).json({ message });
  }
};

/**
 * Get jobs created by the authenticated company
 */
export const getMyJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (req.user.role !== 'company' && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Only companies can view company jobs' });
      return;
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = req.user.role === 'admin' ? {} : { companyId: req.user.id };

    const jobs = await Job.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments(filter);

    res.status(200).json({
      jobs,
      pagination: {
        total,
        pages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
      },
    });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({ message: 'Failed to fetch company jobs' });
  }
};

/**
 * Get job by ID
 */
export const getJobById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const job = await Job.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('companyId', 'name avatar bio');

    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    res.status(200).json({ job });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Failed to fetch job' });
  }
};

/**
 * Update job (only by company that created it)
 */
export const updateJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    if (job.companyId.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to update this job' });
      return;
    }

    const updated = await Job.findByIdAndUpdate(id, req.body, { new: true });

    res.status(200).json({
      message: 'Job updated successfully',
      job: updated,
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Failed to update job' });
  }
};

/**
 * Delete job
 */
export const deleteJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    if (job.companyId.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to delete this job' });
      return;
    }

    await Job.findByIdAndDelete(id);

    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Failed to delete job' });
  }
};

/**
 * Apply for a job
 */
export const applyJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (req.user.role !== 'user') {
      res.status(403).json({ message: 'Only job seekers can apply for jobs' });
      return;
    }

    const { jobId } = req.params;
    const { resume, coverLetter } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      jobId,
      userId: req.user.id,
    });

    if (existingApplication) {
      res.status(400).json({ message: 'You have already applied for this job' });
      return;
    }

    const user = await User.findById(req.user.id).select('resume resumeUrl');
    const resumeToUse = resume || user?.resumeUrl || user?.resume;

    if (!resumeToUse) {
      res.status(400).json({ message: 'Please upload your resume in profile before applying' });
      return;
    }

    console.log('📄 User applying with resume URL:', resumeToUse);

    const { prediction: hirePrediction } = await buildUserPredictionForJob(req.user.id, job);

    // Create application
    const application = await Application.create({
      jobId,
      userId: req.user.id,
      company: job.company,
      resume: resumeToUse,
      coverLetter,
      matchScore: hirePrediction.hireProbability,
      resumeAnalysis: {
        strengths: hirePrediction.strengths,
        weaknesses: hirePrediction.improvementAreas,
        missingSkills: hirePrediction.missingSkills,
      },
      hirePrediction: {
        ...hirePrediction,
        predictedAt: new Date(),
      },
    });

    // Add applicant to job
    await Job.findByIdAndUpdate(jobId, { $push: { applicants: req.user.id } });

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
      prediction: hirePrediction,
    });
  } catch (error) {
    console.error('Apply job error:', error);
    res.status(500).json({ message: 'Failed to apply for job' });
  }
};

/**
 * Get AI hire prediction before applying
 */
export const getJobApplicationPrediction = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (req.user.role !== 'user') {
      res.status(403).json({ message: 'Only job seekers can get prediction' });
      return;
    }

    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    const existingApplication = await Application.findOne({
      jobId,
      userId: req.user.id,
    });

    if (existingApplication?.hirePrediction) {
      res.status(200).json({
        prediction: existingApplication.hirePrediction,
        fromExistingApplication: true,
      });
      return;
    }

    const { prediction } = await buildUserPredictionForJob(req.user.id, job);

    res.status(200).json({
      prediction,
      fromExistingApplication: false,
    });
  } catch (error) {
    console.error('Get job prediction error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate prediction';
    res.status(500).json({ message });
  }
};

/**
 * Get applications for a job (company view)
 */
export const getJobApplications = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { jobId } = req.params;

    // Verify ownership
    const job = await Job.findById(jobId);
    if (!job || (job.companyId.toString() !== req.user.id && req.user.role !== 'admin')) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const applications = await Application.find({ jobId })
      .populate('userId', 'name email phone resumeAnalysis')
      .select('jobId userId company resume coverLetter status matchScore resumeAnalysis hirePrediction appliedAt createdAt updatedAt')
      .sort({ appliedAt: -1 });

    console.log('📨 Fetched applications count:', applications.length);
    if (applications.length > 0) {
      console.log('📄 First application resume:', applications[0].resume);
    }

    res.status(200).json({ applications });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
};

/**
 * Get current user's application for a specific job
 */
export const getMyApplicationForJob = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { jobId } = req.params;

    const application = await Application.findOne({
      jobId,
      userId: req.user.id,
    }).select('jobId userId company resume coverLetter status matchScore resumeAnalysis hirePrediction appliedAt createdAt updatedAt');

    if (!application) {
      res.status(404).json({ message: 'Application not found' });
      return;
    }

    res.status(200).json({ application });
  } catch (error) {
    console.error('Get my application error:', error);
    res.status(500).json({ message: 'Failed to fetch application' });
  }
};
/**
 * Generate AI-based interview preparation questions for a job
 */
export const generateJobInterviewQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { jobId } = req.params;

    // Get job details
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    // Generate interview questions
    const interviewQuestions = await generateInterviewQuestions(
      job.title,
      job.description,
      job.skills || [],
      job.requirements || []
    );

    res.status(200).json({
      success: true,
      data: interviewQuestions,
    });
  } catch (error) {
    console.error('Generate interview questions error:', error);
    res.status(500).json({ message: 'Failed to generate interview questions' });
  }
};
/**
 * Generate AI-based interview preparation questions from job details
 * (No job ID required - takes details from request body)
 */
export const generateInterviewQuestionsFromDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { jobTitle, jobDescription, skills = [], requirements = [] } = req.body;

    // Validate input
    if (!jobTitle || !jobDescription) {
      res.status(400).json({ message: 'Job title and description are required' });
      return;
    }

    const safeSkills = Array.isArray(skills) ? skills : [];
    const safeRequirements = Array.isArray(requirements) ? requirements : [];

    // Generate interview questions
    const interviewQuestions = await generateInterviewQuestions(
      jobTitle,
      jobDescription,
      safeSkills,
      safeRequirements
    );

    res.status(200).json({
      success: true,
      data: interviewQuestions,
    });
  } catch (error) {
    console.error('Generate interview questions from details error:', error);
    res.status(500).json({ message: 'Failed to generate interview questions' });
  }
};
