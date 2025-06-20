import React, { createContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, getCurrentUser, logoutUser, refreshToken } from '../api/auth';
import toast from '../utils/toast';

const AuthContext = createContext();

// Comprehensive cleanup function for expired tokens
const clearAllAuthData = () => {
  // Clear all possible auth-related localStorage items
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  
  // Also clear any other potential auth-related items that might exist
  Object.keys(localStorage).forEach(key => {
    if (key.toLowerCase().includes('token') || 
        key.toLowerCase().includes('auth') || 
        key.toLowerCase().includes('user')) {
      localStorage.removeItem(key);
    }
  });
  
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(true);

  // Fetch user info if token exists
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setUser(null);
      setAccessToken(null);
      setLoading(false);
      return;
    }
    
    try {
      const userData = await getCurrentUser();
      const userInfo = userData.user || userData; // support both {user} and user
      setUser(userInfo);
      setAccessToken(token);
    } catch (error) {
      
      // Check if this is a 401 error (token expired)
      if (error.code === 'UNAUTHORIZED' || error.message?.includes('401')) {
        
        try {
          // Try to refresh the token
          const refreshResponse = await refreshToken();
          
          // Update tokens
          localStorage.setItem('accessToken', refreshResponse.accessToken);
          setAccessToken(refreshResponse.accessToken);
          
          // Update user if provided
          if (refreshResponse.user) {
            setUser(refreshResponse.user);
          } else {
            // If no user in refresh response, try to get current user again
            const userData = await getCurrentUser();
            const userInfo = userData.user || userData;
            setUser(userInfo);
          }
        } catch (refreshError) {
          console.log('❌ AuthContext: Token refresh failed - refresh token expired:', refreshError.message);
          // Refresh token expired, clear all auth data
          setUser(null);
          setAccessToken(null);
          clearAllAuthData();
          
          // Only show error if this wasn't during initial load
          if (!loading) {
            toast.error('Session expired. Please log in again.');
          }
        }
      } else {
        // Non-auth related error, clear tokens
        setUser(null);
        setAccessToken(null);
        clearAllAuthData();
      }
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await loginUser(credentials);
      localStorage.setItem('accessToken', res.accessToken);
      setAccessToken(res.accessToken);
      
      // Set user immediately from login response for instant UI update
      if (res.user) {
        setUser(res.user);
        setLoading(false); // Stop loading immediately for instant navbar update
      }
      
      toast.success(`Welcome back, ${res.user?.name || 'user'}!`);
      return true;
    } catch (err) {
      toast.error(err.message || 'Login failed.');
      setUser(null);
      setAccessToken(null);
      clearAllAuthData();
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await registerUser(userData);
      localStorage.setItem('accessToken', res.accessToken);
      setAccessToken(res.accessToken);
      
      // Set user immediately from register response for instant UI update
      if (res.user) {
        setUser(res.user);
        setLoading(false); // Stop loading immediately for instant navbar update
      }
      
      toast.success(`Welcome to BookReview, ${res.user?.name || 'user'}!`);
      return true;
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
      setUser(null);
      setAccessToken(null);
      clearAllAuthData();
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setAccessToken(null);
      clearAllAuthData();
      toast.success('Logged out successfully!');
    } catch {
      setUser(null);
      setAccessToken(null);
      clearAllAuthData();
      toast.error('Logout failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, register, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 