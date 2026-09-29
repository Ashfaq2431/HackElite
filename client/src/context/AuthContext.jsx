import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { joinUserRoom } from '../services/socket';

const AuthContext = createContext(null);

export const getDashboardRoute = (role) => {
  switch (role) {
    case 'student':
      return '/student/dashboard';
    case 'faculty':
      return '/faculty/dashboard';
    case 'hod':
      return '/hod/dashboard';
    case 'admin':
      return '/admin/dashboard';
    default:
      return '/login';
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('campus_token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch current user details on boot if token exists
  useEffect(() => {
    const fetchMe = async () => {
      const storedToken = localStorage.getItem('campus_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            joinUserRoom(res.data.user._id);
          }
        } catch (err) {
          console.error('Failed to verify token', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token, user } = res.data;
      localStorage.setItem('campus_token', token);
      localStorage.setItem('campus_user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      joinUserRoom(user._id);
      return user;
    }
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data.success) {
      const { token, user } = res.data;
      localStorage.setItem('campus_token', token);
      localStorage.setItem('campus_user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      joinUserRoom(user._id);
      return user;
    }
  };

  const logout = () => {
    localStorage.removeItem('campus_token');
    localStorage.removeItem('campus_user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data);
    if (res.data.success) {
      setUser(res.data.user);
      localStorage.setItem('campus_user', JSON.stringify(res.data.user));
      return res.data.user;
    }
  };

  // Quick Demo Login Helper for rapid testing with exact official credentials
  const quickDemoLogin = async (role) => {
    const demoCredentials = {
      student: { email: 'student@college.edu', password: 'Student@123' },
      faculty: { email: 'faculty@college.edu', password: 'Faculty@123' },
      hod: { email: 'hod.cse@college.edu', password: 'Hod@123' },
      admin: { email: 'admin@college.edu', password: 'Admin@123' },
    };

    const creds = demoCredentials[role] || demoCredentials.student;
    return await login(creds.email, creds.password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        quickDemoLogin,
        isAuthenticated: !!user,
        isStudent: user?.role === 'student',
        isFaculty: user?.role === 'faculty',
        isHod: user?.role === 'hod',
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
