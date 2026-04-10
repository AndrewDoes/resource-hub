'use client';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type UserRole = 'marketing' | 'pm' | 'gm' | 'hr' | 'employee';

interface User {
  name: string;
  role: UserRole;
  avatar: string;
  email: string;
}

interface RoleContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
}

const STORAGE_KEY = 'resource-planning-user';

const DEFAULT_USER: User = {
  name: 'John Doe',
  role: 'gm',
  avatar: 'JD',
  email: 'john.doe@company.com',
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within RoleProvider');
  }
  return context;
};

interface RoleProviderProps {
  children: ReactNode;
}

export function RoleProvider({ children }: RoleProviderProps) {
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USER);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever user changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    }
  }, [currentUser, isLoaded]);

  return (
    <RoleContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </RoleContext.Provider>
  );
}

export const roleConfig = {
  marketing: {
    label: 'Marketing',
    color: 'from-purple-500 to-pink-500',
  },
  pm: {
    label: 'Project Manager',
    color: 'from-blue-500 to-cyan-500',
  },
  gm: {
    label: 'General Manager',
    color: 'from-blue-500 to-green-500',
  },
  hr: {
    label: 'HR Manager',
    color: 'from-green-500 to-teal-500',
  },
  employee: {
    label: 'Employee',
    color: 'from-orange-500 to-yellow-500',
  },
};
