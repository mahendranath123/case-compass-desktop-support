
import React, { createContext, useState, useContext, useEffect } from 'react';

interface UserProfile {
  id: string;
  username: string;
  full_name?: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: any;
  profile: UserProfile | null;
  isAuthenticated: boolean;
}

interface AuthContextType {
  authState: AuthState;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    full_name: 'Administrator',
    role: 'admin' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    username: 'user',
    password: 'user123',
    full_name: 'Regular User',
    role: 'user' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isAuthenticated: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAuthState({
          user: user,
          profile: user,
          isAuthenticated: true
        });
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = (username: string, password: string): boolean => {
    const user = mockUsers.find(u => u.username === username && u.password === password);
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      setAuthState({
        user: userWithoutPassword,
        profile: userWithoutPassword,
        isAuthenticated: true
      });
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      return true;
    }
    
    return false;
  };

  const logout = (): void => {
    setAuthState({
      user: null,
      profile: null,
      isAuthenticated: false
    });
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ 
      authState, 
      login, 
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
