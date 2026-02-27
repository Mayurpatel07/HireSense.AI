import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getJobs, getAIMatchedJobs } from '../services/jobService';
import { Job } from '../types';
import { JobCard } from '../components/JobCard';
import { SearchBar } from '../components/SearchBar';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';

export const JobListings: React.FC = () => {
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [searchParams] = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAIMatching, setShowAIMatching] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    jobType: '',
    experienceLevel: '',
    workplaceType: '',
  });

  const fetchJobs = async (page = 1, searchFilters = filters, useAIMatching = showAIMatching) => {
    try {
      setLoading(true);
      let response;
      
      if (useAIMatching && user?.role === 'user') {
        // Use AI-powered matching
        response = await getAIMatchedJobs({
          ...searchFilters,
          page,
          limit: 12,
        });
      } else {
        // Use normal job listing
        response = await getJobs({
          ...searchFilters,
          page,
          limit: 12,
        });
      }
      
      setJobs(response.jobs);
      setPagination(response.pagination);
    } catch (error) {
      addToast('Failed to load jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const aiParam = searchParams.get('ai');
    const shouldUseAI = (aiParam === '1' || aiParam === 'true') && user?.role === 'user';
    
    setShowAIMatching(shouldUseAI);
    fetchJobs(1, filters, shouldUseAI);
  }, [user]);

  const handleSearch = (query: string) => {
    const newFilters = { ...filters, search: query };
    setFilters(newFilters);
    fetchJobs(1, newFilters);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    fetchJobs(1, newFilters, showAIMatching);
  };

  const handleToggleAIMatching = () => {
    if (!user || user.role !== 'user') {
      addToast('AI matching is only available for job seekers', 'info');
      return;
    }
    const newShowAI = !showAIMatching;
    setShowAIMatching(newShowAI);
    fetchJobs(1, filters, newShowAI);
  };

  const handleApply = (job: Job) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    // Navigate to job details page where user can apply
    window.location.href = `/jobs/${job._id}`;
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className='min-h-screen bg-gradient-to-b from-pink-50 via-white to-white py-12'>
        <div className='max-w-7xl mx-auto px-4'>
          {/* Header */}
          <div className='mb-10'>
            <span className='inline-flex px-3 py-1 rounded-full bg-pink-50 text-pink-600 text-sm font-semibold mb-4'>
              Curated opportunities
            </span>
            <h1 className='text-4xl font-bold text-gray-900 mb-3'>
              Find Your Next Opportunity
            </h1>
            <p className='text-lg text-gray-600'>
              Explore {pagination?.total || 0} job opportunities matched with your skills
            </p>
          </div>

          {/* Search and Filters */}
          <div className='mb-8 p-5 bg-white border border-pink-50 rounded-2xl shadow-sm'>
            <SearchBar onSearch={handleSearch} onFiltersChange={handleFilterChange} />
          </div>

          {/* AI Matching Toggle */}
          {user?.role === 'user' && (
            <div className='mb-8 flex items-center justify-between p-4 bg-white rounded-xl border border-pink-50 shadow-sm'>
              <div className='flex items-center gap-3'>
                <svg className='w-6 h-6 text-pink-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
                </svg>
                <div>
                  <p className='font-semibold text-gray-900'>AI-Powered Matching</p>
                  <p className='text-sm text-gray-600'>See jobs ranked by your resume fit</p>
                </div>
              </div>
              <button
                onClick={handleToggleAIMatching}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  showAIMatching
                    ? 'bg-pink-400 hover:bg-pink-500'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    showAIMatching ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className='text-center py-12'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto mb-4'></div>
              <p className='text-gray-600'>Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className='text-center py-12'>
              <p className='text-lg text-gray-600 mb-4'>No jobs found matching your criteria.</p>
              <button
                onClick={() => {
                  setFilters({
                    search: '',
                    location: '',
                    jobType: '',
                    experienceLevel: '',
                    workplaceType: '',
                  });
                  fetchJobs(1, {
                    search: '',
                    location: '',
                    jobType: '',
                    experienceLevel: '',
                    workplaceType: '',
                  });
                }}
                className='px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition'
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {/* Jobs Grid */}
              <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12'>
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} onApply={handleApply} />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className='flex justify-center gap-2'>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => {
                        setCurrentPage(page);
                        fetchJobs(page);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        page === currentPage
                          ? 'bg-pink-500 text-white'
                          : 'bg-white border border-pink-200 hover:border-pink-400 text-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};
