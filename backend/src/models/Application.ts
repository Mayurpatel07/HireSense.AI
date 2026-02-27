import { Schema, model, Document, Types } from 'mongoose';

export interface IApplication extends Document {
  _id: string;
  jobId: Types.ObjectId;
  userId: Types.ObjectId;
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
    predictedAt: Date;
  };
  appliedAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: String, required: true },
    resume: { type: String, required: true },
    coverLetter: String,
    status: {
      type: String,
      enum: ['applied', 'reviewing', 'shortlisted', 'rejected', 'offer', 'hired'],
      default: 'applied',
    },
    matchScore: { type: Number, min: 0, max: 100 },
    resumeAnalysis: {
      strengths: [String],
      weaknesses: [String],
      missingSkills: [String],
    },
    hirePrediction: {
      hireProbability: { type: Number, min: 0, max: 100 },
      verdict: {
        type: String,
        enum: ['likely', 'uncertain', 'unlikely'],
      },
      missingSkills: [String],
      strengths: [String],
      improvementAreas: [String],
      summary: String,
      predictedAt: Date,
    },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default model<IApplication>('Application', applicationSchema);
