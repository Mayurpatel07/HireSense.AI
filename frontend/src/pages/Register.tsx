import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { registerUser } from '../services/authService';
import { ToastContainer } from '../components/Toast';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: (searchParams.get('role') as 'user' | 'company') || 'user',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    if (formData.password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.role);
      addToast(`Welcome, ${formData.name}!`, 'success');
      navigate(formData.role === 'company' ? '/dashboard' : '/jobs');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className='min-h-screen bg-gradient-to-b from-pink-50 via-white to-white px-4 py-12'>
        <div className='max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center'>
          <div className='hidden lg:block'>
            <div className='bg-white border border-pink-100 rounded-3xl p-10 shadow-sm'>
              <span className='inline-flex px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-sm font-semibold mb-4'>
                New Account
              </span>
              <h2 className='text-4xl font-bold text-gray-900 leading-tight mb-4'>
                Start your journey with HireSense.AI
              </h2>
              <p className='text-gray-600 text-lg mb-8'>
                Create your profile to unlock AI-powered job matching, resume insights, and better career opportunities.
              </p>
              <div className='space-y-3'>
                <div className='rounded-xl border border-pink-100 bg-pink-50 px-4 py-3 text-gray-700'>Personalized job recommendations</div>
                <div className='rounded-xl border border-pink-100 bg-pink-50 px-4 py-3 text-gray-700'>Faster resume improvement feedback</div>
                <div className='rounded-xl border border-pink-100 bg-pink-50 px-4 py-3 text-gray-700'>Role-focused interview preparation</div>
              </div>
            </div>
          </div>

          <div className='w-full max-w-md mx-auto'>
            <div className='bg-white border border-pink-100 rounded-2xl shadow-sm p-8'>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>Create Account</h1>
              <p className='text-gray-600 mb-6'>Join HireSense.AI today</p>

              <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Name</label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
                  placeholder='Full name'
                  className='w-full px-4 py-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500'
                  required
                />
              </div>

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
                <label className='block text-sm font-medium text-gray-700 mb-2'>Account Type</label>
                <select
                  name='role'
                  value={formData.role}
                  onChange={handleChange}
                  className='w-full px-4 py-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500'
                >
                  <option value='user'>Job Seeker</option>
                  <option value='company'>HR / Company</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Password</label>
                <input
                  type='password'
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  placeholder='At least 6 characters'
                  className='w-full px-4 py-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Confirm Password</label>
                <input
                  type='password'
                  name='confirmPassword'
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder='Confirm your password'
                  className='w-full px-4 py-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500'
                  required
                />
              </div>

              <button
                type='submit'
                disabled={loading}
                className='w-full py-3 bg-pink-600 text-white font-semibold rounded-xl hover:bg-pink-700 transition disabled:opacity-50'
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className='text-center text-gray-600 mt-6'>
              Already have an account?{' '}
              <a href='/login' className='text-pink-600 font-semibold hover:underline'>
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};
