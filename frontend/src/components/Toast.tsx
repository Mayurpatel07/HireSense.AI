import React from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../hooks/useToast';

interface ToastNotificationProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onRemove: (id: string) => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ id, message, type, onRemove }) => {
  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-pink-50 border-pink-200',
    warning: 'bg-yellow-50 border-yellow-200',
  }[type];

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-pink-800',
    warning: 'text-yellow-800',
  }[type];

  const iconColor = {
    success: 'text-green-500',
    error: 'text-red-500',
    info: 'text-pink-500',
    warning: 'text-yellow-500',
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${bgColor} border rounded-lg p-4 mb-2 flex items-start gap-3`}
    >
      <span className={`${iconColor} text-lg mt-0.5`}>
        {type === 'success' && '✓'}
        {type === 'error' && '✕'}
        {type === 'info' && 'ℹ'}
        {type === 'warning' && '⚠'}
      </span>
      <div className='flex-1'>
        <p className={`${textColor} font-medium`}>{message}</p>
      </div>
      <button
        onClick={() => onRemove(id)}
        className={`${textColor} hover:opacity-75 transition`}
      >
        ✕
      </button>
    </motion.div>
  );
};

export const ToastContainer: React.FC<{ toasts: any[]; removeToast: (id: string) => void }> = ({
  toasts,
  removeToast,
}) => {
  return (
    <div className='fixed top-20 right-4 max-w-md z-50'>
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onRemove={removeToast}
        />
      ))}
    </div>
  );
};

// 2026-03-23 12:19:00 - fix(frontend): resolve routing issues


// 2026-03-27 10:45:00 - feat(frontend): implement SearchBar component


// 2026-03-27 15:20:00 - feat(frontend): add Framer Motion animations


// 2026-03-28 11:37:00 - feat(frontend): implement dark mode support


// 2026-03-31 09:15:00 - feat(frontend): implement resume upload component


// 2026-04-10 16:45:00 - feat(frontend): create useAuth custom hook


// 2026-04-12 13:30:00 - feat(frontend): create auth context provider


// 2026-04-22 15:20:00 - feat(frontend): create auth context provider


// 2026-05-14 10:45:00 - feat(frontend): create interview prep module


// 2026-06-11 12:56:00 - feat(frontend): create useAuth custom hook


// 2026-06-12 10:45:00 - perf(frontend): implement code splitting


// 2026-06-16 13:30:00 - feat(frontend): implement resume upload component


// Update: 2026-01-03 10:57:00 - fix(backend): correct job search pagination


// Update: 2026-01-09 11:21:00 - feat(frontend): implement dark mode toggle


// Update: 2026-01-17 17:44:00 - feat(backend): implement job status updates


// Update: 2026-01-29 16:02:00 - docs: add contribution guidelines


// Update: 2026-01-29 17:53:00 - feat(frontend): add protected routes


// Update: 2026-02-05 09:48:00 - feat(backend): add resume scoring algorithm


// Update: 2026-02-22 10:30:00 - feat(backend): add job moderation endpoints

