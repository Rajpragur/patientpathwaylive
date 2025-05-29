
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { CollapsibleSidebar } from '@/components/dashboard/CollapsibleSidebar';
import { QuizManagementPage } from '@/components/dashboard/QuizManagementPage';
import { AnalyticsPage } from '@/components/dashboard/AnalyticsPage';
import { TrendsPage } from '@/components/dashboard/TrendsPage';
import { LeadsPage } from '@/components/dashboard/LeadsPage';
import { SchedulePage } from '@/components/dashboard/SchedulePage';
import { ProfilePage } from '@/components/dashboard/ProfilePage';
import { SettingsPage } from '@/components/dashboard/SettingsPage';
import { SupportPage } from '@/components/dashboard/SupportPage';
import { toast } from 'sonner';

export default function PortalPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
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
      <CollapsibleSidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        onSignOut={handleSignOut}
      />
      <main className="flex-1 overflow-auto">
        {renderCurrentPage()}
      </main>
    </div>
  );
}
