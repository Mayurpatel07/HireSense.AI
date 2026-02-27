import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { applyJob, getJobById, getJobPrediction, getMyApplicationForJob, getInterviewQuestions } from '../services/jobService';
import { Job, InterviewQuestionsResult } from '../types';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { Modal } from '../components/Modal';
import { InterviewQuestionsModal } from '../components/InterviewQuestionsModal';

type PredictionData = {
  hireProbability: number;
  verdict: 'likely' | 'uncertain' | 'unlikely';
  missingSkills: string[];
  summary: string;
};

export const JobDetails: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationPrediction, setApplicationPrediction] = useState<PredictionData | null>(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestionsResult | null>(null);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);

  const setPredictionFromPayload = (prediction: any) => {
    if (prediction?.hireProbability === undefined) return;

    setApplicationPrediction({
      hireProbability: prediction.hireProbability,
      verdict: prediction.verdict,
      missingSkills: Array.isArray(prediction.missingSkills) ? prediction.missingSkills : [],
      summary: prediction.summary || '',
    });
  };

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await getJobById(id!);
        setJob(response.job);

        // Check if user already applied
        if (user && response.job.applicants.includes(user._id)) {
          setHasApplied(true);
        }

        // Hydrate existing application + prediction for refresh persistence
        if (user?.role === 'user') {
          try {
            const myApplicationResponse = await getMyApplicationForJob(response.job._id);
            const existingApplication = myApplicationResponse?.application;

            if (existingApplication) {
              setHasApplied(true);
              setPredictionFromPayload(existingApplication.hirePrediction);
            }
          } catch (applicationError: any) {
            if (applicationError?.response?.status !== 404) {
              console.error('Failed to fetch existing application:', applicationError);
            }
          }
        }
      } catch (error: any) {
        addToast('Failed to load job details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, user]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-gray-600'>Job not found</p>
      </div>
    );
  }

  const formatSalary = (salary: any) => {
    if (!salary) return 'Not specified';
    const inrFormatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    });

    if (salary.min && salary.max) {
      return `${inrFormatter.format(Number(salary.min))} - ${inrFormatter.format(Number(salary.max))}`;
    }
    if (salary.min) return inrFormatter.format(Number(salary.min));
    if (salary.max) return inrFormatter.format(Number(salary.max));
    return 'Not specified';
  };

  const handleApply = async () => {
    if (!job) return;

    try {
      setApplying(true);
      const applyResponse = await applyJob(job._id, '', coverLetter);
      const prediction = applyResponse?.prediction;

      setPredictionFromPayload(prediction);

      if (prediction?.hireProbability !== undefined) {
        const topSkills = Array.isArray(prediction.missingSkills)
          ? prediction.missingSkills.slice(0, 3).join(', ')
          : '';

        addToast(
          `Application submitted! AI fit score: ${prediction.hireProbability}%. ${topSkills ? `Add: ${topSkills}` : ''}`,
          'success'
        );
      } else {
        addToast('Application submitted successfully!', 'success');
      }

      setShowApplyModal(false);
      setCoverLetter('');
      setHasApplied(true);

      const response = await getJobById(job._id);
      setJob(response.job);
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to apply for this job', 'error');
    } finally {
      setApplying(false);
    }
  };

  const handleGetPrediction = async () => {
    if (!job) return;

    try {
      setPredicting(true);
      const response = await getJobPrediction(job._id);
      const prediction = response?.prediction;

      if (!prediction || prediction.hireProbability === undefined) {
        addToast('Could not generate prediction right now. Please try again.', 'error');
        return;
      }

      setApplicationPrediction({
        hireProbability: prediction.hireProbability,
        verdict: prediction.verdict,
        missingSkills: Array.isArray(prediction.missingSkills) ? prediction.missingSkills : [],
        summary: prediction.summary || '',
      });

      addToast(`AI prediction ready: ${prediction.hireProbability}% fit`, 'success');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to get prediction', 'error');
    } finally {
      setPredicting(false);
    }
  };

  const handleGetInterviewQuestions = async () => {
    if (!job) return;

    try {
      setGeneratingQuestions(true);
      const response = await getInterviewQuestions(job._id);

      if (response?.data) {
        setInterviewQuestions(response.data);
        setShowInterviewModal(true);
        addToast('Interview questions generated successfully!', 'success');
      } else {
        addToast('Could not generate interview questions right now. Please try again.', 'error');
      }
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to generate interview questions', 'error');
    } finally {
      setGeneratingQuestions(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <Modal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} title=''>
        <div className='space-y-6'>
          {/* Header */}
          <div className='text-center pb-4'>
            <div className='w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
              </svg>
            </div>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>Apply for Position</h2>
            <p className='text-gray-600'>
              {job.company} • <span className='font-semibold text-gray-900'>{job.title}</span>
            </p>
          </div>

          {/* Info Cards */}
          <div className='grid grid-cols-3 gap-3'>
            <div className='bg-pink-50 rounded-lg p-3 text-center border border-pink-100'>
              <p className='text-xs text-pink-600 font-medium mb-1'>Location</p>
              <p className='text-sm font-bold text-pink-900'>{job.location}</p>
            </div>
            <div className='bg-green-50 rounded-lg p-3 text-center'>
              <p className='text-xs text-green-600 font-medium mb-1'>Type</p>
              <p className='text-sm font-bold text-green-900 capitalize'>{job.jobType}</p>
            </div>
            <div className='bg-pink-50 rounded-lg p-3 text-center border border-pink-100'>
              <p className='text-xs text-pink-600 font-medium mb-1'>Experience</p>
              <p className='text-sm font-bold text-pink-900 capitalize'>{job.experienceLevel}</p>
            </div>
          </div>

          {/* Resume Check */}
          <div className='bg-pink-50 border border-pink-100 rounded-lg p-4'>
            <div className='flex items-start gap-3'>
              <div className='flex-shrink-0'>
                <svg className='w-5 h-5 text-pink-600 mt-0.5' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' clipRule='evenodd' />
                </svg>
              </div>
              <div className='flex-1'>
                <h4 className='text-sm font-semibold text-pink-900 mb-1'>Resume from Profile</h4>
                <p className='text-xs text-pink-700'>
                  Your resume from your profile will be automatically attached to this application.
                </p>
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <label className='block text-sm font-semibold text-gray-900 mb-2'>
              Cover Letter <span className='text-gray-500 font-normal'>(Optional but recommended)</span>
            </label>
            <textarea
              value={coverLetter}
              onChange={(event) => setCoverLetter(event.target.value)}
              placeholder='Share why you are passionate about this role and what makes you a great fit...'
              rows={6}
              className='w-full border-2 border-pink-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition resize-none'
            />
            <p className='text-xs text-gray-500 mt-2'>
              {coverLetter.length}/1000 characters
            </p>
          </div>

          {/* Action Buttons */}
          {applicationPrediction && (
            <div className='rounded-lg border border-pink-100 bg-pink-50 p-4'>
              <div className='flex items-center justify-between gap-3 mb-2'>
                <p className='text-sm font-semibold text-gray-900'>AI Fit Prediction</p>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${
                  applicationPrediction.verdict === 'likely'
                    ? 'bg-green-100 text-green-700'
                    : applicationPrediction.verdict === 'uncertain'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                }`}>
                  {applicationPrediction.verdict}
                </span>
              </div>
              <p className='text-sm text-gray-700 mb-2'>
                Match Score: <span className='font-bold text-pink-600'>{applicationPrediction.hireProbability}%</span>
              </p>
              {applicationPrediction.summary && (
                <p className='text-sm text-gray-700 mb-3'>{applicationPrediction.summary}</p>
              )}
              {applicationPrediction.missingSkills.length > 0 && (
                <div>
                  <p className='text-xs font-semibold text-gray-600 mb-2'>Skills to add in resume:</p>
                  <div className='flex flex-wrap gap-2'>
                    {applicationPrediction.missingSkills.slice(0, 6).map((skill) => (
                      <span
                        key={`pre-${skill}`}
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

          <div className='flex items-center gap-3 pt-4'>
            <button
              type='button'
              onClick={() => {
                setShowApplyModal(false);
                setCoverLetter('');
              }}
              className='flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition'
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={handleGetPrediction}
              disabled={predicting || applying}
              className='flex-1 px-6 py-3 bg-white border-2 border-pink-400 text-pink-600 rounded-lg font-semibold hover:bg-pink-50 transition disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {predicting ? 'Checking...' : 'Get AI Prediction'}
            </button>
            <button
              type='button'
              onClick={handleApply}
              disabled={applying || predicting}
              className='flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
            >
              {applying ? (
                <>
                  <svg className='animate-spin h-5 w-5 text-white' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Application
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M14 5l7 7m0 0l-7 7m7-7H3' />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      <div className='min-h-screen bg-gradient-to-b from-pink-50 via-white to-white py-12'>
        <div className='max-w-4xl mx-auto px-4'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-white rounded-2xl border border-pink-100 shadow-sm p-8'
          >
            {/* Header */}
            <div className='mb-8'>
              <div className='flex items-start justify-between mb-4'>
                <div>
                  <h1 className='text-4xl font-bold text-gray-900'>{job.title}</h1>
                  <p className='text-xl text-gray-600 mt-2'>{job.company}</p>
                </div>
                {job.featured && (
                  <span className='px-4 py-2 bg-yellow-100 text-yellow-700 font-semibold rounded-lg'>
                    ⭐ Featured
                  </span>
                )}
              </div>

              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-200'>
                <div>
                  <p className='text-sm text-gray-500'>Location</p>
                  <p className='text-lg font-semibold text-gray-900'>{job.location}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Job Type</p>
                  <p className='text-lg font-semibold text-gray-900 capitalize'>{job.jobType}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Experience</p>
                  <p className='text-lg font-semibold text-gray-900 capitalize'>{job.experienceLevel}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Salary</p>
                  <p className='text-lg font-semibold text-pink-600'>{formatSalary(job.salary)}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className='mb-8'>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>About this role</h2>
              <p className='text-gray-600 leading-relaxed whitespace-pre-wrap'>{job.description}</p>
            </div>

            {/* Requirements */}
            <div className='mb-8'>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>Requirements</h2>
              <ul className='space-y-3'>
                {job.requirements.map((req, idx) => (
                  <li key={idx} className='flex items-start gap-3 text-gray-600'>
                    <span className='text-pink-500 font-bold mt-1'>✓</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Skills */}
            <div className='mb-8'>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>Required Skills</h2>
              <div className='flex flex-wrap gap-2'>
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className='px-4 py-2 bg-pink-50 text-pink-700 font-medium rounded-lg border border-pink-100'
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* More Info */}
            <div className='grid md:grid-cols-2 gap-6 py-6 border-t border-gray-200'>
              <div>
                <h3 className='font-semibold text-gray-900 mb-2'>Workplace Type</h3>
                <p className='text-gray-600 capitalize'>{job.workplaceType}</p>
              </div>
              <div>
                <h3 className='font-semibold text-gray-900 mb-2'>Application Deadline</h3>
                <p className='text-gray-600'>{new Date(job.applicationDeadline).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Apply Button */}
            {user && user.role === 'user' ? (
              hasApplied ? (
                <div className='mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl text-center'>
                  <div className='flex items-center justify-center gap-2 mb-2'>
                    <svg className='w-6 h-6 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                      <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                    </svg>
                    <p className='text-lg font-bold text-green-900'>Application Submitted!</p>
                  </div>
                  <p className='text-sm text-green-700'>
                    You have already applied for this position. The company will review your application soon.
                  </p>

                  {applicationPrediction && (
                    <div className='mt-5 text-left bg-white border border-green-200 rounded-lg p-4'>
                      <div className='flex items-center justify-between gap-3 mb-2'>
                        <p className='text-sm font-semibold text-gray-900'>AI Fit Prediction</p>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${
                          applicationPrediction.verdict === 'likely'
                            ? 'bg-green-100 text-green-700'
                            : applicationPrediction.verdict === 'uncertain'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}>
                          {applicationPrediction.verdict}
                        </span>
                      </div>

                      <p className='text-sm text-gray-700 mb-3'>
                        Match Score: <span className='font-bold text-pink-600'>{applicationPrediction.hireProbability}%</span>
                      </p>

                      {applicationPrediction.summary && (
                        <p className='text-sm text-gray-700 mb-3'>{applicationPrediction.summary}</p>
                      )}

                      {applicationPrediction.missingSkills.length > 0 && (
                        <div>
                          <p className='text-xs font-semibold text-gray-600 mb-2'>Skills to add in resume:</p>
                          <div className='flex flex-wrap gap-2'>
                            {applicationPrediction.missingSkills.slice(0, 6).map((skill) => (
                              <span
                                key={skill}
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

                  {/* Interview Prep Button */}
                  <button
                    onClick={handleGetInterviewQuestions}
                    disabled={generatingQuestions}
                    className='w-full mt-4 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                  >
                    {generatingQuestions ? (
                      <>
                        <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent'></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                        Get AI-Based Interview Preparation
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className='w-full mt-8 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-lg font-bold rounded-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2'
                >
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                  </svg>
                  Apply Now
                </button>
              )
            ) : user && user.role === 'company' ? (
              <div className='mt-8 p-6 bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-200 rounded-xl'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center'>
                      <svg className='w-6 h-6 text-white' fill='currentColor' viewBox='0 0 20 20'>
                        <path d='M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z' />
                      </svg>
                    </div>
                    <div>
                      <p className='text-sm text-pink-600 font-medium'>Total Applicants</p>
                      <p className='text-2xl font-bold text-pink-900'>{job.applicants.length}</p>
                    </div>
                  </div>
                  <span className='text-xs px-3 py-1.5 bg-pink-600 text-white rounded-full font-medium'>
                    Company View
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => (window.location.href = '/login')}
                className='w-full mt-8 py-4 bg-gradient-to-r from-gray-700 to-gray-900 text-white text-lg font-bold rounded-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2'
              >
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1' />
                </svg>
                Login to Apply
              </button>
            )}
          </motion.div>
        </div>
      </div>

      <InterviewQuestionsModal
        isOpen={showInterviewModal}
        onClose={() => setShowInterviewModal(false)}
        data={interviewQuestions}
        isLoading={generatingQuestions}
      />
    </>
  );
};
