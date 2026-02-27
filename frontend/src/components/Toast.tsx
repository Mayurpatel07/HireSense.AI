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
