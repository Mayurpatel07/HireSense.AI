import 'dotenv/config';
import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import { connectDB } from './config/database';

// Import routes
import authRoutes from './routes/authRoutes';
import jobRoutes from './routes/jobRoutes';
import resumeRoutes from './routes/resumeRoutes';
import adminRoutes from './routes/adminRoutes';
import resumeAnalyzerRoutes from './routes/resumeAnalyzerRoutes';

const app: Express = express();
const PORT = process.env.PORT || 5000;
const normalizeOrigin = (value: string) => value.trim().replace(/\/+$/, '');

const configuredOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean)
  .map(normalizeOrigin);

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedRequestOrigin = normalizeOrigin(origin);

      if (configuredOrigins.includes(normalizedRequestOrigin)) {
        callback(null, true);
        return;
      }

      const localOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1|\d{1,3}(?:\.\d{1,3}){3})(:\d+)?$/;
      if (localOriginPattern.test(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
  })
);
app.use(compression()); // Enable gzip compression for all responses
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Connect to database
connectDB();

/**
 * Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resume-analyzer', resumeAnalyzerRoutes);

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running', timestamp: new Date() });
});

/**
 * Error handling middleware
 */
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📧 Environment: ${process.env.NODE_ENV}`);
});

export default app;
