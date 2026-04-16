'use client';
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserProfile, getProfile } from '@/functions/api/auth';

export type UserRole = 'marketing' | 'pm' | 'gm' | 'hr' | 'employee';

interface RoleContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  isLoading: boolean;
  logout: () => void;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_profile';

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
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setCurrentUser(null);
    router.push('/login');
  }, [router]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (savedToken) {
      setToken(savedToken);
        if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          if (user && user.role) {
            user.role = user.role.toLowerCase();
          }
          setCurrentUser(user);
        } catch (e) {
          console.error('Failed to parse saved user', e);
        }
      }
    }
    setIsLoading(false);
  }, []);

  // Verify token on mount or when it changes
  useEffect(() => {
    const verifyToken = async () => {
      if (token && !currentUser) {
        try {
          const profile = await getProfile();
          if (profile && profile.role) {
            profile.role = profile.role.toLowerCase();
          }
          setCurrentUser(profile);
          localStorage.setItem(USER_KEY, JSON.stringify(profile));
        } catch (error) {
          console.error('Session verification failed', error);
          logout();
        }
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token, currentUser, logout]);

  // Handle redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !token && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
      router.push('/login');
    }
  }, [isLoading, token, pathname, router]);

    const setNormalizedUser = useCallback((user: UserProfile | null) => {
      if (user && user.role) {
        user.role = user.role.toLowerCase() as UserRole;
      }
      setCurrentUser(user);
    }, []);

    return (
      <RoleContext.Provider value={{
        currentUser,
        setCurrentUser: setNormalizedUser,
        token,
        setToken,
        isLoading,
        logout
      }}>
        {children}
      </RoleContext.Provider>
    );
}

export const roleConfig: Record<string, { label: string; color: string }> = {
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
