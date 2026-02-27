import React, { useEffect, useState } from 'react';
import {
  approveJob,
  deleteUser,
  getAllUsers,
  getDashboardStats,
  getPendingJobs,
  rejectJob,
} from '../services/adminService';
import { deleteJob as deleteJobListing, getMyJobs } from '../services/jobService';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';

export const AdminDashboard: React.FC = () => {
  const { toasts, addToast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalJobs: 0,
    totalApplications: 0,
  });
  const [pendingJobs, setPendingJobs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [statsResponse, pendingJobsResponse, usersResponse, jobsResponse] = await Promise.all([
        getDashboardStats(),
        getPendingJobs(),
        getAllUsers(undefined, 1),
        getMyJobs({ limit: 100 }),
      ]);

      setStats({
        totalUsers: statsResponse?.stats?.totalUsers || 0,
        totalCompanies: statsResponse?.stats?.totalCompanies || 0,
        totalJobs: statsResponse?.stats?.totalJobs || 0,
        totalApplications: statsResponse?.stats?.totalApplications || 0,
      });
      setPendingJobs(pendingJobsResponse?.jobs || []);
      setUsers(usersResponse?.users || []);
      setJobs(jobsResponse?.jobs || []);
    } catch (error: any) {
      addToast(error?.response?.data?.message || 'Failed to load admin dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleApproveJob = async (jobId: string) => {
    try {
      await approveJob(jobId);
      addToast('Job approved successfully', 'success');
      setPendingJobs((prev) => prev.filter((job) => job._id !== jobId));
      setStats((prev) => ({ ...prev, totalJobs: prev.totalJobs + 1 }));
    } catch (error: any) {
      addToast(error?.response?.data?.message || 'Failed to approve job', 'error');
    }
  };

  const handleRejectJob = async (jobId: string) => {
    const reason = window.prompt('Enter rejection reason:', 'Does not meet quality guidelines');
    if (!reason) return;

    try {
      await rejectJob(jobId, reason);
      addToast('Job rejected', 'success');
      setPendingJobs((prev) => prev.filter((job) => job._id !== jobId));
    } catch (error: any) {
      addToast(error?.response?.data?.message || 'Failed to reject job', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (!confirmed) return;

    try {
      await deleteUser(userId);
      addToast('User deleted successfully', 'success');
      setUsers((prev) => prev.filter((user) => user._id !== userId));
      setStats((prev) => ({ ...prev, totalUsers: Math.max(0, prev.totalUsers - 1) }));
    } catch (error: any) {
      addToast(error?.response?.data?.message || 'Failed to delete user', 'error');
    }
  };

  const handleDeleteJob = async (jobId: string, title: string) => {
    const confirmed = window.confirm(`Delete job listing "${title}"?`);
    if (!confirmed) return;

    try {
      await deleteJobListing(jobId);
      addToast('Job deleted successfully', 'success');
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
      setStats((prev) => ({ ...prev, totalJobs: Math.max(0, prev.totalJobs - 1) }));
      setPendingJobs((prev) => prev.filter((job) => job._id !== jobId));
    } catch (error: any) {
      addToast(error?.response?.data?.message || 'Failed to delete job', 'error');
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className='min-h-screen bg-gradient-to-b from-pink-50 via-white to-white py-8 md:py-12'>
        <div className='max-w-7xl mx-auto px-4'>
        <div className='mb-8'>
          <span className='inline-flex px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-sm font-semibold mb-3'>
            Platform Control Center
          </span>
          <h1 className='text-3xl md:text-4xl font-bold text-gray-900'>Admin Dashboard</h1>
        </div>

        {/* Stats Grid */}
        <div className='grid md:grid-cols-4 gap-6 mb-12'>
          {[
            { label: 'Total Users', value: stats.totalUsers },
            { label: 'Active Companies', value: stats.totalCompanies },
            { label: 'Job Postings', value: stats.totalJobs },
            { label: 'Applications', value: stats.totalApplications },
          ].map((stat, idx) => (
            <div
              key={idx}
              className='bg-white border border-pink-100 rounded-xl p-6 shadow-sm'
            >
              <p className='text-sm text-gray-600 mb-2'>{stat.label}</p>
              <p className='text-3xl font-bold text-pink-600'>{loading ? '...' : stat.value}</p>
            </div>
          ))}
        </div>

        <div className='grid lg:grid-cols-3 gap-6'>
          <div className='bg-white rounded-xl p-6 border border-pink-100 shadow-sm'>
            <h2 className='text-xl font-bold text-gray-900 mb-4'>Pending Job Approvals</h2>
            {loading ? (
              <p className='text-gray-600'>Loading pending jobs...</p>
            ) : pendingJobs.length === 0 ? (
              <p className='text-gray-600'>No pending jobs right now.</p>
            ) : (
              <div className='space-y-3 max-h-[420px] overflow-auto pr-1'>
                {pendingJobs.map((job) => (
                  <div key={job._id} className='border border-pink-100 rounded-lg p-4'>
                    <p className='font-semibold text-gray-900'>{job.title}</p>
                    <p className='text-sm text-gray-600'>{job.company}</p>
                    <p className='text-xs text-gray-500 mt-1'>
                      By: {typeof job.companyId === 'object' ? job.companyId?.name : 'Company'}
                    </p>
                    <div className='flex flex-col sm:flex-row gap-2 mt-3'>
                      <button
                        onClick={() => handleApproveJob(job._id)}
                        className='w-full sm:w-auto px-3 py-1.5 text-xs bg-green-500 text-white rounded-md hover:bg-green-600 transition'
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectJob(job._id)}
                        className='w-full sm:w-auto px-3 py-1.5 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 transition'
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className='bg-white rounded-xl p-6 border border-pink-100 shadow-sm'>
            <h2 className='text-xl font-bold text-gray-900 mb-4'>User Management</h2>
            {loading ? (
              <p className='text-gray-600'>Loading users...</p>
            ) : users.length === 0 ? (
              <p className='text-gray-600'>No users found.</p>
            ) : (
              <div className='space-y-3 max-h-[420px] overflow-auto pr-1'>
                {users.map((user) => (
                  <div key={user._id} className='border border-pink-100 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                    <div>
                      <p className='font-semibold text-gray-900'>{user.name}</p>
                      <p className='text-sm text-gray-600'>{user.email}</p>
                      <span className='inline-flex mt-1 px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 text-xs font-medium'>
                        {user.role}
                      </span>
                    </div>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className='w-full sm:w-auto px-3 py-1.5 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 transition'
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className='bg-white rounded-xl p-6 border border-pink-100 shadow-sm'>
            <h2 className='text-xl font-bold text-gray-900 mb-4'>Job Listings</h2>
            {loading ? (
              <p className='text-gray-600'>Loading jobs...</p>
            ) : jobs.length === 0 ? (
              <p className='text-gray-600'>No job listings found.</p>
            ) : (
              <div className='space-y-3 max-h-[420px] overflow-auto pr-1'>
                {jobs.map((job) => (
                  <div key={job._id} className='border border-pink-100 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                    <div>
                      <p className='font-semibold text-gray-900'>{job.title}</p>
                      <p className='text-sm text-gray-600'>{job.company}</p>
                      <span className='inline-flex mt-1 px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 text-xs font-medium capitalize'>
                        {job.status}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteJob(job._id, job.title)}
                      className='w-full sm:w-auto px-3 py-1.5 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 transition'
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
};
