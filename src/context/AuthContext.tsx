import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: Role | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  demoLogin: (role: Role) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('hiremeout_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api.getMe();
      setUser(data.user);
    } catch (err) {
      console.error('Failed to fetch current user:', err);
      localStorage.removeItem('hiremeout_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = async (credentials: any) => {
    setLoading(true);
    const data = await api.login(credentials);
    localStorage.setItem('hiremeout_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setLoading(false);
  };

  const demoLogin = async (targetRole: Role) => {
    setLoading(true);
    const data = await api.demoLogin(targetRole);
    localStorage.setItem('hiremeout_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setLoading(false);
  };

  const register = async (formData: any) => {
    setLoading(true);
    const data = await api.register(formData);
    localStorage.setItem('hiremeout_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('hiremeout_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user ? user.role : null,
        loading,
        logout,
        login,
        demoLogin,
        register,
        refreshUser,
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
