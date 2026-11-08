import { createContext, useContext, useState, useEffect } from 'react';
import type { FC, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (pinOrKey: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('ronn_owner_auth') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('ronn_owner_auth', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  const login = (pinOrKey: string) => {
    // Default Owner PIN or master key
    // Accepts "ronn", "admin", "1234", or custom bot secret
    const validKeys = ['ronn', '1234', 'owner', 'ronnbot'];
    if (validKeys.includes(pinOrKey.trim().toLowerCase())) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('ronn_owner_auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

