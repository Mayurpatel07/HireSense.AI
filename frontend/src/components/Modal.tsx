import React from 'react';
import { motion } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className='fixed inset-0 bg-black/50 z-40'
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className='fixed inset-0 flex items-center justify-center z-50 p-4'
      >
        <div className='bg-white rounded-2xl max-w-lg w-full max-h-screen overflow-y-auto'>
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white'>
            <h2 className='text-2xl font-bold text-gray-900'>{title}</h2>
            <button
              onClick={onClose}
              className='p-1 text-gray-500 hover:text-gray-700 transition'
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className='p-6'>{children}</div>
        </div>
      </motion.div>
    </>
  );
};

// 2026-03-29 09:15:00 - docs: add troubleshooting guide


// 2026-04-05 16:15:00 - test(frontend): add E2E tests


// 2026-04-06 13:00:00 - feat(frontend): create useAuth custom hook


// 2026-04-19 09:15:00 - refactor(frontend): optimize bundle size


// 2026-04-20 10:45:00 - feat(frontend): create job search page with filters


// 2026-04-24 13:30:00 - feat(frontend): add Loading spinner component


// 2026-05-24 15:20:00 - feat(frontend): create user profile page


// 2026-05-28 09:15:00 - feat: add company reviews and ratings


// 2026-06-04 15:20:00 - feat: add video interview scheduling


// 2026-06-13 09:15:00 - feat: implement chat between recruiters and candidates


// 2026-06-17 09:15:00 - feat(frontend): implement protected routes


// 2026-06-19 15:14:00 - refactor(frontend): extract reusable components


// Update: 2026-01-15 09:37:00 - feat(frontend): implement CompanyDashboard


// Update: 2026-02-20 10:59:00 - feat(frontend): implement JobCard component


// Update: 2026-02-24 13:15:00 - feat(backend): add password hashing with bcrypt

