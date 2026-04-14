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

// 2026-03-16 14:06:00 - feat(backend): implement Express server with TypeScript


// 2026-03-21 10:45:00 - feat(backend): add job status update functionality


// 2026-04-05 15:20:00 - feat(backend): create auth routes with validation


// 2026-04-08 10:45:00 - feat(backend): integrate Gemini API for resume analysis


// 2026-05-13 10:45:00 - feat(backend): add resume scoring and feedback


// 2026-05-13 13:27:00 - feat(backend): implement email service with Nodemailer


// 2026-05-22 15:20:00 - feat(backend): create analytics routes


// 2026-05-26 10:45:00 - feat(backend): add MongoDB connection with Mongoose


// 2026-05-27 13:30:00 - feat(backend): add job application tracking system


// 2026-05-29 09:15:00 - chore: add commitlint configuration


// Update: 2026-02-02 18:23:00 - fix(backend): resolve CORS configuration


// Update: 2026-04-14 17:17:00 - fix(frontend): resolve auth redirect loop

