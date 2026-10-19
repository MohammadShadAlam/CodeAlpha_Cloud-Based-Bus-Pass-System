

import {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import type { ReactNode } from 'react';

type AuthUser = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
};

type AuthContextType = {
updateUser: (user: AuthUser) => void;  
user: AuthUser | null;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const token = localStorage.getItem('tripzo-access-token');
      const savedUser = localStorage.getItem('tripzo-user');

      if (!token || !savedUser) return null;
      return JSON.parse(savedUser) as AuthUser;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const syncAuth = () => {
      const token = localStorage.getItem('tripzo-access-token');
      const savedUser = localStorage.getItem('tripzo-user');

      if (!token || !savedUser) {
        setUser(null);
        return;
      }

      try {
        setUser(JSON.parse(savedUser) as AuthUser);
      } catch {
        setUser(null);
      }
    };

    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  const login = (user: AuthUser, token: string) => {
    localStorage.setItem('tripzo-access-token', token);
    localStorage.setItem('tripzo-user', JSON.stringify(user));
    localStorage.setItem(
      'tripzo-session',
      JSON.stringify({ signedIn: true, at: new Date().toISOString() })
    );
    setUser(user);
  };

const updateUser = (user: AuthUser) => {
  localStorage.setItem('tripzo-user', JSON.stringify(user));
  setUser(user);
};

  const logout = () => {
    localStorage.removeItem('tripzo-access-token');
    localStorage.removeItem('tripzo-user');
    localStorage.removeItem('tripzo-session');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
