import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SafeUser, AuthSession } from '@/types';
import { api } from '@/services/api';

interface AuthContextType {
  user: SafeUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'micropost_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (savedToken) {
        const response = await api.auth.me(savedToken);
        if (response.data) {
          setUser(response.data);
          setToken(savedToken);
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.auth.login(email, password);
    
    if (response.data) {
      setUser(response.data.user);
      setToken(response.data.token);
      localStorage.setItem(TOKEN_KEY, response.data.token);
      return { success: true };
    }
    
    return { success: false, error: response.error };
  }, []);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    const response = await api.auth.register(email, password, displayName);
    
    if (response.data) {
      setUser(response.data.user);
      setToken(response.data.token);
      localStorage.setItem(TOKEN_KEY, response.data.token);
      return { success: true };
    }
    
    return { success: false, error: response.error };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
