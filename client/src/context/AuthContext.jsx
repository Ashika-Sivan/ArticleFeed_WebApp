import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check active session on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const data = await authService.getMe();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const register = async (userData) => {
    const data = await authService.register(userData);
    return data;
  };

  const verifyOtp = async (payload) => {
    const data = await authService.verifyOtp(payload);
    if (data.user) {
      setUser(data.user);
    }
    return data;
  };

  const resendOtp = async (payload) => {
    return await authService.resendOtp(payload);
  };

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    if (data.user) {
      setUser(data.user);
    }
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        register,
        verifyOtp,
        resendOtp,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
