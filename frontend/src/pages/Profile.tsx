import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/authService';
import { uploadResume } from '../services/resumeService';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
  const { user, updateProfile: updateAuthProfile } = useAuth();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: user?.location || '',
    skills: (user?.skills || []).join(', '),
    experience: user?.experience || 0,
  });

  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [currentResumeUrl, setCurrentResumeUrl] = useState<string>(user?.resumeUrl || '');
  const [currentResumeName, setCurrentResumeName] = useState<string>(user?.resume || '');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    setCurrentResumeUrl(user?.resumeUrl || '');
    setCurrentResumeName(user?.resume || '');
  }, [user?.resumeUrl, user?.resume]);

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      location: user?.location || '',
      skills: (user?.skills || []).join(', '),
      experience: user?.experience || 0,
    });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedData = {
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
        location: formData.location,
        skills: formData.skills.split(',').map((s) => s.trim()),
        experience: Number(formData.experience),
      };

      await updateAuthProfile(updatedData);
      addToast('Profile updated successfully!', 'success');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resumeFile) {
      addToast('Please select a resume file', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await uploadResume(resumeFile);
      setCurrentResumeUrl(response?.resumeUrl || '');
      setCurrentResumeName(response?.user?.resume || resumeFile.name);
      addToast('Resume uploaded successfully!', 'success');
      setResumeFile(null);
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to upload resume', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className='min-h-screen bg-gradient-to-b from-pink-50 via-white to-white py-12'>
        <div className='max-w-2xl mx-auto px-4'>
          <div className='bg-white rounded-2xl border border-pink-100 shadow-sm p-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-8'>
              {user?.role === 'company' ? 'Company Profile' : user?.role === 'admin' ? 'Admin Profile' : 'My Profile'}
            </h1>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className='space-y-6 mb-12'>
              <div className='grid md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    {user?.role === 'company' ? 'Company Name' : 'Full Name'}
                  </label>
                  <input
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={user?.role === 'company' ? 'e.g., Tech Corp Inc.' : 'Your full name'}
                    className='w-full px-4 py-3 border border-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    {user?.role === 'company' ? 'Contact Phone' : 'Phone'}
                  </label>
                  <input
                    type='tel'
                    name='phone'
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={user?.role === 'company' ? 'Company contact number' : 'Your phone number'}
                    className='w-full px-4 py-3 border border-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300'
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  {user?.role === 'company' ? 'Company Location / Headquarters' : 'Location'}
                </label>
                <input
                  type='text'
                  name='location'
                  value={formData.location}
                  onChange={handleChange}
                  placeholder={user?.role === 'company' ? 'e.g., San Francisco, CA or Remote' : 'e.g., New York, NY'}
                  className='w-full px-4 py-3 border border-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  {user?.role === 'company' ? 'Company Description' : 'Bio'}
                </label>
                <textarea
                  name='bio'
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder={
                    user?.role === 'company'
                      ? 'Describe your company, culture, and what makes you unique...'
                      : 'Tell us about yourself...'
                  }
                  rows={4}
                  className='w-full px-4 py-3 border border-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  {user?.role === 'company' ? 'Industry / Specializations (comma separated)' : 'Skills (comma separated)'}
                </label>
                <input
                  type='text'
                  name='skills'
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder={
                    user?.role === 'company'
                      ? 'e.g., Technology, Healthcare, AI/ML, SaaS'
                      : 'e.g., React, TypeScript, Node.js'
                  }
                  className='w-full px-4 py-3 border border-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  {user?.role === 'company' ? 'Years in Business' : 'Years of Experience'}
                </label>
                <select
                  name='experience'
                  value={formData.experience}
                  onChange={handleChange}
                  className='w-full px-4 py-3 border border-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300'
                >
                  {Array.from({ length: 40 }, (_, i) => i).map((i) => (
                    <option key={i} value={i}>
                      {i} years
                    </option>
                  ))}
                </select>
              </div>

              <button
                type='submit'
                disabled={loading}
                className='w-full py-3 bg-pink-500 text-white font-bold rounded-lg hover:bg-pink-600 transition disabled:opacity-50'
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>

            {/* Resume Upload */}
            {user?.role === 'user' && (
              <div className='border-t border-gray-200 pt-8'>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>Resume</h2>
                <p className='text-gray-600 mb-4'>
                  Upload your resume (PDF or DOCX) for AI-powered analysis and better job matching.
                </p>

                <form onSubmit={handleResumeUpload} className='space-y-4'>
                  <div className='border-2 border-dashed border-pink-100 rounded-lg p-6 text-center bg-pink-50'>
                    <input
                      type='file'
                      id='resume'
                      accept='.pdf,.docx,.doc'
                      onChange={handleResumeChange}
                      className='hidden'
                    />
                    <label htmlFor='resume' className='cursor-pointer'>
                      <div className='text-4xl mb-2'>□</div>
                      <p className='font-semibold text-gray-900 mb-1'>
                        {resumeFile
                          ? resumeFile.name
                          : currentResumeUrl
                            ? 'Choose file to re-upload resume'
                            : 'Choose resume file'}
                      </p>
                      <p className='text-sm text-gray-500'>PDF or DOCX (Max 5MB)</p>
                    </label>
                  </div>

                  {currentResumeUrl && (
                    <div className='rounded-lg border border-pink-100 bg-pink-50 p-4'>
                      <p className='text-sm text-pink-700 font-medium'>✓ Resume uploaded successfully</p>
                      <a
                        href={currentResumeUrl.startsWith('http') ? currentResumeUrl : `${window.location.protocol}//${window.location.hostname}:5000${currentResumeUrl}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-sm text-pink-700 underline break-all'
                      >
                        {currentResumeName || 'View uploaded resume'}
                      </a>
                    </div>
                  )}

                  {resumeFile && (
                    <button
                      type='submit'
                      disabled={loading}
                      className='w-full py-3 bg-pink-500 text-white font-bold rounded-lg hover:bg-pink-600 transition disabled:opacity-50'
                    >
                      {loading ? 'Uploading...' : currentResumeUrl ? 'Re-upload Resume' : 'Upload Resume'}
                    </button>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// 2026-03-17 13:30:00 - feat(frontend): add JWT token management


// 2026-04-06 10:45:00 - feat(frontend): implement protected routes


// 2026-04-18 15:20:00 - docs: add troubleshooting guide


// 2026-04-19 10:22:00 - docs: add contribution guidelines


// 2026-04-22 09:15:00 - feat(frontend): add Card component for job listings


// 2026-04-25 09:15:00 - feat(frontend): create company dashboard


// 2026-05-02 13:30:00 - feat(frontend): add job application form


// 2026-05-06 11:20:00 - test(frontend): add component tests


// 2026-05-16 13:30:00 - feat: create interview feedback system


// 2026-05-20 10:45:00 - fix(frontend): resolve routing issues


// 2026-05-23 15:20:00 - feat(frontend): add Form components with validation


// 2026-05-30 15:20:00 - chore: add commitlint configuration


// 2026-06-03 13:30:00 - feat: add candidate shortlisting


// Update: 2026-01-05 13:47:00 - feat(backend): integrate Gemini AI analysis


// Update: 2026-01-08 09:04:00 - refactor: improve code organization


// Update: 2026-02-02 16:54:00 - feat(backend): add AI-powered job matching


// Update: 2026-02-04 09:48:00 - test: add API integration tests


// Update: 2026-02-16 09:19:00 - feat(backend): implement login with email/password


// Update: 2026-02-17 09:13:00 - refactor: extract reusable components


// Update: 2026-02-17 11:20:00 - feat(backend): implement token refresh logic


// Update: 2026-02-20 18:41:00 - feat(frontend): add JobDetails page


// Update: 2026-02-25 11:15:00 - feat(backend): add Company model


// Update: 2026-03-02 09:55:00 - feat(frontend): implement auth service

