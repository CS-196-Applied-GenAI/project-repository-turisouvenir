import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, ApiUser } from '../api/auth';
import { getToken } from '../api/client';

export interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  profile_picture_url?: string;
  created_at: string;
  xp: number;
  level: number;
  streak: number;
  badges: string[];
}

function apiUserToUser(u: ApiUser): User {
  return {
    id: String(u.id),
    username: u.username,
    email: u.email ?? '',
    bio: u.bio ?? undefined,
    profile_picture_url: u.profile_picture_url ?? undefined,
    created_at: u.created_at,
    // Gamification defaults (backend doesn't have these yet)
    xp: 0,
    level: 1,
    streak: 0,
    badges: ['first_chirp'],
  };
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, bio?: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('chirper_user');
    const token = getToken();
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('chirper_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const res = await apiLogin(username, password);
    const u = apiUserToUser(res.user);
    setUser(u);
    localStorage.setItem('chirper_user', JSON.stringify(u));
  };

  const register = async (username: string, email: string, password: string, bio?: string) => {
    const res = await apiRegister(username, email, password, bio);
    const u = apiUserToUser(res.user);
    setUser(u);
    localStorage.setItem('chirper_user', JSON.stringify(u));
  };

  const logout = () => {
    apiLogout().catch(() => {});
    setUser(null);
    localStorage.removeItem('chirper_user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('chirper_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
