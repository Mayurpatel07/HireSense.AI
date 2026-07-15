import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export const Landing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [heroCardTilt, setHeroCardTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleHeroCardMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const rotateY = ((x / rect.width) - 0.5) * 10;
    const rotateX = (0.5 - (y / rect.height)) * 10;

    setHeroCardTilt({ rotateX, rotateY });
  };

  const handleHeroCardMouseLeave = () => {
    setHeroCardTilt({ rotateX: 0, rotateY: 0 });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className='min-h-screen bg-pink-50'>
      {/* Hero Section - Full Screen */}
      <motion.section
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        className='relative min-h-screen lg:h-screen w-full bg-gradient-to-b from-pink-50 via-white to-pink-50 flex flex-col justify-start pt-24 md:pt-28 lg:pt-32 pb-12'
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full'>
          <div className='grid lg:grid-cols-2 gap-8 md:gap-10 items-center'>
            <div>
              <motion.span
                variants={itemVariants}
                className='inline-flex items-center rounded-full bg-pink-100 text-pink-700 text-sm font-semibold px-4 py-1.5 mb-6'
              >
                Classic modern hiring experience
              </motion.span>

              <motion.h1 variants={itemVariants} className='text-4xl md:text-6xl font-bold text-gray-900 leading-tight'>
                Find the right job faster with <span className='text-pink-600'>HireSense.AI</span>
              </motion.h1>

              <motion.p variants={itemVariants} className='mt-6 text-lg text-gray-600 max-w-xl'>
                Discover better opportunities using AI-powered matching, resume insights, and smart job search built for modern careers.
              </motion.p>

              <motion.div variants={itemVariants} className='mt-8 flex flex-col sm:flex-row gap-4'>
                {user ? (
                  <>
                    <Link to='/jobs' className='px-7 py-3 bg-pink-600 text-white font-semibold rounded-xl hover:bg-pink-700 transition text-center'>
                      Find Job
                    </Link>
                    {user.role === 'company' && (
                      <Link to='/dashboard' className='px-7 py-3 border border-pink-300 text-pink-700 font-semibold rounded-xl hover:bg-pink-50 transition text-center'>
                        Open Dashboard
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link to='/register?role=user' className='px-7 py-3 bg-pink-600 text-white font-semibold rounded-xl hover:bg-pink-700 transition text-center'>
                      Create Account
                    </Link>
                    <Link to='/jobs' className='px-7 py-3 border border-pink-300 text-pink-700 font-semibold rounded-xl hover:bg-pink-50 transition text-center'>
                      Find Job
                    </Link>
                  </>
                )}
              </motion.div>
            </div>

            <motion.div
              variants={itemVariants}
              onMouseMove={handleHeroCardMouseMove}
              onMouseLeave={handleHeroCardMouseLeave}
              className='bg-white border border-pink-100 rounded-3xl p-6 md:p-8 shadow-sm transition-transform duration-200 hover:shadow-xl'
              style={{ transform: `perspective(1200px) rotateX(${heroCardTilt.rotateX}deg) rotateY(${heroCardTilt.rotateY}deg)` }}
            >
              <h2 className='text-2xl font-bold text-gray-900 mb-6'>Why job seekers choose us</h2>
              <div className='space-y-5'>
                <div className='p-4 rounded-xl bg-pink-50 border border-pink-100'>
                  <h3 className='font-semibold text-gray-900'>AI Job Matching</h3>
                  <p className='text-sm text-gray-600 mt-1'>Get role recommendations based on your profile and skills.</p>
                </div>
                <div className='p-4 rounded-xl bg-pink-50 border border-pink-100'>
                  <h3 className='font-semibold text-gray-900'>Resume Analyzer</h3>
                  <p className='text-sm text-gray-600 mt-1'>Improve your resume score with practical and actionable guidance.</p>
                </div>
                <div className='p-4 rounded-xl bg-pink-50 border border-pink-100'>
                  <h3 className='font-semibold text-gray-900'>Interview Preparation</h3>
                  <p className='text-sm text-gray-600 mt-1'>Generate relevant interview questions based on your target role.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Down Icon */}
        <div className='hidden md:flex absolute bottom-14 lg:bottom-20 left-1/2 transform -translate-x-1/2 flex-col items-center gap-1'>
          <span className='text-sm font-medium text-pink-600'>Scroll down</span>
          <motion.svg
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className='w-6 h-6 text-pink-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 14l-7 7m0 0l-7-7m7 7V3' />
          </motion.svg>
        </div>

        <div className='absolute bottom-0 left-0 w-full h-12 md:h-20 bg-gradient-to-b from-transparent to-pink-50 pointer-events-none' />
      </motion.section>

      {/* Combined AI Features + CTA Section */}
      <section id='ai-features' className='relative w-full bg-gradient-to-b from-pink-50 via-pink-50/60 to-white pt-14 md:pt-20 pb-12 overflow-hidden'>
        <div className='absolute -top-20 -left-20 w-72 h-72 bg-pink-100 rounded-full blur-3xl opacity-40' />
        <div className='absolute -bottom-20 -right-20 w-80 h-80 bg-pink-100 rounded-full blur-3xl opacity-40' />
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-10 md:mb-14 relative z-10'>
            <motion.span
              variants={itemVariants}
              initial='hidden'
              whileInView='visible'
              className='inline-flex items-center rounded-full bg-pink-50 border border-pink-200 text-pink-700 text-sm font-semibold px-4 py-1.5 mb-5'
            >
              Powered by advanced AI
            </motion.span>
            <motion.h2 
              variants={itemVariants}
              initial='hidden'
              whileInView='visible'
              className='text-3xl md:text-5xl font-bold text-gray-900'
            >
              Our AI Features
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              initial='hidden'
              whileInView='visible'
              className='text-gray-600 mt-3 text-base md:text-lg max-w-2xl mx-auto'
            >
              Advanced tools to accelerate your career journey
            </motion.p>
          </div>

          <motion.div 
            variants={containerVariants} 
            initial='hidden' 
            whileInView='visible'
            className='relative z-10 grid lg:grid-cols-12 gap-4 md:gap-6 mb-12 md:mb-16'
          >
            <motion.div
              variants={itemVariants}
              onClick={() => navigate('/resume-analyzer')}
              className='lg:col-span-7 rounded-3xl border border-pink-200/80 bg-white/90 backdrop-blur-sm p-6 md:p-8 cursor-pointer transition hover:shadow-xl hover:-translate-y-1'
            >
              <div className='inline-flex items-center rounded-full bg-pink-100 text-pink-700 text-xs font-semibold px-3 py-1 mb-5'>
                Most Loved Feature
              </div>
              <h3 className='text-2xl md:text-3xl font-bold text-gray-900 mb-3'>AI Resume Analyzer</h3>
              <p className='text-gray-600 text-sm md:text-base leading-relaxed max-w-2xl'>
                Get deep insights into your resume quality, identify missing keywords, and receive practical suggestions to boost your shortlisting chances.
              </p>
              <div className='mt-6 inline-flex items-center text-pink-700 font-semibold text-sm md:text-base'>
                Try Resume Analyzer
                <span className='ml-2 text-lg'>→</span>
              </div>
            </motion.div>

            <div className='lg:col-span-5 grid sm:grid-cols-2 lg:grid-cols-1 gap-6'>
              {[
                {
                  title: 'AI-Powered Matching',
                  description: 'Our AI compares your profile with live jobs and ranks the strongest opportunities for your skills.',
                  link: '/jobs?ai=1',
                },
                {
                  title: 'AI Interview Preparation',
                  description: 'Generate role-focused practice questions so you can prepare with confidence before interviews.',
                  onClick: () => window.dispatchEvent(new CustomEvent('open-ai-interview-prep')),
                },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  onClick={() => {
                    if (feature.onClick) {
                      feature.onClick();
                      return;
                    }
                    navigate(feature.link);
                  }}
                  className='rounded-2xl p-5 md:p-6 border border-pink-100 bg-white/90 backdrop-blur-sm cursor-pointer transition hover:border-pink-300 hover:shadow-lg hover:-translate-y-1'
                >
                  <h3 className='text-lg md:text-xl font-bold text-gray-900 mb-2'>{feature.title}</h3>
                  <p className='text-gray-600 text-sm leading-relaxed'>{feature.description}</p>
                  <div className='mt-5 text-sm font-semibold text-pink-700'>Explore feature →</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            variants={itemVariants}
            initial='hidden'
            whileInView='visible'
            className='bg-gradient-to-r from-pink-600 to-pink-700 rounded-2xl py-10 px-6 text-center mt-12'
          >
            <h2 className='text-2xl md:text-3xl font-bold text-white mb-3'>Ready to get started?</h2>
            <p className='text-pink-100 mb-6 text-base max-w-xl mx-auto'>
              Join thousands of professionals using HireSense.AI
            </p>
            {!user && (
              <Link
                to='/register'
                className='px-8 py-3 bg-white text-pink-700 font-semibold rounded-lg hover:bg-pink-50 transition inline-block'
              >
                Create Account Now
              </Link>
            )}
            {user && (
              <Link
                to='/jobs'
                className='px-8 py-3 bg-white text-pink-700 font-semibold rounded-lg hover:bg-pink-50 transition inline-block'
              >
                Explore Jobs
              </Link>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};
