import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InterviewQuestionsResult } from '../types';

interface InterviewQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: InterviewQuestionsResult | null;
  isLoading: boolean;
}

export const InterviewQuestionsModal: React.FC<InterviewQuestionsModalProps> = ({
  isOpen,
  onClose,
  data,
  isLoading,
}) => {
  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === 'beginner') return 'bg-green-100 text-green-800';
    if (difficulty === 'intermediate') return 'bg-yellow-100 text-yellow-800';
    if (difficulty === 'advanced') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: string) => {
    return '';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className='bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl'
          >
            {/* Header */}
            <div className='sticky top-0 bg-gradient-to-r from-pink-500 to-pink-600 text-white p-6 border-b border-pink-100'>
              <div className='flex items-start justify-between'>
                <div>
                  <h2 className='text-2xl font-bold mb-2'>
                    Interview Preparation Guide
                  </h2>
                  {data?.jobTitle && (
                    <p className='text-pink-100'>Position: {data.jobTitle}</p>
                  )}
                  {data?.keySkills && data.keySkills.length > 0 && (
                    <div className='mt-3 flex flex-wrap gap-2'>
                      {data.keySkills.map((skill) => (
                        <span
                          key={skill}
                          className='px-3 py-1 bg-pink-100 text-pink-900 text-xs font-semibold rounded-full'
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className='p-2 hover:bg-pink-700 rounded-lg transition'
                >
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className='p-6'>
              {isLoading ? (
                <div className='text-center py-12'>
                  <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4'></div>
                  <p className='text-gray-600'>Generating interview questions...</p>
                </div>
              ) : data?.questions && data.questions.length > 0 ? (
                <div className='space-y-4'>
                  {data.questions.map((question) => (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: question.id * 0.05 }}
                      className='border border-pink-100 rounded-lg p-5 hover:border-pink-300 hover:shadow-md transition'
                    >
                      {/* Question Header */}
                      <div className='flex items-start gap-4 mb-3'>
                        <div className='text-2xl'>{getCategoryIcon(question.category)}</div>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-2'>
                            <span className='font-semibold text-gray-900'>
                              Question {question.id}
                            </span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(question.difficulty)}`}>
                              {question.difficulty}
                            </span>
                            <span className='px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full'>
                              {question.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Question Text */}
                      <p className='text-gray-700 leading-relaxed text-base'>
                        {question.question}
                      </p>

                      {/* Tip Section */}
                      <div className='mt-3 p-3 bg-pink-50 border border-pink-200 rounded-lg'>
                        <p className='text-sm text-pink-900'>
                          <span className='font-semibold'>Tip:</span> Provide specific examples from your experience. Use the STAR method (Situation, Task, Action, Result) for behavioral questions.
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {/* Footer Tips */}
                  <div className='mt-8 p-5 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg'>
                    <h3 className='font-bold text-gray-900 mb-3'>Interview Tips</h3>
                    <ul className='space-y-2 text-sm text-gray-700'>
                      <li>✓ Practice answering these questions out loud before your interview</li>
                      <li>✓ Research the company thoroughly and mention specific details</li>
                      <li>✓ Provide concrete examples with measurable results</li>
                      <li>✓ Ask thoughtful questions about the role and company</li>
                      <li>✓ Be confident, authentic, and enthusiastic about the opportunity</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className='text-center py-12'>
                  <p className='text-gray-600'>No questions available</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className='sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3'>
              <button
                onClick={onClose}
                className='px-6 py-2.5 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition'
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className='px-6 py-2.5 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition flex items-center gap-2'
              >
                <svg
                  className='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4'
                  />
                </svg>
                Print Questions
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
