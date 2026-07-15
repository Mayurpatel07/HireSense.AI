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
