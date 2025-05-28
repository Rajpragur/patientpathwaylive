import React, { createContext, useContext, useEffect, useState } from 'react';
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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          // Check if email is verified
          if (session?.user && !session.user.email_confirmed_at) {
            navigate('/verify-email');
          } else {
            navigate('/portal');
          }
        } else if (event === 'USER_UPDATED') {
          // Handle email verification
          if (session?.user?.email_confirmed_at) {
            navigate('/portal');
          }
        }
      }
    );

    // Check initial session and email verification status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // If user is not verified, redirect to verification page
      if (session?.user && !session.user.email_confirmed_at) {
        navigate('/verify-email');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
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
  };

  const signUp = async (email: string, password: string, metadata = {}) => {
    try {
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
        return { error: null };
      }

      return { error };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
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
