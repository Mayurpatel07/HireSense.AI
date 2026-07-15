import apiClient from './api';
import { User, AuthResponse } from '../types';
import axios from 'axios';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider, firebaseRegister, firebaseLogin } from '../config/firebase';

const GOOGLE_LOGIN_ROLE_KEY = 'googleLoginRole';

const getStoredGoogleLoginRole = (): 'user' | 'company' | null => {
  const storedRole = localStorage.getItem(GOOGLE_LOGIN_ROLE_KEY);
  if (storedRole === 'user' || storedRole === 'company') {
    return storedRole;
  }
  return null;
};

// Register user with email/password using Firebase
export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: 'user' | 'company' = 'user'
): Promise<AuthResponse> => {
  try {
    // Create Firebase user
    const firebaseUser = await firebaseRegister(email, password);
    const idToken = await firebaseUser.user.getIdToken();

    // Send to backend to create user record in MongoDB
    const response = await apiClient.post('/auth/firebase-register', {
      idToken,
      email: firebaseUser.user.email,
      name,
      role,
    });

    return response.data;
  } catch (error: any) {
    throw new Error(`Registration failed: ${error.message}`);
  }
};

// Login user with email/password using Firebase
export const loginUser = async (
  email: string,
  password: string,
  role?: 'user' | 'company'
): Promise<AuthResponse> => {
  try {
    try {
      // Sign in with Firebase first (for Firebase-managed accounts)
      const firebaseUser = await firebaseLogin(email, password);
      const idToken = await firebaseUser.user.getIdToken();

      const response = await apiClient.post('/auth/firebase-login', {
        idToken,
        email: firebaseUser.user.email,
        role,
      });

      return response.data;
    } catch (firebaseError: any) {
      const firebaseCode = firebaseError?.code;
      const canFallbackToLegacy =
        firebaseCode === 'auth/user-not-found' ||
        firebaseCode === 'auth/invalid-credential' ||
        firebaseCode === 'auth/wrong-password';

      if (canFallbackToLegacy) {
        const legacyResponse = await apiClient.post('/auth/login', {
          email,
          password,
          role,
        });
        return legacyResponse.data;
      }

      throw firebaseError;
    }
  } catch (error: any) {
    // Prioritize backend error messages (these are more specific)
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    // Handle Firebase authentication errors with user-friendly messages
    const errorCode = error.code;
    let errorMessage = 'Login failed';

    if (errorCode === 'auth/user-not-found') {
      errorMessage = 'This email is not registered. Please sign up.';
    } else if (errorCode === 'auth/wrong-password') {
      errorMessage = 'Please enter the correct password';
    } else if (errorCode === 'auth/invalid-credential') {
      errorMessage = 'Invalid email or password. Please check your credentials.';
    } else if (errorCode === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address';
    } else if (errorCode === 'auth/user-disabled') {
      errorMessage = 'This account has been disabled';
    } else if (errorCode === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

// Login with Google - Try popup first, fall back to redirect if blocked
export const loginWithGoogle = async (role: 'user' | 'company'): Promise<AuthResponse> => {
  try {
    const storedRole = getStoredGoogleLoginRole();
    const effectiveRole = storedRole || role;

    // First, check if there's a pending redirect result
    const redirectResult = await getRedirectResult(auth);
    if (redirectResult) {
      const user = redirectResult.user;
      const idToken = await user.getIdToken();

      const response = await apiClient.post('/auth/google-login', {
        idToken,
        email: user.email,
        name: user.displayName,
        role: effectiveRole,
      });

      localStorage.removeItem(GOOGLE_LOGIN_ROLE_KEY);

      return response.data;
    }

    // Try popup first
    try {
      localStorage.setItem(GOOGLE_LOGIN_ROLE_KEY, role);

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const response = await apiClient.post('/auth/google-login', {
        idToken,
        email: user.email,
        name: user.displayName,
        role,
      });

      localStorage.removeItem(GOOGLE_LOGIN_ROLE_KEY);

      return response.data;
    } catch (popupError: any) {
      // If popup is blocked, use redirect instead
      if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user') {
        console.log('Popup blocked or closed - using redirect flow');
        localStorage.setItem(GOOGLE_LOGIN_ROLE_KEY, role);
        await signInWithRedirect(auth, googleProvider);
        // The page will redirect and reload, so we don't need to return anything
        throw new Error('Redirecting to Google Sign-In...');
      }
      localStorage.removeItem(GOOGLE_LOGIN_ROLE_KEY);
      throw popupError;
    }
  } catch (error: any) {
    if (error.message !== 'Redirecting to Google Sign-In...') {
      localStorage.removeItem(GOOGLE_LOGIN_ROLE_KEY);
    }

    if (axios.isAxiosError(error)) {
      const backendMessage = error.response?.data?.message;
      if (backendMessage) {
        throw new Error(backendMessage);
      }
      throw new Error(`Google login failed: ${error.response?.status || 'Request failed'}`);
    }

    // Re-throw the error so it can be caught by the component
    throw new Error(`Google login failed: ${error.message}`);
  }
};

// Get current user profile
export const getProfile = async (): Promise<{ user: User }> => {
  const response = await apiClient.get('/auth/profile');
  return response.data;
};

// Update user profile
export const updateProfile = async (data: Partial<User>): Promise<{ user: User }> => {
  const response = await apiClient.put('/auth/profile', data);
  return response.data;
};
