import React, { createContext, useContext, useState, useEffect } from 'react';

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
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('chirper_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    // Mock login
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser: User = {
      id: '1',
      username,
      email: `${username}@chirper.app`,
      bio: 'Just vibing on Chirper 🎉',
      profile_picture_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      created_at: new Date().toISOString(),
      xp: 1250,
      level: 5,
      streak: 3,
      badges: ['first_chirp', 'early_bird', 'social_butterfly']
    };
    
    setUser(mockUser);
    localStorage.setItem('chirper_user', JSON.stringify(mockUser));
    localStorage.setItem('chirper_token', 'mock_jwt_token');
  };

  const register = async (username: string, email: string, password: string, bio?: string) => {
    // Mock register
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      email,
      bio: bio || 'New to Chirper!',
      profile_picture_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      created_at: new Date().toISOString(),
      xp: 50,
      level: 1,
      streak: 1,
      badges: ['first_chirp']
    };
    
    setUser(mockUser);
    localStorage.setItem('chirper_user', JSON.stringify(mockUser));
    localStorage.setItem('chirper_token', 'mock_jwt_token');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('chirper_user');
    localStorage.removeItem('chirper_token');
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
