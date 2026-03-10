'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, demoUsers } from '@/lib/permissions';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://optalis-api-production.up.railway.app';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  switchUser: (email: string) => void;
  loginUser: (email: string) => Promise<void>;
  isLoading: boolean;
  isAdmin: boolean;
  facilityId: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Computed properties
  const isAdmin = user?.role === 'admin';
  const facilityId = user?.facility_id || null;

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const savedEmail = localStorage.getItem('optalis_user_email');
      if (savedEmail) {
        try {
          // Try to fetch from API first
          const res = await fetch(`${API_URL}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: savedEmail })
          });
          const userData = await res.json();
          
          if (userData && userData.email) {
            setUser({
              id: userData.id,
              name: userData.name || savedEmail.split('@')[0],
              initials: getInitials(userData.name || savedEmail),
              email: userData.email,
              role: userData.role || 'reviewer',
              facility_id: userData.facility_id || null,
              facility_name: userData.facility_name || null,
            });
          } else {
            // Fallback to demo admin
            setUser(demoUsers['admin@optalis.com']);
          }
        } catch (err) {
          // Fallback to demo users on error
          if (demoUsers[savedEmail]) {
            setUser(demoUsers[savedEmail]);
          } else {
            setUser(demoUsers['admin@optalis.com']);
          }
        }
      } else {
        // Default to admin user for demo
        setUser(demoUsers['admin@optalis.com']);
        localStorage.setItem('optalis_user_email', 'admin@optalis.com');
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  // Login user via API
  const loginUser = async (email: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const userData = await res.json();
      
      const newUser: User = {
        id: userData.id,
        name: userData.name || email.split('@')[0],
        initials: getInitials(userData.name || email),
        email: userData.email || email,
        role: userData.role || 'reviewer',
        facility_id: userData.facility_id || null,
        facility_name: userData.facility_name || null,
      };
      
      setUser(newUser);
      localStorage.setItem('optalis_user_email', email);
    } catch (err) {
      console.error('Login failed:', err);
      // Fallback to demo admin
      setUser(demoUsers['admin@optalis.com']);
      localStorage.setItem('optalis_user_email', 'admin@optalis.com');
    }
    setIsLoading(false);
  };

  // Switch user (for demo/testing purposes)
  const switchUser = (email: string) => {
    loginUser(email);
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      switchUser, 
      loginUser,
      isLoading,
      isAdmin,
      facilityId 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';
}
