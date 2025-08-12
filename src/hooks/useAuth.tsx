import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(prevSession => {
          if (JSON.stringify(prevSession) !== JSON.stringify(session)) {
            return session;
          }
          return prevSession;
        });
        setUser(prevUser => {
          const newUser = session?.user ?? null;
          if (JSON.stringify(prevUser) !== JSON.stringify(newUser)) {
            return newUser;
          }
          return prevUser;
        });
        setLoading(false);

        if (event === 'SIGNED_IN') {
          // Check if email is verified
          if (session?.user && !session.user.email_confirmed_at) {
            navigateRef.current('/verify-email');
          } else if (window.location.pathname === '/auth') {
            // Only redirect to portal if we're on the auth page
            navigateRef.current('/portal');
          }
        } else if (event === 'USER_UPDATED') {
          // Handle email verification
          if (session?.user?.email_confirmed_at && window.location.pathname === '/verify-email') {
            navigateRef.current('/portal');
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, redirecting to auth page');
          setUser(null);
          setSession(null);
          navigateRef.current('/auth');
        }
      }
    );

    // Check initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only redirect if we're on the auth page and user is not verified
        if (session?.user && !session.user.email_confirmed_at && window.location.pathname === '/auth') {
          navigateRef.current('/verify-email');
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting to sign in with email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (!error && data.user && !data.user.email_confirmed_at) {
        // If user is not verified, sign them out and show verification message
        await supabase.auth.signOut();
        return { 
          error: { 
            message: 'Please verify your email before signing in. Check your inbox for the verification link.' 
          } 
        };
      }
      
      return { error };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata = {}) => {
    try {
      setLoading(true);
      console.log('Attempting to sign up with email:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/verify-email`
        }
      });

      if (error) throw error;

      // If signup is successful but email confirmation is required
      if (data?.user && !data.user.email_confirmed_at) {
        console.log('Sign up successful, email verification required');
        return { error: null };
      }

      return { error };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting sign out process...');
      setLoading(true);
      
      // Clear local state first
      setUser(null);
      setSession(null);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      console.log('Sign out completed successfully');
      
      // Force navigation to auth page
      navigate('/auth', { replace: true });
      
    } catch (error: any) {
      console.error('Sign out error:', error);
      // Even if there's an error, clear local state and redirect
      setUser(null);
      setSession(null);
      navigate('/auth', { replace: true });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
