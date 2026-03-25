import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to='/jobs' replace />;
    }
  }

  return <>{children}</>;
};

// Update: 2026-01-05 14:21:00 - feat(frontend): implement useAuth hook


// Update: 2026-01-20 11:53:00 - fix(backend): correct JWT expiration handling


// Update: 2026-01-21 10:19:00 - feat(frontend): add Framer Motion animations


// Update: 2026-02-05 16:52:00 - feat(frontend): create AdminDashboard


// Update: 2026-02-06 11:23:00 - docs: add contribution guidelines


// Update: 2026-03-10 10:01:00 - fix(backend): handle large resume files


// Update: 2026-03-25 16:47:00 - feat(backend): implement admin user management

