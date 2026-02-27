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
