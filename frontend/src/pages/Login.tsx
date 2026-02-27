import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginWithGoogle } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const initialRole = (() => {
    const queryRole = searchParams.get('role');
    if (queryRole === 'user' || queryRole === 'company') {
      return queryRole;
    }

    const savedRole = localStorage.getItem('googleLoginRole');
    if (savedRole === 'user' || savedRole === 'company') {
      return savedRole;
    }

    return '';
  })();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: initialRole as '' | 'user' | 'company',
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.role !== 'user' && formData.role !== 'company') {
      addToast('Please choose login type first', 'error');
      return;
    }

    setLoading(true);
    try {
      const authenticatedUser = await login(formData.email, formData.password, formData.role);
      addToast('Login successful!', 'success');
      if (authenticatedUser.role === 'admin') {
        navigate('/admin');
      } else if (authenticatedUser.role === 'company') {
        navigate('/dashboard');
      } else {
        navigate('/jobs');
      }
    } catch (error: any) {
      // Show user-friendly error messages
      const errorMessage = error.message || error.response?.data?.message || 'Login failed. Please try again.';
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (formData.role !== 'user' && formData.role !== 'company') {
      addToast('Please choose login type first', 'error');
      return;
    }

    setGoogleLoading(true);
    try {
      const authenticatedUser = await loginWithGoogle(formData.role);
      addToast('Google login successful!', 'success');
      if (authenticatedUser.role === 'admin') {
        navigate('/admin');
      } else if (authenticatedUser.role === 'company') {
        navigate('/dashboard');
      } else {
        navigate('/jobs');
      }
    } catch (error: any) {
      // Check if it's a redirect flow message
      if (error.message === 'Redirecting to Google Sign-In...') {
        addToast('Redirecting to Google Sign-In...', 'success');
        return;
      }
      
      // Handle specific error messages
      if (error.message.includes('popup-blocked')) {
        addToast('Popup was blocked. Please allow popups or try again.', 'error');
      } else if (error.message.includes('popup-closed')) {
        addToast('Google sign-in popup was closed. Please try again.', 'error');
      } else {
        addToast(error.message || 'Google login failed', 'error');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Demo credentials
  const fillDemoAdmin = () => {
    setFormData({ email: 'mayur@admin.com', password: 'Mayur@123', role: 'company' });
  };

  const fillDemoCompany = () => {
    setFormData({ email: 'hr@techinnovations.com', password: 'company123', role: 'company' });
  };

  const fillDemoUser = () => {
    setFormData({ email: 'john@example.com', password: 'user123', role: 'user' });
  };

  const selectRole = (role: 'user' | 'company') => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const resetRoleSelection = () => {
    setFormData((prev) => ({ ...prev, role: '' }));
  };

  const roleLabel = formData.role === 'company' ? 'Recruiter / HR' : 'Job Seeker';

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className='min-h-screen bg-gradient-to-b from-pink-50 via-white to-white px-4 py-12'>
        <div className='max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center'>
          <div className='hidden lg:block'>
            <div className='bg-white border border-pink-100 rounded-3xl p-10 shadow-sm'>
              <span className='inline-flex px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-sm font-semibold mb-4'>
                Secure Access
              </span>
              <h2 className='text-4xl font-bold text-gray-900 leading-tight mb-4'>
                Welcome back to HireSense.AI
              </h2>
              <p className='text-gray-600 text-lg mb-8'>
                Sign in to continue your hiring journey with AI-powered job matching and resume intelligence.
              </p>
              <div className='space-y-3'>
                <div className='rounded-xl border border-pink-100 bg-pink-50 px-4 py-3 text-gray-700'>AI-powered job discovery</div>
                <div className='rounded-xl border border-pink-100 bg-pink-50 px-4 py-3 text-gray-700'>Resume analysis insights</div>
                <div className='rounded-xl border border-pink-100 bg-pink-50 px-4 py-3 text-gray-700'>Interview preparation tools</div>
              </div>
            </div>
          </div>

          <div className='w-full max-w-md mx-auto'>
            <div className='bg-white border border-pink-100 rounded-2xl shadow-sm p-8'>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>Welcome Back</h1>
              <p className='text-gray-600 mb-6'>Login to your HireSense.AI account</p>

            {formData.role === '' ? (
              <div className='space-y-3 mb-6'>
                <p className='text-sm font-medium text-gray-700'>Choose login type</p>
                <button
                  type='button'
                  onClick={() => selectRole('company')}
                  className='w-full py-3 border border-pink-200 text-gray-800 font-semibold rounded-xl hover:bg-pink-50 transition'
                >
                  Login as Recruiter / HR
                </button>
                <button
                  type='button'
                  onClick={() => selectRole('user')}
                  className='w-full py-3 border border-pink-200 text-gray-800 font-semibold rounded-xl hover:bg-pink-50 transition'
                >
                  Login as Job Seeker
                </button>
              </div>
            ) : (
              <>
                <div className='mb-4 p-3 rounded-xl border border-pink-100 bg-pink-50 flex items-center justify-between gap-3'>
                  <p className='text-sm font-medium text-gray-700'>Logging in as: <span className='text-pink-700'>{roleLabel}</span></p>
                  <button
                    type='button'
                    onClick={resetRoleSelection}
                    className='text-sm font-semibold text-pink-600 hover:underline'
                  >
                    Change
                  </button>
                </div>

            {/* Google Login Button */}
            <button
              type='button'
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className='w-full py-3 bg-white border border-pink-200 text-gray-700 font-semibold rounded-xl hover:bg-pink-50 transition mb-6 flex items-center justify-center gap-2 disabled:opacity-50'
            >
              <svg className='w-5 h-5' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' fill='#4285F4' />
                <path d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' fill='#34A853' />
                <path d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' fill='#FBBC05' />
                <path d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' fill='#EA4335' />
              </svg>
              {googleLoading ? 'Signing in...' : 'Sign in with Google'}
            </button>

            <div className='relative mb-6'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-pink-100' />
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-2 bg-white text-gray-500'>Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className='space-y-4 mb-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Email</label>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  placeholder='your@email.com'
                  className='w-full px-4 py-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Password</label>
                <input
                  type='password'
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  placeholder='Your password'
                  className='w-full px-4 py-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500'
                  required
                />
              </div>

              <button
                type='submit'
                disabled={loading}
                className='w-full py-3 bg-pink-600 text-white font-semibold rounded-xl hover:bg-pink-700 transition disabled:opacity-50'
              >
                {loading ? 'Logging in...' : `Login as ${roleLabel}`}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className='bg-pink-50 border border-pink-100 rounded-xl p-4 mb-6'>
              <p className='text-sm font-semibold text-gray-700 mb-2'>Demo Credentials:</p>
              <div className='space-y-2 text-xs'>
                <button
                  type='button'
                  onClick={fillDemoAdmin}
                  className='w-full text-left px-2 py-1 hover:bg-pink-100 rounded transition'
                >
                  Admin: mayur@admin.com / Mayur@123
                </button>
                <button
                  type='button'
                  onClick={fillDemoCompany}
                  className='w-full text-left px-2 py-1 hover:bg-pink-100 rounded transition'
                >
                  Company: hr@techinnovations.com / company123
                </button>
                <button
                  type='button'
                  onClick={fillDemoUser}
                  className='w-full text-left px-2 py-1 hover:bg-pink-100 rounded transition'
                >
                  User: john@example.com / user123
                </button>
              </div>
            </div>

            <p className='text-center text-gray-600'>
              Don't have an account?{' '}
              <a href='/register' className='text-pink-600 font-semibold hover:underline'>
                Sign up
              </a>
            </p>
              </>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
};
