import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Job from '../models/Job';
import Application from '../models/Application';
import { extractResumeText } from '../utils/resumeParser';
import { analyzeResume } from '../services/aiResumeAnalysis';
import { getFileSizeInfo } from '../utils/fileCompression';
import { uploadFileToSupabase, deleteFileFromSupabase, downloadFileFromSupabase } from '../config/supabase';
import axios from 'axios';
import fs from 'fs';
import os from 'os';
import path from 'path';

/**
 * Upload and analyze resume
 */
export const uploadResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    // Log file upload info
    const fileSizeKB = (req.file.size / 1024).toFixed(2);
    const fileSizeMB = (req.file.size / (1024 * 1024)).toFixed(2);
    const displaySize = req.file.size > 1024 * 1024 ? `${fileSizeMB} MB` : `${fileSizeKB} KB`;
    console.log(`📄 Resume uploading: ${req.file.originalname} (${displaySize})`);

    // Upload to Supabase
    let resumeUrl: string;
    let resumeFileName: string;
    try {
      const uploadResult = await uploadFileToSupabase(req.file, req.user.id);
      resumeFileName = uploadResult.path;
      resumeUrl = uploadResult.publicUrl;
      console.log(`✓ Resume uploaded to Supabase: ${resumeFileName}`);
    } catch (error) {
      console.error('Failed to upload to Supabase:', error);
      res.status(500).json({ message: 'Failed to upload resume to storage' });
      return;
    }

    // Extract text from resume (non-blocking)
    let resumeText = '';
    try {
      // Create temporary file from buffer
      const ext = path.extname(req.file.originalname);
      const tempPath = path.join(os.tmpdir(), `${req.file.filename}${ext}`);
      fs.writeFileSync(tempPath, req.file.buffer);
      resumeText = await extractResumeText(tempPath);
      fs.unlinkSync(tempPath);
      console.log(`✓ Text extracted from resume`);
    } catch (error) {
      console.warn('⚠️  Failed to extract resume text (non-blocking):', error instanceof Error ? error.message : error);
      resumeText = '';
    }

    // Update user with resume info
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        resume: resumeFileName, // Store Supabase file path
        resumeUrl: resumeUrl, // Store public Supabase URL
        'resumeAnalysis.extractedText': resumeText,
      },
      { new: true }
    );

    res.status(200).json({
      message: 'Resume uploaded successfully',
      resumeUrl: resumeUrl,
      user,
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({ message: 'Failed to upload resume' });
  }
};

/**
 * Analyze resume against job description
 */
export const analyzeResumeAgainstJob = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { jobId } = req.params;

    // Get user with resume
    const user = await User.findById(req.user.id);
    if (!user || !user.resume) {
      res.status(400).json({ message: 'No resume found. Please upload a resume first.' });
      return;
    }

    // Get job
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    // Get resume text from user's stored analysis or download from Cloudinary
    let resumeText = user.resumeAnalysis?.extractedText || '';
    
    if (!resumeText && user.resumeUrl) {
      try {
        const axios = require('axios');
        const fs = require('fs');
        const response = await axios.get(user.resumeUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        const tempPath = `/tmp/${user.resume}`;
        fs.writeFileSync(tempPath, buffer);
        resumeText = await extractResumeText(tempPath);
        fs.unlinkSync(tempPath);
      } catch (error) {
        console.error('Error downloading resume from Cloudinary:', error);
      }
    }

    if (!resumeText) {
      res.status(400).json({ message: 'Could not extract resume text. Please re-upload your resume.' });
      return;
    }

    // Analyze resume
    const analysis = await analyzeResume(resumeText, job.description);

    res.status(200).json({
      analysis,
      jobTitle: job.title,
      company: job.company,
    });
  } catch (error) {
    console.error('Analyze resume error:', error);
    res.status(500).json({ message: 'Failed to analyze resume' });
  }
};

/**
 * Get user applications
 */
export const getUserApplications = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const applications = await Application.find({ userId: req.user.id })
      .populate('jobId', 'title company location salary jobType')
      .sort({ appliedAt: -1 });

    res.status(200).json({ applications });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
};

/** * Download/view resume file
 * Serves resume files from either local storage or Cloudinary
 */
export const downloadResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { applicationId } = req.params;
    let resumeUrl: string | undefined;
    let fileName = 'resume.pdf';

    // If applicationId is provided, download resume from application
    if (applicationId) {
      const application = await Application.findById(applicationId).populate('jobId');
      if (!application) {
        res.status(404).json({ message: 'Application not found' });
        return;
      }

      // Check if user is authorized (company owner or admin)
      const job = await Job.findById(application.jobId);
      if (!job || (job.companyId.toString() !== req.user.id && req.user.role !== 'admin')) {
        res.status(403).json({ message: 'Not authorized to download this resume' });
        return;
      }

      resumeUrl = application.resume;
      
      // Get applicant info for filename
      const applicant = await User.findById(application.userId);
      if (applicant) {
        fileName = `${applicant.name.replace(/\s+/g, '_')}_resume.pdf`;
      }
    } else {
      // Download user's own resume
      const user = await User.findById(req.user.id);
      if (!user || !user.resumeUrl) {
        res.status(404).json({ message: 'Resume not found' });
        return;
      }
      resumeUrl = user.resumeUrl;
      fileName = user.resume || 'resume.pdf';
    }

    if (!resumeUrl) {
      res.status(404).json({ message: 'Resume URL not found' });
      return;
    }

    console.log('📄 Downloading resume from URL:', resumeUrl);

    // Check if it's a Supabase URL, external URL, or local file
    if (resumeUrl.includes('supabase')) {
      // Extract filename from URL or use stored path
      let supabaseFileName = fileName;
      
      // Try to extract the actual filename from the Supabase URL
      const urlMatch = resumeUrl.match(/\/resumes\/(.+?)(\?|$)/);
      if (urlMatch) {
        supabaseFileName = urlMatch[1];
      }

      try {
        // Download from Supabase and stream to response
        const fileBuffer = await downloadFileFromSupabase(supabaseFileName);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(fileBuffer);
      } catch (error) {
        console.error('Error downloading from Supabase:', error);
        
        // Fallback: try to stream directly from the signed URL
        try {
          const response = await axios.get(resumeUrl, { responseType: 'stream' });
          res.setHeader('Content-Type', response.headers['content-type'] || 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
          response.data.pipe(res);
        } catch (streamError) {
          console.error('Error streaming from URL:', streamError);
          res.status(500).json({ message: 'Failed to download resume' });
        }
      }
    } else if (resumeUrl.startsWith('http')) {
      // Stream from external URL (Cloudinary, etc.)
      try {
        const response = await axios.get(resumeUrl, { responseType: 'stream' });
        res.setHeader('Content-Type', response.headers['content-type'] || 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        response.data.pipe(res);
      } catch (error) {
        console.error('Error streaming from URL:', error);
        res.status(500).json({ message: 'Failed to download resume from cloud storage' });
      }
    } else {
      // Serve local file
      const filePath = path.join(process.cwd(), 'uploads', 'resumes', resumeUrl);

      if (!fs.existsSync(filePath)) {
        res.status(404).json({ message: 'Resume file not found' });
        return;
      }

      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('Error downloading resume:', err);
          if (!res.headersSent) {
            res.status(500).json({ message: 'Failed to download resume' });
          }
        }
      });
    }
  } catch (error) {
    console.error('Download resume error:', error);
    res.status(500).json({ message: 'Failed to download resume' });
  }
};

/**
 * View resume in browser (PDF viewer)
 */
export const viewResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user || !user.resumeUrl) {
      res.status(404).json({ message: 'Resume not found' });
      return;
    }

    // Return the resume URL so frontend can display it in an iframe or link
    res.status(200).json({
      resumeUrl: user.resumeUrl,
      fileName: user.resume,
      isCloudFile: user.resumeUrl.startsWith('http'),
    });
  } catch (error) {
    console.error('View resume error:', error);
    res.status(500).json({ message: 'Failed to fetch resume' });
  }
};

/**
 * View resume file inline (for browser viewing) - by application ID
 */
export const viewResumeFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('👁️  View resume request received');
    console.log('👁️  User:', req.user?.id, 'Role:', req.user?.role);
    console.log('👁️  Application ID:', req.params.applicationId);
    
    if (!req.user) {
      console.error('❌ Not authenticated');
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { applicationId } = req.params;
    let resumeUrl: string | undefined;
    let fileName = 'resume.pdf';

    // If applicationId is provided, view resume from application
    if (applicationId) {
      console.log('📋 Finding application:', applicationId);
      const application = await Application.findById(applicationId).populate('jobId');
      
      if (!application) {
        console.error('❌ Application not found');
        res.status(404).json({ message: 'Application not found' });
        return;
      }

      console.log('✅ Application found');
      console.log('📄 Resume URL:', application.resume);

      // Check if user is authorized (company owner or admin)
      const job = await Job.findById(application.jobId);
      if (!job) {
        console.error('❌ Job not found');
        res.status(404).json({ message: 'Job not found' });
        return;
      }
      
      console.log('✅ Job found - Company ID:', job.companyId, 'User ID:', req.user.id);
      
      if (job.companyId.toString() !== req.user.id && req.user.role !== 'admin') {
        console.error('❌ Not authorized');
        res.status(403).json({ message: 'Not authorized to view this resume' });
        return;
      }

      resumeUrl = application.resume;
      
      // Get applicant info for filename
      const applicant = await User.findById(application.userId);
      if (applicant) {
        fileName = `${applicant.name.replace(/\s+/g, '_')}_resume.pdf`;
      }
    } else {
      // View user's own resume
      console.log('📋 Finding user resume');
      const user = await User.findById(req.user.id);
      if (!user || !user.resumeUrl) {
        console.error('❌ Resume not found');
        res.status(404).json({ message: 'Resume not found' });
        return;
      }
      resumeUrl = user.resumeUrl;
      fileName = user.resume || 'resume.pdf';
    }

    if (!resumeUrl) {
      console.error('❌ Resume URL not found');
      res.status(404).json({ message: 'Resume URL not found' });
      return;
    }

    console.log('👁️  Viewing resume from URL:', resumeUrl);
    console.log('👁️  Filename:', fileName);

    // Check if it's a Supabase file, external URL, or local file
    // If resumeUrl doesn't start with http, it's a Supabase filename
    if (!resumeUrl.startsWith('http') || resumeUrl.includes('supabase')) {
      // Extract filename from URL or use the resumeUrl directly if it's just a filename
      let supabaseFileName = resumeUrl;
      
      // If it's a full Supabase URL, extract just the filename
      if (resumeUrl.includes('supabase')) {
        const urlMatch = resumeUrl.match(/\/resumes\/(.+?)(\?|$)/);
        if (urlMatch) {
          supabaseFileName = urlMatch[1];
        }
      }

      console.log('📦 Downloading from Supabase, filename:', supabaseFileName);

      try {
        // Download from Supabase and stream to response (inline)
        const fileBuffer = await downloadFileFromSupabase(supabaseFileName);
        
        console.log('✅ Downloaded from Supabase, buffer size:', fileBuffer.length);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Length', fileBuffer.length.toString());
        res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
        res.setHeader('Cache-Control', 'no-cache');
        res.send(fileBuffer);
        console.log('✅ Resume sent successfully');
      } catch (error) {
        console.error('Error viewing from Supabase:', error);
        
        // Fallback: try to stream directly from the signed URL
        try {
          console.log('⚠️  Fallback: Streaming from URL:', resumeUrl);
          const response = await axios.get(resumeUrl, { responseType: 'arraybuffer' });
          const buffer = Buffer.from(response.data);
          
          console.log('✅ Downloaded via HTTP, buffer size:', buffer.length);
          
          res.setHeader('Content-Type', response.headers['content-type'] || 'application/pdf');
          res.setHeader('Content-Length', buffer.length.toString());
          res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
          res.setHeader('Cache-Control', 'no-cache');
          res.send(buffer);
          console.log('✅ Resume sent successfully via fallback');
        } catch (streamError) {
          console.error('Error streaming from URL:', streamError);
          res.status(500).json({ message: 'Failed to view resume' });
        }
      }
    } else if (resumeUrl.startsWith('http') && !resumeUrl.includes('supabase')) {
      // Stream from external URL (Cloudinary, etc.) - only if not already handled above
      try {
        console.log('📥 Downloading from external URL:', resumeUrl);
        const response = await axios.get(resumeUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        
        console.log('✅ Downloaded from external URL, buffer size:', buffer.length);
        
        res.setHeader('Content-Type', response.headers['content-type'] || 'application/pdf');
        res.setHeader('Content-Length', buffer.length.toString());
        res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
        res.setHeader('Cache-Control', 'no-cache');
        res.send(buffer);
        console.log('✅ Resume sent successfully');
      } catch (error) {
        console.error('Error streaming from URL:', error);
        res.status(500).json({ message: 'Failed to view resume from cloud storage' });
      }
    } else {
      // Serve local file
      const filePath = path.join(process.cwd(), 'uploads', 'resumes', resumeUrl);

      if (!fs.existsSync(filePath)) {
        res.status(404).json({ message: 'Resume file not found' });
        return;
      }

      // Send file with inline disposition for viewing
      res.sendFile(filePath, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${fileName}"`,
        },
      }, (err) => {
        if (err) {
          console.error('Error viewing resume:', err);
          if (!res.headersSent) {
            res.status(500).json({ message: 'Failed to view resume' });
          }
        }
      });
    }
  } catch (error) {
    console.error('❌ View resume file error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Failed to view resume',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

/**
 * Update application status (company only)
 */
export const updateApplicationStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'company') {
      res.status(403).json({ message: 'Only companies can update application status' });
      return;
    }

    const { applicationId } = req.params;
    const { status } = req.body;

    const application = await Application.findById(applicationId);
    if (!application) {
      res.status(404).json({ message: 'Application not found' });
      return;
    }

    // Verify ownership
    const job = await Job.findById(application.jobId);
    if (job?.companyId.toString() !== req.user.id) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    application.status = status;
    await application.save();

    res.status(200).json({
      message: 'Application status updated',
      application,
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Failed to update application status' });
  }
};

// 2026-03-22 13:30:00 - feat(backend): add job routes with middleware


// 2026-03-22 13:31:00 - fix(backend): correct JWT token expiration handling


// 2026-04-16 09:15:00 - feat(backend): add Notification model


// 2026-04-28 16:08:00 - chore: update gitignore


// 2026-05-03 11:33:00 - feat(backend): implement resume storage in Supabase


// 2026-05-05 13:30:00 - feat(backend): create user registration and login endpoints


// 2026-05-31 15:20:00 - feat(backend): create Application model


// 2026-06-07 15:20:00 - feat(backend): create Analytics model


// 2026-06-16 13:44:00 - feat(backend): implement job search and filtering


// Update: 2026-01-07 11:37:00 - feat(backend): implement analytics dashboard


// Update: 2026-01-15 13:10:00 - feat(frontend): add TypeScript configuration


// Update: 2026-01-21 10:57:00 - feat(backend): implement job status updates


// Update: 2026-02-11 09:31:00 - test: add component tests


// Update: 2026-02-12 15:03:00 - feat(backend): add AI-powered job matching


// Update: 2026-03-05 09:48:00 - docs: create deployment guide


// Update: 2026-03-19 09:32:00 - feat(backend): create Notification model


// Update: 2026-04-02 14:37:00 - feat(backend): implement WebSocket for notifications


// Update: 2026-04-07 09:06:00 - feat(frontend): add API interceptors

