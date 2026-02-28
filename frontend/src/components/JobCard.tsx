import React from 'react';
import { motion } from 'framer-motion';
import { Job } from '../types';
import { Link } from 'react-router-dom';

interface JobCardProps {
  job: Job;
  onApply?: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onApply }) => {
  const safeSkills = Array.isArray(job.skills) ? job.skills : [];

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

  const getAIMatchBadgeClass = () => {
    if (!job.aiMatch) return '';
    const score = job.aiMatch.score;
    if (score >= 70) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 45) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  return (
    <motion.div
      whileHover={{ translateY: -4 }}
      className='bg-white rounded-2xl border border-pink-50 hover:border-pink-200 p-6 transition-all duration-300 shadow-sm hover:shadow-lg relative'
    >
      {job.aiMatch && (
        <div className='absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold bg-gradient-to-r' 
             style={
               job.aiMatch.score >= 70 
                 ? { backgroundImage: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', color: '#166534', borderColor: '#86efac' }
                 : job.aiMatch.score >= 45
                 ? { backgroundImage: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)', color: '#92400e', borderColor: '#fde047' }
                 : { backgroundImage: 'linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)', color: '#991b1b', borderColor: '#fca5a5' }
             }>
          AI Match
          <span className='font-bold'>{job.aiMatch.score}%</span>
        </div>
      )}
      <div className='flex items-start justify-between mb-4'>
        <div>
          <Link to={`/jobs/${job._id}`}>
            <h3 className='text-xl font-bold text-gray-900 hover:text-pink-500 transition'>
              {job.title}
            </h3>
          </Link>
          <p className='text-sm text-gray-500 mt-1'>{job.company}</p>
        </div>
        {job.featured && (
          <span className='px-3 py-1 bg-pink-50 text-pink-600 text-xs font-semibold rounded-full'>
            Featured
          </span>
        )}
      </div>

      <div className='flex items-center gap-4 mb-4 text-sm text-gray-600'>
        <span className='flex items-center gap-1'>{job.location}</span>
        <span className='flex items-center gap-1'>{job.jobType}</span>
        <span className='flex items-center gap-1'>{job.experienceLevel}</span>
      </div>

      <p className='text-gray-600 text-sm mb-4 line-clamp-2'>{job.description}</p>

      <div className='mb-4'>
        <div className='flex flex-wrap gap-2 mb-3'>
          {safeSkills.slice(0, 3).map((skill) => (
            <span key={skill} className='px-3 py-1 bg-pink-50 text-pink-600 text-xs font-medium rounded-full'>
              {skill}
            </span>
          ))}
          {safeSkills.length > 3 && (
            <span className='px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full'>
              +{safeSkills.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className='flex items-center justify-between pt-4 border-t border-gray-100'>
        <div>
          <p className='text-pink-500 font-bold'>{formatSalary(job.salary)}</p>
          <p className='text-xs text-gray-500 capitalize'>{job.workplaceType}</p>
        </div>
        <Link to={`/jobs/${job._id}`}>
          <button
            className='px-5 py-2.5 bg-pink-500 text-white text-sm font-semibold rounded-lg hover:bg-pink-600 hover:shadow-lg transition-all flex items-center gap-2'
          >
            View & Apply
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
            </svg>
          </button>
        </Link>
      </div>
    </motion.div>
  );
};
