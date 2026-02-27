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
