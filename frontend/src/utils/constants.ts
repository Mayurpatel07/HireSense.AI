/**
 * Frontend constants and configuration
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 10000,
};

// User Roles
export const USER_ROLES = {
  USER: 'user',
  COMPANY: 'company',
  ADMIN: 'admin',
};

// Job Types
export const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];

// Experience Levels
export const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid-level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
];

// Workplace Types
export const WORKPLACE_TYPES = [
  { value: 'remote', label: 'Remote' },
  { value: 'on-site', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
];

// Application Status
export const APPLICATION_STATUSES = [
  { value: 'applied', label: 'Applied', color: 'blue' },
  { value: 'reviewing', label: 'Reviewing', color: 'yellow' },
  { value: 'shortlisted', label: 'Shortlisted', color: 'purple' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'offer', label: 'Offer', color: 'green' },
  { value: 'hired', label: 'Hired', color: 'green' },
];

// Common Skills
export const COMMON_SKILLS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Vue.js',
  'Angular',
  'Node.js',
  'Python',
  'Java',
  'C++',
  'C#',
  'Go',
  'Rust',
  'PHP',
  'Ruby',
  'SQL',
  'MongoDB',
  'PostgreSQL',
  'MySQL',
  'AWS',
  'Google Cloud',
  'Azure',
  'Docker',
  'Kubernetes',
  'Git',
  'GraphQL',
  'REST API',
  'HTML5',
  'CSS3',
  'TailwindCSS',
  'Bootstrap',
  'Machine Learning',
  'Data Science',
  'Agile',
  'Scrum',
  'DevOps',
  'Linux',
];

// Toast Duration (in ms)
export const TOAST_DURATION = {
  SHORT: 2000,
  NORMAL: 3000,
  LONG: 5000,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
};

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_FILENAME_LENGTH: 255,
  MAX_BIO_LENGTH: 500,
};

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  PREFERENCES: 'preferences',
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  JOBS: '/jobs',
  JOB_DETAILS: '/jobs/:id',
  PROFILE: '/profile',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
};

// Formats
export const DATE_FORMAT = 'MMM DD, YYYY';
export const TIME_FORMAT = 'hh:mm A';
export const DATETIME_FORMAT = 'MMM DD, YYYY hh:mm A';

// Message Templates
export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Login successful!',
    REGISTER: 'Account created successfully!',
    UPDATE: 'Updated successfully!',
    DELETE: 'Deleted successfully!',
    UPLOAD: 'Uploaded successfully!',
    APPLY: 'Application submitted!',
  },
  ERROR: {
    LOGIN_FAILED: 'Login failed. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    NOT_FOUND: 'Resource not found.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    SERVER: 'Server error. Please try again later.',
  },
};

// Feature Flags
export const FEATURES = {
  AI_ANALYSIS: true,
  EMAIL_NOTIFICATIONS: false,
  VIDEO_INTERVIEW: false,
  REAL_TIME_CHAT: false,
  DARK_MODE: false,
};
