import apiClient from './api';

// Upload resume
export const uploadResume = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await apiClient.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Analyze resume against job
export const analyzeResumeAgainstJob = async (jobId: string): Promise<any> => {
  const response = await apiClient.post(`/resume/analyze/${jobId}`);
  return response.data;
};

// Get user applications
export const getUserApplications = async (): Promise<any> => {
  const response = await apiClient.get('/resume/applications');
  return response.data;
};

// Update application status
export const updateApplicationStatus = async (
  applicationId: string,
  status: string
): Promise<any> => {
  const response = await apiClient.put(`/resume/applications/${applicationId}/status`, {
    status,
  });
  return response.data;
};

// Update: 2026-01-13 10:09:00 - feat(frontend): create Login page


// Update: 2026-01-20 13:04:00 - feat(backend): implement login with email/password


// Update: 2026-01-20 15:05:00 - feat(backend): implement job search with filters


// Update: 2026-01-22 09:09:00 - feat(frontend): add Framer Motion animations


// Update: 2026-02-11 14:41:00 - feat(frontend): setup Axios instance


// Update: 2026-02-13 14:04:00 - test: add API integration tests


// Update: 2026-02-18 11:51:00 - feat(frontend): implement dark mode toggle


// Update: 2026-02-24 10:09:00 - feat(frontend): implement routing with React Router


// Update: 2026-03-02 16:46:00 - security: add rate limiting


// Update: 2026-03-27 11:44:00 - feat(frontend): add job service

