import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ChatbotWidget } from './components/ChatbotWidget';

// Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { JobListings } from './pages/JobListings';
import { JobDetails } from './pages/JobDetails';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';
import { CompanyDashboard } from './pages/CompanyDashboard';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import { ProtectedRoute } from './components/ProtectedRoute';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path='/' element={<Landing />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/jobs' element={<JobListings />} />
          <Route path='/jobs/:id' element={<JobDetails />} />
          <Route path='/resume-analyzer' element={<ResumeAnalyzer />} />

          {/* Protected Routes */}
          <Route
            path='/profile'
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path='/dashboard'
            element={
              <ProtectedRoute requiredRole={['company', 'admin']}>
                <CompanyDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path='/admin'
            element={
              <ProtectedRoute requiredRole='admin'>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path='*' element={<div className='min-h-screen flex items-center justify-center'><p>Page not found</p></div>} />
        </Routes>
        <Footer />
        <ChatbotWidget />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

// 2026-03-26 10:45:00 - feat(frontend): create interview prep module


// 2026-04-21 13:00:00 - perf(frontend): lazy load routes


// 2026-05-10 10:45:00 - feat(frontend): implement job alerts


// 2026-05-12 15:47:00 - feat: add salary prediction based on skills


// 2026-06-05 09:15:00 - feat(frontend): implement Firebase authentication


// 2026-06-06 13:30:00 - feat(frontend): create responsive layout


// Update: 2026-01-16 10:35:00 - chore: configure TypeScript settings


// Update: 2026-02-04 15:18:00 - feat(backend): create Application model


// Update: 2026-02-05 14:30:00 - feat(backend): add Job model with validation

