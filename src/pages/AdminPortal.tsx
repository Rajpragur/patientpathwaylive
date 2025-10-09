import { useState, useEffect, useRef } from 'react';
import { AdminAuth } from '@/components/admin/AdminAuth';
import { EnhancedAdminDashboard } from '@/components/admin/EnhancedAdminDashboard';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export default function AdminPortal() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const isAdminRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        console.log('Checking auth...');
        
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (!isMounted) return;
        
        console.log('User found:', user?.email);
        
        if (error) {
          console.error('Auth error:', error);
          setLoading(false);
          setAuthChecked(true);
          return;
        }
        
        if (user) {
          setUser(user);
        }
        
        setLoading(false);
        setAuthChecked(true);
      } catch (error) {
        console.error('Error in checkAuth:', error);
        setLoading(false);
        setAuthChecked(true);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('Auth state change:', event, session?.user?.email);
        
        // Only reset admin status on SIGNED_OUT event
        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null);
          setIsAdmin(false);
          isAdminRef.current = false;
        } else if (session?.user) {
          setUser(session.user);
          // Preserve admin status if it was already set
          if (isAdminRef.current) {
            console.log('Preserving admin status for existing session');
            // Don't reset isAdmin here
          }
        }
        
        setLoading(false);
        setAuthChecked(true);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthSuccess = (adminStatus: boolean) => {
    console.log('Auth success, admin status:', adminStatus);
    setIsAdmin(adminStatus);
    isAdminRef.current = adminStatus;
    setAuthChecked(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    isAdminRef.current = false;
    setAuthChecked(false);
  };

  if (loading || !authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <AdminAuth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header with Logout */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-9xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold">PP</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Patient Pathway Admin</h1>
              <p className="text-sm text-slate-500">Management Portal - Logged in as {user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600">
              <span className="font-medium">Admin Access:</span> Management Only
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
      <EnhancedAdminDashboard />
    </div>
  );
}
