// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { buildUrl, API_ENDPOINTS } from '../config/api';
import logger from '../utils/logger';
import { TokenStorage, validateToken, isTokenExpired } from '../utils/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(TokenStorage.get());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Enhanced token validation on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = TokenStorage.get();
      
      if (storedToken) {
        // First validate token structure and expiry
        const validation = validateToken(storedToken);
        
        if (!validation.valid) {
          logger.error('Invalid token found:', validation.reason);
          TokenStorage.remove();
          setToken(null);
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Check if token is about to expire
        if (isTokenExpired(storedToken)) {
          logger.warn('Token expired or about to expire');
          TokenStorage.remove();
          setToken(null);
          setUser(null);
          setLoading(false);
          return;
        }
        
        try {
          // Verify token with server
          const response = await fetch(buildUrl(API_ENDPOINTS.USERS.PROFILE), {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'X-Requested-With': 'XMLHttpRequest',
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setToken(storedToken);
          } else {
            // Server rejected token
            logger.warn('Server rejected token');
            TokenStorage.remove();
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          logger.error('Auth check failed:', error);
          TokenStorage.remove();
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password, rememberMe = false) => {
  const response = await fetch(buildUrl(API_ENDPOINTS.AUTH.LOGIN), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, rememberMe }),
  });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || 'Login failed');
    }

    const data = await response.json();
    
    // Validate token before storing
    if (TokenStorage.set(data.token)) {
      setToken(data.token);
    } else {
      throw new Error('Received invalid token from server');
    }

    // Fetch user profile after login
    try {
      const profileResponse = await fetch(buildUrl(API_ENDPOINTS.USERS.PROFILE), {
        headers: {
          'Authorization': `Bearer ${data.token}`,
        },
      });
      
      if (profileResponse.ok) {
        const userData = await profileResponse.json();
        setUser(userData);
      }
    } catch (error) {
      logger.error('Failed to fetch user profile:', error);
    }
  };

  const register = async (name, email, password) => {
    const response = await fetch(buildUrl(API_ENDPOINTS.AUTH.REGISTER), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || 'Registration failed');
    }

    return await response.text();
  };

  const logout = () => {
    TokenStorage.remove();
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const isAuthenticated = () => {
    return !!token;
  };

  const value = {
    token,
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
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