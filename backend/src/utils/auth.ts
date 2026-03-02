import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';

/**
 * Hash password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hashed password
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generate JWT token
 */
export const generateToken = (
  id: string,
  email: string,
  role: string
): string => {
  const secret = process.env.JWT_SECRET || 'secret';
  
  return jwt.sign(
    { id, email, role },
    secret,
    { expiresIn: '7d' }
  );
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret');
  } catch (error) {
    return null;
  }
};

// Update: 2026-01-29 09:44:00 - feat(frontend): initialize React with Vite


// Update: 2026-02-05 11:24:00 - feat(backend): implement analytics dashboard


// Update: 2026-02-11 17:35:00 - feat(frontend): create useToast hook


// Update: 2026-02-12 09:51:00 - feat(backend): add user registration endpoint


// Update: 2026-02-12 14:10:00 - feat(frontend): add useJobs hook


// Update: 2026-02-16 17:28:00 - feat(frontend): add protected routes


// Update: 2026-03-02 16:32:00 - perf: improve load time

