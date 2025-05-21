
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, AuthState } from '@/types';
import { toast } from '@/components/ui/sonner';

// Utility function to generate UUID
function generateAuthUID() {
  return crypto.randomUUID();
}

// Initial admin user only
const initialUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin'
  }
];

interface AuthContextType {
  authState: AuthState;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  createUser: (username: string, password: string) => boolean;
  changePassword: (oldPassword: string, newPassword: string) => boolean;
  users: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('supportAppUsers');
    return savedUsers ? JSON.parse(savedUsers) : initialUsers;
  });

  const [authState, setAuthState] = useState<AuthState>(() => {
    const savedUser = localStorage.getItem('supportAppUser');
    return {
      user: savedUser ? JSON.parse(savedUser) : null,
      isAuthenticated: !!savedUser
    };
  });

  useEffect(() => {
    localStorage.setItem('supportAppUsers', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (authState.user) {
      localStorage.setItem('supportAppUser', JSON.stringify(authState.user));
    } else {
      localStorage.removeItem('supportAppUser');
    }
  }, [authState]);

  const login = (username: string, password: string): boolean => {
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      setAuthState({
        user,
        isAuthenticated: true
      });
      toast.success(`Welcome back, ${username}!`);
      return true;
    }
    
    toast.error('Invalid username or password');
    return false;
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false
    });
    toast.info('You have been logged out');
  };

  const createUser = (username: string, password: string): boolean => {
    if (users.some(u => u.username === username)) {
      toast.error('Username already exists');
      return false;
    }

    const newUser: User = {
      id: generateAuthUID(),
      username,
      password,
      role: 'user'
    };

    setUsers([...users, newUser]);
    toast.success(`User ${username} created successfully`);
    return true;
  };

  const changePassword = (oldPassword: string, newPassword: string): boolean => {
    if (!authState.user) {
      toast.error('You must be logged in to change your password');
      return false;
    }

    if (authState.user.password !== oldPassword) {
      toast.error('Current password is incorrect');
      return false;
    }

    const updatedUsers = users.map(user => 
      user.id === authState.user?.id ? { ...user, password: newPassword } : user
    );

    setUsers(updatedUsers);
    setAuthState({
      user: { ...authState.user, password: newPassword },
      isAuthenticated: true
    });
    
    toast.success('Password changed successfully');
    return true;
  };

  return (
    <AuthContext.Provider value={{ 
      authState, 
      login, 
      logout,
      createUser,
      changePassword,
      users 
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
