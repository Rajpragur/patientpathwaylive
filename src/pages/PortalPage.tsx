import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { AnimatedSidebar } from '@/components/dashboard/AnimatedSidebar';
import { QuizManagementPage } from '@/components/dashboard/QuizManagementPage';
import { AnalyticsPage } from '@/components/dashboard/AnalyticsPage';
import { TrendsPage } from '@/components/dashboard/TrendsPage';
import { LeadsPage } from '@/components/dashboard/LeadsPage';
import { SchedulePage } from '@/components/dashboard/SchedulePage';
import { ProfilePage } from '@/components/dashboard/ProfilePage';
import { SettingsPage } from '@/components/dashboard/SettingsPage';
import { SupportPage } from '@/components/dashboard/SupportPage';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { PageLoader } from '@/components/ui/PageLoader';
import { AnimatePresence, motion } from 'framer-motion';

export default function PortalPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [tabLoading, setTabLoading] = useState(false);
  const tabTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    try {
      console.log('Starting sign out process...');
      await signOut();
      console.log('Sign out completed successfully');
      toast.success('Signed out successfully');
      navigate('/auth');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  // Helper for main menu tab changes
  const handleTabChange = (page: string) => {
    setTabLoading(true);
    setCurrentPage(page);
    if (tabTimeoutRef.current) clearTimeout(tabTimeoutRef.current);
    tabTimeoutRef.current = setTimeout(() => setTabLoading(false), 1200);
  };

  if (loading) {
    return <PageLoader />;
  }

  if (tabLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return null;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <LeadsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'trends':
        return <TrendsPage />;
      case 'quizzes':
        return <QuizManagementPage />;
      case 'schedule':
        return <SchedulePage />;
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
      case 'support':
        return <SupportPage />;
      default:
        return <LeadsPage />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AnimatedSidebar
        currentPage={currentPage}
        onPageChange={handleTabChange}
        onSignOut={handleSignOut}
      />
      <main className="flex-1 overflow-auto relative bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#f0f4fa]">
        <DashboardHeader />
        {tabLoading && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="drop-shadow-2xl">
              <PageLoader />
            </div>
          </div>
        )}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              className="min-h-[calc(100vh-120px)]"
            >
              {renderCurrentPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
