import apiClient from './api';

// Get admin dashboard stats
export const getDashboardStats = async (): Promise<any> => {
  const response = await apiClient.get('/admin/stats');
  return response.data;
};

// Get all users (admin only)
export const getAllUsers = async (role?: string, page?: number): Promise<any> => {
  const response = await apiClient.get('/admin/users', { params: { role, page } });
  return response.data;
};

// Delete user (admin only)
export const deleteUser = async (userId: string): Promise<any> => {
  const response = await apiClient.delete(`/admin/users/${userId}`);
  return response.data;
};

// Get pending jobs for approval
export const getPendingJobs = async (): Promise<any> => {
  const response = await apiClient.get('/admin/jobs/pending');
  return response.data;
};

// Approve job
export const approveJob = async (jobId: string): Promise<any> => {
  const response = await apiClient.put(`/admin/jobs/${jobId}/approve`);
  return response.data;
};

// Reject job
export const rejectJob = async (jobId: string, reason: string): Promise<any> => {
  const response = await apiClient.put(`/admin/jobs/${jobId}/reject`, { reason });
  return response.data;
};
