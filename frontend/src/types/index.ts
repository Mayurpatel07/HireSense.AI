// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'company' | 'admin';
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  experience?: number;
  resume?: string;
  resumeUrl?: string;
  isVerified: boolean;
}

// Job Types
export interface Job {
  _id: string;
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
  location: string;
  workplaceType: 'remote' | 'on-site' | 'hybrid';
  company: string;
  companyId: string;
  applicationDeadline: string;
  applicants: string[];
  status: 'published' | 'draft' | 'closed' | 'rejected';
  views: number;
  featured: boolean;
  createdAt: string;
  aiMatch?: {
    score: number;
    verdict: 'strong' | 'moderate' | 'low';
    missingSkills: string[];
  };
}

// Application Types
export interface Application {
  _id: string;
  jobId: string;
  userId: string;
  company: string;
  resume: string;
  coverLetter?: string;
  status: 'applied' | 'reviewing' | 'shortlisted' | 'rejected' | 'offer' | 'hired';
  matchScore?: number;
  resumeAnalysis?: {
    strengths: string[];
    weaknesses: string[];
    missingSkills: string[];
  };
  hirePrediction?: {
    hireProbability: number;
    verdict: 'likely' | 'uncertain' | 'unlikely';
    missingSkills: string[];
    strengths: string[];
    improvementAreas: string[];
    summary: string;
    predictedAt?: string;
  };
  appliedAt: string;
}

// Resume Analysis Types
export interface ResumeAnalysis {
  fitScore: number;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  summary: string;
}

// Interview Types
export interface InterviewQuestion {
  id: number;
  question: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface InterviewQuestionsResult {
  questions: InterviewQuestion[];
  jobTitle: string;
  keySkills: string[];
  generatedAt: string;
}

// Auth Types
export interface AuthResponse {
  token: string;
  user: User;
}

// API Response Types
export interface ApiResponse<T> {
  message: string;  data?: T;
}