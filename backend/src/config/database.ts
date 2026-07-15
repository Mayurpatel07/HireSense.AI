import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 */
export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hiresenseai';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error);
  }
};

// 2026-03-16 15:20:00 - feat(backend): create AI service for resume analysis


// 2026-04-19 13:30:00 - feat(backend): add job status update functionality


// 2026-04-30 15:20:00 - feat(backend): create Analytics model


// 2026-05-19 10:45:00 - feat: add dark/light theme toggle


// 2026-06-01 09:15:00 - feat(backend): create User model with roles

