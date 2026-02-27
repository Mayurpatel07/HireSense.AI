import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { admin, isFirebaseInitialized } from '../config/firebase';

const isValidLoginRole = (role: unknown): role is 'user' | 'company' => {
  return role === 'user' || role === 'company';
};

const formatUserResponse = (user: any) => {
  const userObject = user.toObject ? user.toObject() : user;
  const { password, __v, ...safeUser } = userObject;
  return safeUser;
};

/**
 * Firebase Register - Create user with Firebase ID token
 */
export const firebaseRegister = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { idToken, email, name, role } = req.body;

    if (!idToken || !email || !name) {
      res.status(400).json({ message: 'ID token, email, and name required' });
      return;
    }

    if (!isFirebaseInitialized) {
      res.status(500).json({ message: 'Firebase not configured' });
      return;
    }

    // Verify Firebase ID token
    try {
      await admin.auth().verifyIdToken(idToken);
    } catch (error: any) {
      console.error('Token verification error:', error.message);
      res.status(401).json({ message: 'Invalid or expired token' });
      return;
    }

    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Create new user
      user = await User.create({
        name,
        email: normalizedEmail,
        role: role || 'user',
      });
      console.log('New Firebase user created:', normalizedEmail);
    } else {
      console.log('User already exists:', normalizedEmail);
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.email, user.role);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('Firebase registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

/**
 * Firebase Login - Login with Firebase ID token
 */
export const firebaseLogin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { idToken, email, role } = req.body;

    if (!idToken || !email) {
      res.status(400).json({ message: 'ID token and email required' });
      return;
    }

    if (!isFirebaseInitialized) {
      res.status(500).json({ message: 'Firebase not configured' });
      return;
    }

    // Verify Firebase ID token
    try {
      await admin.auth().verifyIdToken(idToken);
    } catch (error: any) {
      console.error('Token verification error:', error.message);
      res.status(401).json({ message: 'Invalid or expired token' });
      return;
    }

    const normalizedEmail = email.toLowerCase();

    // Find user
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      res.status(404).json({ message: 'This email is not registered. Please sign up.' });
      return;
    }

    if (isValidLoginRole(role) && user.role !== role && user.role !== 'admin') {
      user.role = role;
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.email, user.role);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('Firebase login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

/**
 * Register a new user (DEPRECATED - Use firebaseRegister instead)
 */
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      res.status(400).json({ message: 'Please provide all required fields' });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'user',
    });

    // Generate token
    const token = generateToken(user._id.toString(), user.email, user.role);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

/**
 * Login user (DEPRECATED - Use firebaseLogin instead)
 */
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password required' });
      return;
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ message: 'This email is not registered. Please sign up.' });
      return;
    }

    // Check if user has a password (not a Google login user)
    if (!user.password) {
      res.status(401).json({ message: 'This account was created with Google login. Please use Google login instead.' });
      return;
    }

    if (isValidLoginRole(role) && user.role !== role && user.role !== 'admin') {
      user.role = role;
      await user.save();
    }

    // Compare password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      res.status(401).json({ message: 'Please enter the correct password' });
      return;
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.email, user.role);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

/**
 * Login or register user with Google
 */
export const googleLogin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { idToken, email, name, role } = req.body;

    if (!idToken || !email) {
      res.status(400).json({ message: 'ID token and email required' });
      return;
    }

    // Verify Firebase ID token if Firebase is initialized
    if (isFirebaseInitialized) {
      try {
        await admin.auth().verifyIdToken(idToken);
        console.log('Firebase ID token verified for:', email);
      } catch (error: any) {
        console.error('Token verification error:', error.message);
        res.status(401).json({ message: 'Invalid or expired token' });
        return;
      }
    } else {
      // Development mode: Accept token without verification
      // In production, you MUST configure Firebase service account
      console.warn('⚠️  Firebase not configured - accepting token without verification (DEV MODE ONLY)');
      if (!idToken || idToken.length < 10) {
        res.status(400).json({ message: 'Invalid token format' });
        return;
      }
    }

    const normalizedEmail = email.toLowerCase();
    const selectedRole: 'user' | 'company' = isValidLoginRole(role) ? role : 'user';

    // Check if user exists
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Create new user with Google login
      user = await User.create({
        name: name || email.split('@')[0],
        email: normalizedEmail,
        role: selectedRole,
        // No password for Google login
        password: '', // Will be handled by Firebase auth
      });
      console.log('New Google user created:', normalizedEmail);
    } else {
      if (isValidLoginRole(role) && user.role !== role && user.role !== 'admin') {
        user.role = role;
        await user.save();
        console.log(`Google user role updated for ${normalizedEmail}: ${role}`);
      }
      console.log('Existing Google user logged in:', normalizedEmail);
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.email, user.role);

    res.status(200).json({
      message: 'Google login successful',
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Google login failed' });
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { name, phone, bio, location, skills, experience } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, bio, location, skills, experience },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};
