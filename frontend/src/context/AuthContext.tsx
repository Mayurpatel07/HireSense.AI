import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import * as authService from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, role?: 'user' | 'company') => Promise<User>;
  loginWithGoogle: (role: 'user' | 'company') => Promise<User>;
  register: (name: string, email: string, password: string, role: 'user' | 'company') => Promise<User>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const response = await authService.getProfile();
      setUser(response.user);
    } catch (err) {
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const hydrateUserProfile = async (): Promise<User> => {
    const profileResponse = await authService.getProfile();
    setUser(profileResponse.user);
    return profileResponse.user;
  };

  const login = async (email: string, password: string, role?: 'user' | 'company') => {
    try {
      setError(null);
      const response = await authService.loginUser(email, password, role);
      setToken(response.token);
      localStorage.setItem('token', response.token);
      return await hydrateUserProfile();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw err;
    }
  };

  const loginWithGoogle = async (role: 'user' | 'company') => {
    try {
      setError(null);
      const response = await authService.loginWithGoogle(role);
      setToken(response.token);
      localStorage.setItem('token', response.token);
      return await hydrateUserProfile();
    } catch (err: any) {
      const message = err.message || 'Google login failed';
      setError(message);
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string, role: 'user' | 'company') => {
    try {
      setError(null);
      const response = await authService.registerUser(name, email, password, role);
      setToken(response.token);
      localStorage.setItem('token', response.token);
      return await hydrateUserProfile();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setError(null);
      const response = await authService.updateProfile(data);
      setUser(response.user);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Update failed';
      setError(message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, loginWithGoogle, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
