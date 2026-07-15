import apiClient from './api';
import { Job } from '../types';

// Get all jobs with filters
export const getJobs = async (filters?: {
  search?: string;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  workplaceType?: string;
  page?: number;
  limit?: number;
}): Promise<{ jobs: Job[]; pagination: any }> => {
  const response = await apiClient.get('/jobs', { params: filters });
  return response.data;
};

// Get jobs created by current company user
export const getMyJobs = async (params?: { page?: number; limit?: number }): Promise<{ jobs: Job[]; pagination: any }> => {
  const response = await apiClient.get('/jobs/my-jobs', { params });
  return response.data;
};

// Get job by ID
export const getJobById = async (id: string): Promise<{ job: Job }> => {
  const response = await apiClient.get(`/jobs/${id}`);
  return response.data;
};

// Create job (company only)
export const createJob = async (jobData: Partial<Job>): Promise<{ job: Job }> => {
  const response = await apiClient.post('/jobs', jobData);
  return response.data;
};

// Update job
export const updateJob = async (id: string, data: Partial<Job>): Promise<{ job: Job }> => {
  const response = await apiClient.put(`/jobs/${id}`, data);
  return response.data;
};

// Delete job
export const deleteJob = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/jobs/${id}`);
  return response.data;
};

// Apply for job
export const applyJob = async (
  jobId: string,
  resume?: string,
  coverLetter?: string
): Promise<any> => {
  const response = await apiClient.post(`/jobs/${jobId}/apply`, {
    resume,
    coverLetter,
  });
  return response.data;
};

// Get AI prediction before applying
export const getJobPrediction = async (jobId: string): Promise<any> => {
  const response = await apiClient.get(`/jobs/${jobId}/prediction`);
  return response.data;
};

// Get current user's application for a job
export const getMyApplicationForJob = async (jobId: string): Promise<any> => {
  const response = await apiClient.get(`/jobs/${jobId}/my-application`);
  return response.data;
};

// Get job applications (company view)
export const getJobApplications = async (jobId: string): Promise<{ applications: any[] }> => {
  const response = await apiClient.get(`/jobs/${jobId}/applications`);
  return response.data;
};

// Get AI-powered matched jobs for logged-in user
export const getAIMatchedJobs = async (filters?: {
  search?: string;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  workplaceType?: string;
  page?: number;
  limit?: number;
}): Promise<{ jobs: Job[]; pagination: any; aiMatching: boolean }> => {
  const response = await apiClient.get('/jobs/ai-matches', { params: filters });
  return response.data;
};

// Get AI-based interview preparation questions for a job
export const getInterviewQuestions = async (jobId: string): Promise<any> => {
  const response = await apiClient.get(`/jobs/${jobId}/interview-questions`);
  return response.data;
};

// Get AI-based interview preparation questions from custom job details
export const getInterviewQuestionsFromDetails = async (
  jobTitle: string,
  jobDescription: string,
  skills?: string[],
  requirements?: string[]
): Promise<any> => {
  const response = await apiClient.post('/jobs/interview-questions/generate', {
    jobTitle,
    jobDescription,
    skills: skills || [],
    requirements: requirements || [],
  });
  return response.data;
};
