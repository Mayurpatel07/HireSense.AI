import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Application, Job } from '../types';
import { createJob, deleteJob, getJobApplications, getMyJobs, updateJob } from '../services/jobService';

interface ApplicationWithUser extends Omit<Application, 'userId'> {
  userId:
    | string
    | {
        _id: string;
        name: string;
        email: string;
        phone?: string;
      };
}

const INITIAL_FORM = {
  title: '',
  company: '',
  description: '',
  location: '',
  requirements: '',
  skills: '',
  applicationDeadline: '',
  salaryMin: '',
  salaryMax: '',
  salaryCurrency: 'INR',
  jobType: 'full-time' as Job['jobType'],
  workplaceType: 'hybrid' as Job['workplaceType'],
  experienceLevel: 'mid' as Job['experienceLevel'],
};

export const CompanyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [applications, setApplications] = useState<ApplicationWithUser[]>([]);
  const [applicationCounts, setApplicationCounts] = useState<Record<string, number>>({});
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  const getVerdictBadgeClass = (verdict?: 'likely' | 'uncertain' | 'unlikely') => {
    if (verdict === 'likely') return 'bg-green-50 text-green-700';
    if (verdict === 'uncertain') return 'bg-yellow-50 text-yellow-700';
    if (verdict === 'unlikely') return 'bg-red-50 text-red-700';
    return 'bg-gray-50 text-gray-700';
  };

  const getVerdictLabel = (verdict?: 'likely' | 'uncertain' | 'unlikely') => {
    if (verdict === 'likely') return 'Likely Hire';
    if (verdict === 'uncertain') return 'Needs Improvement';
    if (verdict === 'unlikely') return 'Unlikely Hire';
    return 'Not Predicted';
  };

  const activeJobs = useMemo(() => jobs.filter((job) => job.status === 'published').length, [jobs]);
  const totalApplications = useMemo(
    () => Object.values(applicationCounts).reduce((sum, count) => sum + count, 0),
    [applicationCounts]
  );

  const filteredJobs = useMemo(() => {
    if (statusFilter === 'all') return jobs;
    return jobs.filter((job) => job.status === statusFilter);
  }, [jobs, statusFilter]);

  const handleCardClick = (cardType: 'total' | 'published' | 'applications') => {
    if (cardType === 'applications') {
      setActiveTab('applications');
      if (jobs.length > 0 && !selectedJobId) {
        const firstJob = jobs[0];
        setSelectedJobId(firstJob._id);
        loadApplications(firstJob._id);
      }
    } else {
      setActiveTab('jobs');
      if (cardType === 'published') {
        setStatusFilter('published');
      } else {
        setStatusFilter('all');
      }
    }
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const jobsResponse = await getMyJobs({ limit: 100 });
      const companyJobs = jobsResponse.jobs || [];
      setJobs(companyJobs);

      if (companyJobs.length === 0) {
        setSelectedJobId('');
        setApplications([]);
        setApplicationCounts({});
        return;
      }

      const countsEntries = await Promise.all(
        companyJobs.map(async (job) => {
          try {
            const response = await getJobApplications(job._id);
            return [job._id, response.applications?.length || 0] as const;
          } catch {
            return [job._id, 0] as const;
          }
        })
      );

      setApplicationCounts(Object.fromEntries(countsEntries));

      const nextSelectedJobId = selectedJobId || companyJobs[0]._id;
      setSelectedJobId(nextSelectedJobId);
      await loadApplications(nextSelectedJobId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load company dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async (jobId: string) => {
    if (!jobId) {
      setApplications([]);
      return;
    }

    try {
      setError(null); // Clear previous errors
      console.log('Loading applications for job:', jobId);
      const response = await getJobApplications(jobId);
      console.log('Applications response:', response);
      console.log('First application resume:', response.applications?.[0]?.resume);
      setApplications((response.applications || []) as ApplicationWithUser[]);
    } catch (err: any) {
      console.error('Error loading applications:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load job applications';
      setError(errorMessage);
      setApplications([]);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleSubmitJob = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.title || !formData.company || !formData.description || !formData.location || !formData.applicationDeadline) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const payload: Partial<Job> = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        company: formData.company || user?.name || 'Company',
        requirements: formData.requirements
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        skills: formData.skills
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        applicationDeadline: formData.applicationDeadline,
        jobType: formData.jobType,
        experienceLevel: formData.experienceLevel,
        workplaceType: formData.workplaceType,
      };

      if (formData.salaryMin || formData.salaryMax) {
        payload.salary = {
          min: Number(formData.salaryMin || 0),
          max: Number(formData.salaryMax || 0),
          currency: 'INR',
        };
      }

      if (editingJobId) {
        await updateJob(editingJobId, payload);
      } else {
        await createJob(payload);
      }

      setSuccess(editingJobId ? 'Job post updated successfully' : 'Job post created successfully');
      setFormData(INITIAL_FORM);
      setEditingJobId(null);
      await loadDashboard();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save job post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditJob = (job: Job) => {
    setEditingJobId(job._id);
    setFormData({
      title: job.title || '',
      company: job.company || '',
      description: job.description || '',
      location: job.location || '',
      requirements: (job.requirements || []).join(', '),
      skills: (job.skills || []).join(', '),
      applicationDeadline: job.applicationDeadline ? job.applicationDeadline.slice(0, 10) : '',
      salaryMin: job.salary?.min ? String(job.salary.min) : '',
      salaryMax: job.salary?.max ? String(job.salary.max) : '',
      salaryCurrency: 'INR',
      jobType: job.jobType || 'full-time',
      workplaceType: job.workplaceType || 'hybrid',
      experienceLevel: job.experienceLevel || 'mid',
    });
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingJobId(null);
    setFormData(INITIAL_FORM);
  };

  const fillDemoDetails = () => {
    const companies = [
      'Google', 'Meta', 'Microsoft', 'Amazon', 'Apple', 'Netflix', 
      'TCS', 'Wipro', 'Infosys', 'Accenture', 'IBM', 'Oracle',
      'Adobe', 'Salesforce', 'Tesla', 'SpaceX', 'Twitter', 'LinkedIn'
    ];
    
    const jobTitles = [
      'Senior Software Engineer', 'Full Stack Developer', 'DevOps Engineer',
      'Data Scientist', 'Product Manager', 'UI/UX Designer',
      'Backend Developer', 'Frontend Developer', 'Mobile App Developer',
      'Cloud Architect', 'Machine Learning Engineer', 'QA Engineer',
      'Technical Lead', 'Solutions Architect', 'System Administrator'
    ];
    
    const locations = [
      'Bengaluru, India',
      'Hyderabad, India',
      'Mumbai, India',
      'Pune, India',
      'Chennai, India',
      'Delhi, India',
      'Noida, India',
      'Gurugram, India',
      'Ahmedabad, India',
      'Kolkata, India',
      'Remote (India)'
    ];
    
    const descriptions = [
      'We are looking for a talented professional to join our dynamic team. You will work on cutting-edge technologies and solve complex problems that impact millions of users worldwide.',
      'Join our innovative team and work on exciting projects that push the boundaries of technology. We offer a collaborative environment and opportunities for growth.',
      'Be part of a fast-paced environment where you will contribute to products used by millions. We value creativity, innovation, and a passion for excellence.',
      'We are seeking an experienced professional to lead critical initiatives. You will work with cross-functional teams to deliver high-quality solutions.'
    ];
    
    const skillSets = [
      'React, TypeScript, Node.js, MongoDB, AWS',
      'Python, Django, PostgreSQL, Docker, Kubernetes',
      'Java, Spring Boot, Microservices, MySQL, Redis',
      'Angular, .NET, Azure, SQL Server, CI/CD',
      'Vue.js, Express, GraphQL, Firebase, GCP',
      'React Native, iOS, Android, Flutter, REST APIs'
    ];
    
    const requirementSets = [
      "Bachelor's degree in Computer Science, 5+ years experience, Strong problem-solving skills",
      "Master's degree preferred, 3+ years in relevant field, Excellent communication",
      "Bachelor's in Engineering, 4+ years experience, Team player, Agile methodology",
      "Degree in Computer Science, 2+ years experience, Self-motivated, Fast learner"
    ];
    
    const jobTypes: Job['jobType'][] = ['full-time', 'part-time', 'contract', 'internship'];
    const workplaceTypes: Job['workplaceType'][] = ['remote', 'hybrid', 'on-site'];
    const experienceLevels: Job['experienceLevel'][] = ['entry', 'mid', 'senior', 'lead'];
    
    const randomCompany = companies[Math.floor(Math.random() * companies.length)];
    const randomTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
    const randomSkills = skillSets[Math.floor(Math.random() * skillSets.length)];
    const randomRequirements = requirementSets[Math.floor(Math.random() * requirementSets.length)];
    const randomJobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
    const randomWorkplace = workplaceTypes[Math.floor(Math.random() * workplaceTypes.length)];
    const randomExperience = experienceLevels[Math.floor(Math.random() * experienceLevels.length)];
    
    const salaryMin = Math.floor(Math.random() * 50000) + 50000; // 50k-100k
    const salaryMax = salaryMin + Math.floor(Math.random() * 80000) + 20000; // +20k to +100k
    
    const today = new Date();
    const deadline = new Date(today.setDate(today.getDate() + Math.floor(Math.random() * 60) + 15));
    const formattedDeadline = deadline.toISOString().split('T')[0];
    
    setFormData({
      title: randomTitle,
      company: randomCompany,
      description: randomDescription,
      location: randomLocation,
      requirements: randomRequirements,
      skills: randomSkills,
      applicationDeadline: formattedDeadline,
      salaryMin: String(salaryMin),
      salaryMax: String(salaryMax),
      salaryCurrency: 'INR',
      jobType: randomJobType,
      workplaceType: randomWorkplace,
      experienceLevel: randomExperience,
    });
    
    setSuccess('Demo details filled! Click again for different data.');
    setTimeout(() => setSuccess(null), 2000);
  };

  const handleSelectJob = async (jobId: string) => {
    try {
      setError(null);
      setSelectedJobId(jobId);
      await loadApplications(jobId);
      
      // Scroll to applications section
      setTimeout(() => {
        const applicationsSection = document.getElementById('applications-section');
        if (applicationsSection) {
          applicationsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: any) {
      console.error('Error selecting job:', err);
      setError('Failed to load applications');
    }
  };

  const handleViewResume = async (applicationId: string, applicantName: string) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      // First, check if the resume URL is already a valid external URL
      const application = applications.find(app => app._id === applicationId);
      
      console.log('📄 Application found:', application);
      console.log('📄 Resume URL:', application?.resume);
      
      if (!application) {
        throw new Error('Application not found');
      }
      
      if (!application.resume) {
        throw new Error('No resume uploaded for this application');
      }
      
      // If resume is already a direct URL, open it directly
      if (application.resume.startsWith('http')) {
        console.log('📄 Opening direct resume URL:', application.resume);
        window.open(application.resume, '_blank', 'noopener,noreferrer');
        return;
      }
      
      // Otherwise, fetch through backend with auth
      const viewUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/resume/view/${applicationId}`;
      
      console.log('📄 Fetching resume from backend:', viewUrl);
      console.log('📄 Auth token present:', !!token);
      
      // Fetch the resume with auth token
      const response = await fetch(viewUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response content-type:', response.headers.get('content-type'));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: `Server error: ${response.status}` };
        }
        throw new Error(errorData.message || 'Failed to load resume');
      }

      const blob = await response.blob();
      console.log('✅ Blob received - Size:', blob.size, 'Type:', blob.type);
      
      if (blob.size === 0) {
        throw new Error('Resume file is empty');
      }

      const blobUrl = URL.createObjectURL(blob);
      console.log('✅ Blob URL created:', blobUrl);
      
      // Open in new window/tab
      const newWindow = window.open(blobUrl, '_blank', 'noopener,noreferrer');
      
      if (!newWindow) {
        // Fallback: create a link and click it
        console.log('⚠️  Pop-up blocked, using fallback');
        const link = document.createElement('a');
        link.href = blobUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setError('If the resume did not open, please allow pop-ups for this site');
      } else {
        console.log('✅ Resume opened in new window');
      }
      
      // Clean up the blob URL after some time
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
        console.log('🧹 Blob URL cleaned up');
      }, 60000);
    } catch (error: any) {
      console.error('❌ Error viewing resume:', error);
      setError(error.message || 'Failed to view resume. Please try again.');
    }
  };

  const handleDeleteJob = async (jobId: string, jobTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteJob(jobId);
      setSuccess('Job post deleted successfully');
      if (selectedJobId === jobId) {
        setSelectedJobId('');
        setApplications([]);
      }
      await loadDashboard();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete job post');
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-pink-50 via-white to-white py-12'>
      <div className='max-w-7xl mx-auto px-4 space-y-8'>
        <h1 className='text-4xl font-bold text-gray-900'>Company Dashboard</h1>

        {error && <div className='bg-red-50 border border-red-200 text-red-700 rounded-lg p-3'>{error}</div>}
        {success && <div className='bg-green-50 border border-green-200 text-green-700 rounded-lg p-3'>{success}</div>}

        {/* Interactive Stats Cards */}
        <div className='grid md:grid-cols-3 gap-6'>
          <button
            onClick={() => handleCardClick('total')}
            className='bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-left group cursor-pointer'
          >
            <div className='flex items-center justify-between'>
              <div className='text-3xl mb-2'>□</div>
              <div className='opacity-0 group-hover:opacity-100 transition-opacity'>
                <svg className='w-5 h-5 text-pink-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                </svg>
              </div>
            </div>
            <p className='text-gray-600 text-sm mb-1'>My Job Posts</p>
            <p className='text-2xl font-bold text-gray-900'>{jobs.length}</p>
            <p className='text-xs text-gray-500 mt-2'>Click to view all jobs</p>
          </button>

          <button
            onClick={() => handleCardClick('published')}
            className='bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-left group cursor-pointer'
          >
            <div className='flex items-center justify-between'>
              <div className='text-3xl mb-2'>✓</div>
              <div className='opacity-0 group-hover:opacity-100 transition-opacity'>
                <svg className='w-5 h-5 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                </svg>
              </div>
            </div>
            <p className='text-gray-600 text-sm mb-1'>Published Jobs</p>
            <p className='text-2xl font-bold text-gray-900'>{activeJobs}</p>
            <p className='text-xs text-gray-500 mt-2'>Click to filter published</p>
          </button>

          <button
            onClick={() => handleCardClick('applications')}
            className='bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-left group cursor-pointer'
          >
            <div className='flex items-center justify-between'>
              <div className='text-3xl mb-2'>✉</div>
              <div className='opacity-0 group-hover:opacity-100 transition-opacity'>
                <svg className='w-5 h-5 text-pink-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                </svg>
              </div>
            </div>
            <p className='text-gray-600 text-sm mb-1'>Total Applications</p>
            <p className='text-2xl font-bold text-gray-900'>{totalApplications}</p>
            <p className='text-xs text-gray-500 mt-2'>Click to view applications</p>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className='flex items-center gap-3 border-b border-gray-300'>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeTab === 'jobs'
                ? 'text-pink-600 border-b-2 border-pink-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Job Management
            {activeTab === 'jobs' && (
              <span className='absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500'></span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('applications');
              if (jobs.length > 0 && !selectedJobId) {
                const firstJob = jobs[0];
                setSelectedJobId(firstJob._id);
                loadApplications(firstJob._id);
              }
            }}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeTab === 'applications'
                ? 'text-pink-600 border-b-2 border-pink-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Applications
            {totalApplications > 0 && (
              <span className='ml-2 px-2 py-0.5 text-xs rounded-full bg-pink-500 text-white'>
                {totalApplications}
              </span>
            )}
          </button>
        </div>

        {/* Job Management Tab */}
        {activeTab === 'jobs' && (
          <>
            {/* Status Filter */}
            {jobs.length > 0 && (
              <div className='flex items-center gap-3'>
                <span className='text-sm font-medium text-gray-700'>Filter:</span>
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 text-sm rounded-lg font-medium transition ${
                    statusFilter === 'all'
                      ? 'bg-pink-500 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-pink-50'
                  }`}
                >
                  All ({jobs.length})
                </button>
                <button
                  onClick={() => setStatusFilter('published')}
                  className={`px-4 py-2 text-sm rounded-lg font-medium transition ${
                    statusFilter === 'published'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Published ({activeJobs})
                </button>
                <button
                  onClick={() => setStatusFilter('draft')}
                  className={`px-4 py-2 text-sm rounded-lg font-medium transition ${
                    statusFilter === 'draft'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Draft ({jobs.length - activeJobs})
                </button>
              </div>
            )}

            <div className='grid lg:grid-cols-2 gap-8'>
          <div className='bg-white rounded-xl border border-pink-100 shadow-sm p-5'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl font-bold text-gray-900'>
                {editingJobId ? 'Edit Job Post' : 'Create Job Post'}
              </h2>
              <button
                type='button'
                onClick={fillDemoDetails}
                className='px-3 py-1.5 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition font-medium'
              >
                Fill Demo
              </button>
            </div>
            <form className='space-y-4' onSubmit={handleSubmitJob}>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Job Title *</label>
                <input
                  value={formData.title}
                  onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                  className='w-full border border-gray-200 rounded-lg px-3 py-2'
                  placeholder='e.g., Senior Frontend Developer'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Company Name *</label>
                <input
                  value={formData.company}
                  onChange={(event) => setFormData((prev) => ({ ...prev, company: event.target.value }))}
                  className='w-full border border-gray-200 rounded-lg px-3 py-2'
                  placeholder='e.g., Tech Innovations Inc.'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Job Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                  className='w-full border border-gray-200 rounded-lg px-3 py-2 h-28'
                  placeholder='Describe the role, responsibilities, and what makes this opportunity great...'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Location *</label>
                <input
                  value={formData.location}
                  onChange={(event) => setFormData((prev) => ({ ...prev, location: event.target.value }))}
                  className='w-full border border-gray-200 rounded-lg px-3 py-2'
                  placeholder='e.g., New York, NY or Remote'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Requirements</label>
                <input
                  value={formData.requirements}
                  onChange={(event) => setFormData((prev) => ({ ...prev, requirements: event.target.value }))}
                  className='w-full border border-gray-200 rounded-lg px-3 py-2'
                  placeholder='e.g., Bachelor degree, 3+ years experience (comma separated)'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Required Skills</label>
                <input
                  value={formData.skills}
                  onChange={(event) => setFormData((prev) => ({ ...prev, skills: event.target.value }))}
                  className='w-full border border-gray-200 rounded-lg px-3 py-2'
                  placeholder='e.g., React, TypeScript, Node.js (comma separated)'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Salary Range</label>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                  <input
                    type='number'
                    min='0'
                    value={formData.salaryMin}
                    onChange={(event) => setFormData((prev) => ({ ...prev, salaryMin: event.target.value }))}
                    className='w-full border border-gray-200 rounded-lg px-3 py-2'
                    placeholder='Min (e.g., 80000)'
                  />
                  <input
                    type='number'
                    min='0'
                    value={formData.salaryMax}
                    onChange={(event) => setFormData((prev) => ({ ...prev, salaryMax: event.target.value }))}
                    className='w-full border border-gray-200 rounded-lg px-3 py-2'
                    placeholder='Max (e.g., 120000)'
                  />
                  <select
                    value={formData.salaryCurrency}
                    onChange={(event) => setFormData((prev) => ({ ...prev, salaryCurrency: event.target.value }))}
                    className='w-full border border-gray-200 rounded-lg px-3 py-2 bg-white'
                  >
                    <option value='INR'>INR (₹)</option>
                  </select>
                </div>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Job Type</label>
                  <select
                    value={formData.jobType}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, jobType: event.target.value as Job['jobType'] }))
                    }
                    className='w-full border border-gray-200 rounded-lg px-3 py-2 bg-white'
                  >
                    <option value='full-time'>Full Time</option>
                    <option value='part-time'>Part Time</option>
                    <option value='contract'>Contract</option>
                    <option value='internship'>Internship</option>
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Workplace Type</label>
                  <select
                    value={formData.workplaceType}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, workplaceType: event.target.value as Job['workplaceType'] }))
                    }
                    className='w-full border border-gray-200 rounded-lg px-3 py-2 bg-white'
                  >
                    <option value='hybrid'>Hybrid</option>
                    <option value='remote'>Remote</option>
                    <option value='on-site'>On Site</option>
                  </select>
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Experience Level</label>
                <select
                  value={formData.experienceLevel}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, experienceLevel: event.target.value as Job['experienceLevel'] }))
                  }
                  className='w-full border border-gray-200 rounded-lg px-3 py-2 bg-white'
                >
                  <option value='entry'>Entry</option>
                  <option value='mid'>Mid</option>
                  <option value='senior'>Senior</option>
                  <option value='lead'>Lead</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Application Deadline *</label>
                <input
                  type='date'
                  value={formData.applicationDeadline}
                  onChange={(event) => setFormData((prev) => ({ ...prev, applicationDeadline: event.target.value }))}
                  className='w-full border border-gray-200 rounded-lg px-3 py-2'
                  required
                />
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <button
                  type='submit'
                  disabled={submitting}
                  className='w-full bg-pink-500 text-white rounded-lg py-2.5 font-semibold disabled:opacity-60 hover:bg-pink-600'
                >
                  {submitting ? 'Saving...' : editingJobId ? 'Update Job' : 'Create Job'}
                </button>
                {editingJobId && (
                  <button
                    type='button'
                    onClick={handleCancelEdit}
                    className='w-full bg-gray-100 text-gray-700 rounded-lg py-2.5 font-semibold'
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className='bg-white rounded-xl border border-pink-100 shadow-sm p-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-4'>
              My Job Posts 
              {statusFilter !== 'all' && (
                <span className='ml-2 text-sm font-normal text-gray-600'>
                  ({statusFilter})
                </span>
              )}
            </h2>
            {loading ? (
              <p className='text-gray-600'>Loading jobs...</p>
            ) : filteredJobs.length === 0 ? (
              <div className='text-center py-8'>
                <p className='text-gray-600'>
                  {statusFilter === 'all' 
                    ? 'No job posts yet.' 
                    : `No ${statusFilter} jobs found.`}
                </p>
                {statusFilter !== 'all' && (
                  <button
                    onClick={() => setStatusFilter('all')}
                    className='mt-2 text-sm text-pink-600 hover:text-pink-700 font-medium'
                  >
                    View all jobs
                  </button>
                )}
              </div>
            ) : (
              <div className='space-y-2.5 max-h-[620px] overflow-y-auto pr-1'>
                {filteredJobs.map((job) => (
                  <div
                    key={job._id}
                    className={`w-full text-left border rounded-lg p-3 transition-all ${
                      selectedJobId === job._id
                        ? 'border-pink-400 bg-pink-50 shadow-md'
                        : 'border-gray-200 hover:border-pink-200 hover:shadow-sm'
                    }`}
                  >
                    <div className='flex items-center justify-between gap-3 mb-2'>
                      <h3 className='font-semibold text-gray-900 text-sm md:text-base'>{job.title}</h3>
                      <div className='flex items-center gap-2'>
                        {selectedJobId === job._id && (
                          <span className='text-xs px-2 py-1 rounded-full bg-pink-500 text-white font-medium'>
                            Active
                          </span>
                        )}
                        <span className='text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize'>
                          {job.status}
                        </span>
                      </div>
                    </div>
                    <p className='text-sm text-gray-600 mt-1'>
                      {job.location} • {job.jobType} • {job.workplaceType}
                    </p>
                    <p className='text-sm text-gray-600 mt-1 font-medium'>
                      Applications: <span className='text-pink-600'>{applicationCounts[job._id] || 0}</span>
                    </p>
                    <div className='flex items-center gap-2 mt-2.5 pt-2.5 border-t border-gray-200'>
                      <button
                        type='button'
                        onClick={() => handleSelectJob(job._id)}
                        className={`flex-1 px-3 py-1.5 text-xs md:text-sm rounded-md font-semibold transition-all ${
                          selectedJobId === job._id
                            ? 'bg-pink-600 text-white shadow-md'
                            : 'bg-pink-500 text-white hover:bg-pink-600'
                        }`}
                      >
                        {selectedJobId === job._id ? '✓ Viewing' : 'View Applications'}
                      </button>
                      <button
                        type='button'
                        onClick={() => handleEditJob(job)}
                        className='px-3 py-1.5 text-xs md:text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium'
                      >
                        Edit
                      </button>
                      <button
                        type='button'
                        onClick={() => handleDeleteJob(job._id, job.title)}
                        className='px-3 py-1.5 text-xs md:text-sm rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition font-medium'
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
          </>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <>
            {/* Job Selector for Applications */}
            {jobs.length > 0 && (
              <div className='bg-white rounded-xl border border-pink-100 shadow-sm p-6'>
                <h2 className='text-xl font-bold text-gray-900 mb-4'>Select Job to View Applications</h2>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {jobs.map((job) => (
                    <button
                      key={job._id}
                      onClick={() => handleSelectJob(job._id)}
                      className={`text-left border-2 rounded-lg p-4 transition-all ${
                        selectedJobId === job._id
                          ? 'border-pink-400 bg-pink-50 shadow-md'
                          : 'border-gray-200 hover:border-pink-200 hover:shadow-sm'
                      }`}
                    >
                      <div className='flex items-center justify-between gap-2 mb-2'>
                        <h3 className='font-bold text-gray-900 text-sm'>{job.title}</h3>
                        {selectedJobId === job._id && (
                          <span className='text-xs px-2 py-1 rounded-full bg-pink-500 text-white font-medium'>
                            Active
                          </span>
                        )}
                      </div>
                      <p className='text-xs text-gray-600'>
                        {job.location} • {job.jobType}
                      </p>
                      <div className='mt-2 pt-2 border-t border-gray-200'>
                        <span className='text-xs font-semibold text-pink-600'>
                          {applicationCounts[job._id] || 0} Applications
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div id='applications-section' className='bg-white rounded-xl border border-pink-100 shadow-sm p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-bold text-gray-900'>Applications</h2>
            {selectedJobId && (
              <span className='text-sm px-3 py-1 bg-pink-100 text-pink-700 rounded-full font-medium'>
                {applications.length} {applications.length === 1 ? 'Application' : 'Applications'}
              </span>
            )}
          </div>
          {!selectedJobId ? (
            <div className='text-center py-12'>
              <svg className='w-16 h-16 text-gray-300 mx-auto mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
              </svg>
              <p className='text-gray-600 font-medium'>Select a job post to view applications</p>
              <p className='text-sm text-gray-500 mt-1'>Click on "View Applications" button above</p>
            </div>
          ) : applications.length === 0 ? (
            <div className='text-center py-12'>
              <svg className='w-16 h-16 text-gray-300 mx-auto mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' />
              </svg>
              <p className='text-gray-600 font-medium'>No applications yet for this job</p>
              <p className='text-sm text-gray-500 mt-1'>Applications will appear here when candidates apply</p>
            </div>
          ) : (
            <div className='space-y-3'>
              {applications.map((application) => {
                const applicant = typeof application.userId === 'string' ? null : application.userId;
                const prediction = application.hirePrediction;
                const fitScore = prediction?.hireProbability ?? application.matchScore;
                const appliedDate = new Date(application.appliedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
                console.log('Application resume URL:', application.resume, 'for', applicant?.name);
                return (
                  <div key={application._id} className='border border-gray-200 rounded-lg p-5 hover:border-pink-300 hover:shadow-md transition-all'>
                    {/* Header with Status and Match Score */}
                    <div className='flex items-center justify-between mb-4 pb-3 border-b border-gray-100'>
                      <div className='flex items-center gap-3'>
                        <div className='w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-bold text-lg'>
                          {applicant?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div>
                          <h3 className='font-bold text-gray-900 text-lg'>{applicant?.name || 'Applicant'}</h3>
                          <p className='text-xs text-gray-500'>Applied on {appliedDate}</p>
                        </div>
                      </div>
                      <div className='flex flex-col items-end gap-2'>
                        <span className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize ${
                          application.status === 'applied' ? 'bg-pink-50 text-pink-700' :
                          application.status === 'reviewing' ? 'bg-yellow-50 text-yellow-700' :
                          application.status === 'shortlisted' ? 'bg-green-50 text-green-700' :
                          application.status === 'rejected' ? 'bg-red-50 text-red-700' :
                          application.status === 'offer' ? 'bg-purple-50 text-purple-700' :
                          'bg-emerald-50 text-emerald-700'
                        }`}>
                          {application.status}
                        </span>
                        {typeof fitScore === 'number' && (
                          <div className='flex items-center gap-1 text-xs'>
                            <span className='text-gray-600'>AI Fit:</span>
                            <span className='font-bold text-pink-600'>{fitScore}%</span>
                          </div>
                        )}
                        {prediction?.verdict && (
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getVerdictBadgeClass(prediction.verdict)}`}>
                            {getVerdictLabel(prediction.verdict)}
                          </span>
                        )}
                      </div>
                    </div>

                    {prediction && (
                      <div className='mb-3 rounded-lg border border-pink-100 bg-pink-50 p-3'>
                        <p className='text-xs font-semibold text-pink-700 mb-1'>AI Hiring Prediction</p>
                        <p className='text-sm text-pink-900'>{prediction.summary}</p>
                        {prediction.missingSkills?.length > 0 && (
                          <div className='mt-3'>
                            <p className='text-xs font-semibold text-gray-700 mb-2'>Skills to add in resume</p>
                            <div className='flex flex-wrap gap-2'>
                              {prediction.missingSkills.slice(0, 6).map((skill) => (
                                <span
                                  key={`${application._id}-${skill}`}
                                  className='px-2.5 py-1 text-xs rounded-full bg-orange-100 text-orange-700 font-medium'
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Contact Information */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-3'>
                      <div className='flex items-center gap-2 bg-gray-50 rounded-lg p-3'>
                        <svg className='w-4 h-4 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                        </svg>
                        <div className='flex-1'>
                          <span className='text-xs font-semibold text-gray-600 block'>Email</span>
                          <span className='text-sm text-gray-900'>{applicant?.email || '-'}</span>
                        </div>
                      </div>
                      {applicant?.phone && (
                        <div className='flex items-center gap-2 bg-gray-50 rounded-lg p-3'>
                          <svg className='w-4 h-4 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                          </svg>
                          <div className='flex-1'>
                            <span className='text-xs font-semibold text-gray-600 block'>Phone</span>
                            <span className='text-sm text-gray-900'>{applicant.phone}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cover Letter Section */}
                    {application.coverLetter && (
                      <div className='mt-4 pt-4 border-t border-gray-200'>
                        <div className='flex items-center gap-2 mb-2'>
                          <svg className='w-4 h-4 text-pink-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                          </svg>
                          <span className='text-xs font-bold text-gray-700'>Cover Letter</span>
                        </div>
                        <div className='bg-gray-50 rounded-lg p-3'>
                          <p className='text-sm text-gray-700 leading-relaxed whitespace-pre-line'>{application.coverLetter}</p>
                        </div>
                      </div>
                    )}

                    {/* Resume Section */}
                    {application.resume && (
                      <div className='mt-4 pt-4 border-t border-gray-200'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <svg className='w-4 h-4 text-pink-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                            </svg>
                            <span className='text-xs font-bold text-gray-700'>Resume</span>
                          </div>
                          <button
                            onClick={() => handleViewResume(application._id, applicant?.name || 'Applicant')}
                            className='inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-pink-600 text-white hover:bg-pink-700 transition-all hover:shadow-md font-medium'
                          >
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                            </svg>
                            View Resume
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  );
};
