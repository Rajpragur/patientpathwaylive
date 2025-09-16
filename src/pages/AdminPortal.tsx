import { useState, useEffect } from 'react';
import { AdminAuth } from '@/components/admin/AdminAuth';
import { EnhancedAdminDashboard } from '@/components/admin/EnhancedAdminDashboard';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'patientpathway@admin.com';

export default function AdminPortal() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authCompleted, setAuthCompleted] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email === ADMIN_EMAIL) {
        setUser(user);
        setAuthCompleted(true);
      }
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user && session.user.email === ADMIN_EMAIL) {
          setUser(session.user);
          setAuthCompleted(true);
        } else {
          setUser(null);
          setAuthCompleted(false);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = () => {
    // Force a re-check of the auth state
    setAuthCompleted(true);
    // Also trigger a manual auth check
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email === ADMIN_EMAIL) {
        setUser(user);
      }
    };
    checkAuth();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAuthCompleted(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  if (!user || !authCompleted) {
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
