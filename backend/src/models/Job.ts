import { Schema, model, Document, Types } from 'mongoose';

export interface IJob extends Document {
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
  companyId: Types.ObjectId;
  applicationDeadline: Date;
  applicants: Types.ObjectId[];
  status: 'published' | 'draft' | 'closed' | 'rejected';
  approvedBy?: Types.ObjectId;
  rejectionReason?: string;
  views: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: [String],
    skills: [String],
    salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'INR' },
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      default: 'full-time',
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead'],
      default: 'mid',
    },
    location: { type: String, required: true },
    workplaceType: {
      type: String,
      enum: ['remote', 'on-site', 'hybrid'],
      default: 'hybrid',
    },
    company: { type: String, required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    applicationDeadline: { type: Date, required: true },
    applicants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: {
      type: String,
      enum: ['published', 'draft', 'closed', 'rejected'],
      default: 'draft',
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: String,
    views: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model<IJob>('Job', jobSchema);

// 2026-03-15 12:30:00 - feat(backend): implement Express server with TypeScript


// 2026-03-17 15:55:00 - feat(backend): add job routes with middleware


// 2026-03-19 10:45:00 - feat(backend): add job status update functionality


// 2026-03-24 09:15:00 - fix(backend): correct JWT token expiration handling


// 2026-04-24 14:29:00 - fix(backend): handle large resume files


// 2026-04-24 15:20:00 - feat(backend): create AI service for resume analysis


// 2026-04-30 10:45:00 - chore: setup Vite configuration


// 2026-04-30 13:30:00 - feat(backend): implement resume routes


// 2026-05-04 10:45:00 - fix(backend): handle large resume files


// 2026-05-10 13:19:00 - feat(backend): implement JWT authentication middleware


// 2026-05-14 15:16:00 - feat(backend): add notification service


// 2026-05-24 09:15:00 - feat(backend): add company/HR routes


// 2026-06-10 15:20:00 - feat(backend): add MongoDB connection with Mongoose


// 2026-06-13 11:31:00 - refactor(backend): improve error handling

