import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dashboardPath = user?.role === 'admin' ? '/admin' : user?.role === 'company' ? '/dashboard' : null;

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className='sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-pink-100'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <Link to='/' className='font-bold text-xl text-pink-600 tracking-tight'>
            HireSense.AI
          </Link>

          {/* Right Side */}
          <div className='flex items-center gap-3'>
            <div className='hidden md:flex items-center gap-6'>
              <Link to='/jobs' className='text-sm font-medium text-gray-700 hover:text-pink-600 transition'>
                Find Job
              </Link>
              <a href='/#ai-features' className='text-sm font-medium text-gray-700 hover:text-pink-600 transition'>
                AI Features
              </a>
            </div>

            {user ? (
              <div className='hidden md:flex items-center gap-4'>
                {dashboardPath && (
                  <Link
                    to={dashboardPath}
                    className='px-4 py-2 text-sm font-medium text-pink-600 hover:bg-pink-50 rounded-lg transition'
                  >
                    Go to Dashboard
                  </Link>
                )}
                <Link
                  to='/profile'
                  className='px-4 py-2 text-sm font-medium text-gray-700 hover:text-pink-600'
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className='px-4 py-2 text-sm font-medium bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition'
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className='hidden md:flex items-center gap-2'>
                <Link
                  to='/login'
                  className='px-4 py-2 text-sm font-medium text-pink-600 hover:bg-pink-50 rounded-lg transition'
                >
                  Login
                </Link>
                <Link
                  to='/register'
                  className='px-4 py-2 text-sm font-medium bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition'
                >
                  Create Account
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className='md:hidden p-2 text-gray-600'
              aria-label='Toggle navigation menu'
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className='md:hidden border-t border-pink-100 py-3 space-y-2'>
            <Link
              to='/jobs'
              onClick={() => setIsMenuOpen(false)}
              className='block px-2 py-2 text-sm font-medium text-gray-700 hover:bg-pink-50 rounded-lg'
            >
              Find Job
            </Link>
            <a
              href='/#ai-features'
              onClick={() => setIsMenuOpen(false)}
              className='block px-2 py-2 text-sm font-medium text-gray-700 hover:bg-pink-50 rounded-lg'
            >
              AI Features
            </a>

            {user ? (
              <>
                {dashboardPath && (
                  <Link
                    to={dashboardPath}
                    onClick={() => setIsMenuOpen(false)}
                    className='block px-2 py-2 text-sm font-medium text-pink-600 hover:bg-pink-50 rounded-lg'
                  >
                    Go to Dashboard
                  </Link>
                )}
                <Link
                  to='/profile'
                  onClick={() => setIsMenuOpen(false)}
                  className='block px-2 py-2 text-sm font-medium text-gray-700 hover:bg-pink-50 rounded-lg'
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className='w-full text-left px-2 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition'
                >
                  Logout
                </button>
              </>
            ) : (
              <div className='grid grid-cols-2 gap-2 pt-1'>
                <Link
                  to='/login'
                  onClick={() => setIsMenuOpen(false)}
                  className='text-center px-3 py-2 text-sm font-medium text-pink-600 hover:bg-pink-50 rounded-lg transition'
                >
                  Login
                </Link>
                <Link
                  to='/register'
                  onClick={() => setIsMenuOpen(false)}
                  className='text-center px-3 py-2 text-sm font-medium bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition'
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
