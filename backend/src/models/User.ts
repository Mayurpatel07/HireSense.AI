import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'company' | 'admin';
  phone?: string;
  avatar?: string;
  resume?: string;
  resumeUrl?: string;
  resumeAnalysis?: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    extractedText: string;
    analyzedAt: Date;
  };
  bio?: string;
  location?: string;
  skills?: string[];
  experience?: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: false },
    role: {
      type: String,
      enum: ['user', 'company', 'admin'],
      default: 'user',
    },
    phone: String,
    avatar: String,
    resume: String,
    resumeUrl: String,
    resumeAnalysis: {
      score: Number,
      strengths: [String],
      weaknesses: [String],
      extractedText: String,
      analyzedAt: Date,
    },
    bio: String,
    location: String,
    skills: [String],
    experience: Number,
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model<IUser>('User', userSchema);

// 2026-03-23 10:45:00 - feat(backend): add resume scoring and feedback


// 2026-04-29 10:45:00 - feat(backend): implement email service with Nodemailer


// 2026-06-12 15:20:00 - feat(backend): implement password hashing with bcrypt


// Update: 2026-01-03 16:06:00 - chore: configure TypeScript settings


// Update: 2026-01-08 09:35:00 - docs: update README with setup guide

