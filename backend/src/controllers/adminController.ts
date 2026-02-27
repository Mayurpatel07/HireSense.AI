import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Job from '../models/Job';
import Application from '../models/Application';

/**
 * Get admin dashboard statistics
 */
export const getDashboardStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const totalUsers = await User.countDocuments();
    const totalCompanies = await User.countDocuments({ role: 'company' });
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const publishedJobs = await Job.countDocuments({ status: 'published' });
    const pendingJobs = await Job.countDocuments({ status: 'draft' });

    // Get applications per month
    const applicationsPerMonth = await Application.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Get jobs created per month
    const jobsPerMonth = await Job.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({
      stats: {
        totalUsers,
        totalCompanies,
        totalJobs,
        totalApplications,
        publishedJobs,
        pendingJobs,
      },
      charts: {
        applicationsPerMonth,
        jobsPerMonth,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};

/**
 * Approve job posting
 */
export const approveJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const { jobId } = req.params;

    const job = await Job.findByIdAndUpdate(
      jobId,
      {
        status: 'published',
        approvedBy: req.user.id,
      },
      { new: true }
    );

    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    res.status(200).json({
      message: 'Job approved successfully',
      job,
    });
  } catch (error) {
    console.error('Approve job error:', error);
    res.status(500).json({ message: 'Failed to approve job' });
  }
};

/**
 * Reject job posting
 */
export const rejectJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const { jobId } = req.params;
    const { reason } = req.body;

    const job = await Job.findByIdAndUpdate(
      jobId,
      {
        status: 'rejected',
        rejectionReason: reason,
      },
      { new: true }
    );

    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    res.status(200).json({
      message: 'Job rejected',
      job,
    });
  } catch (error) {
    console.error('Reject job error:', error);
    res.status(500).json({ message: 'Failed to reject job' });
  }
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const { role, page = 1, limit = 20 } = req.query;

    const filter = role ? { role } : {};
    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      users,
      pagination: {
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

/**
 * Delete user (admin only)
 */
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const { userId } = req.params;

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

/**
 * Get pending jobs for approval
 */
export const getPendingJobs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const jobs = await Job.find({ status: 'draft' })
      .populate('companyId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ jobs });
  } catch (error) {
    console.error('Get pending jobs error:', error);
    res.status(500).json({ message: 'Failed to fetch pending jobs' });
  }
};
