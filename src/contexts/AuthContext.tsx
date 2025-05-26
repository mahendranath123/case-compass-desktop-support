
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface UserProfile {
  id: string;
  username: string;
  full_name?: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
}

interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, username: string, fullName?: string) => Promise<boolean>;
  createUser: (email: string, password: string, username: string, fullName?: string) => Promise<boolean>;
  changePassword: (newPassword: string) => Promise<boolean>;
  users: UserProfile[];
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isAuthenticated: false
  });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user profile
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      return data as UserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Fetch all users (admin only)
  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }
      setUsers(data as UserProfile[]);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!mounted) return;

        if (session?.user) {
          // Use setTimeout to prevent infinite loops
          setTimeout(async () => {
            if (!mounted) return;
            
            const profile = await fetchUserProfile(session.user.id);
            
            if (!mounted) return;
            
            setAuthState({
              user: session.user,
              profile,
              isAuthenticated: true
            });
            
            // Fetch all users if admin
            if (profile?.role === 'admin') {
              await fetchAllUsers();
            }
            
            setLoading(false);
          }, 0);
        } else {
          setAuthState({
            user: null,
            profile: null,
            isAuthenticated: false
          });
          setUsers([]);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (!mounted) return;

        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          
          if (!mounted) return;
          
          setAuthState({
            user: session.user,
            profile,
            isAuthenticated: true
          });
          
          // Fetch all users if admin
          if (profile?.role === 'admin') {
            await fetchAllUsers();
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking session:', error);
        setLoading(false);
      }
    };

    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Welcome back!');
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      toast.info('You have been logged out');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const signUp = async (email: string, password: string, username: string, fullName?: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName || ''
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Account created successfully! Please check your email to verify your account.');
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Sign up failed');
      return false;
    }
  };

  const createUser = async (email: string, password: string, username: string, fullName?: string): Promise<boolean> => {
    if (authState.profile?.role !== 'admin') {
      toast.error('Only administrators can create users');
      return false;
    }

    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          username,
          full_name: fullName || ''
        }
      });

      if (error) throw error;

      if (data.user) {
        toast.success(`User ${username} created successfully`);
        await fetchAllUsers(); // Refresh users list
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Create user error:', error);
      toast.error(error.message || 'Failed to create user');
      return false;
    }
  };

  const changePassword = async (newPassword: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Password changed successfully');
      return true;
    } catch (error: any) {
      console.error('Change password error:', error);
      toast.error(error.message || 'Failed to change password');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      authState, 
      login, 
      logout,
      signUp,
      createUser,
      changePassword,
      users,
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
