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
