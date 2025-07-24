import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatedSidebar } from '@/components/dashboard/AnimatedSidebar';
import { QuizManagementPage } from '@/components/dashboard/QuizManagementPage';
import { TrendsPage } from '@/components/dashboard/TrendsPage';
import { LeadsPage } from '@/components/dashboard/LeadsPage';
import { SchedulePage } from '@/components/dashboard/SchedulePage';
import { ProfilePage } from '@/components/dashboard/ProfilePage';
import { ConfigurationPage } from '@/components/dashboard/ConfigurationPage';
import { SettingsPage } from '@/components/dashboard/SettingsPage';
import { SupportPage } from '@/components/dashboard/SupportPage';
import { AIChatAgent } from '@/components/dashboard/AIChatAgent';
import { SocialIntegrationsPage } from '@/components/dashboard/SocialIntegrationsPage';
import { AutomationPage } from '@/components/dashboard/AutomationPage';
import { MarketingRecommendations } from '@/components/dashboard/MarketingRecommendations';
import { SymptomChecker } from '@/components/dashboard/SymptomChecker';
import { IntegrationsPage } from '@/components/dashboard/IntegrationsPage';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { PageLoader } from '@/components/ui/PageLoader';
import { AnimatePresence, motion } from 'framer-motion';
import { ContactsPage } from '@/components/dashboard/ContactsPage';
import SocialMediaCreator from '@/components/dashboard/SocialMediaCreator';

export default function PortalPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [tabLoading, setTabLoading] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Check for tab parameter in URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setCurrentPage(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    // Only check auth once loading is complete and we haven't checked before
    if (!loading && !hasCheckedAuth) {
      setHasCheckedAuth(true);
      if (!user) {
        console.log('No user found, redirecting to auth');
        navigate('/auth', { replace: true });
      }
    }
  }, [user, loading, navigate, hasCheckedAuth]);

  const handleSignOut = async () => {
    try {
      console.log('Starting sign out process...');
      await signOut();
      console.log('Sign out completed successfully');
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  // Helper for main menu tab changes
  const handleTabChange = (page: string) => {
    setTabLoading(true);
    setCurrentPage(page);
  };

  // Set tabLoading to false after the page content is loaded
  useEffect(() => {
    if (!tabLoading) return;
    // Wait for the next tick to ensure renderCurrentPage is mounted
    const timeout = setTimeout(() => setTabLoading(false), 100);
    return () => clearTimeout(timeout);
  }, [currentPage, tabLoading]);

  // Show loader overlay if loading or tabLoading
  if (loading || !hasCheckedAuth) {
    return <PageLoader loading={true} />;
  }

  // Don't render anything if no user (will redirect)
  if (!user) {
    return null;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <LeadsPage />;
      case 'analytics':
        return <TrendsPage />;
      case 'trends':
        return <TrendsPage />;
      case 'quizzes':
        return <QuizManagementPage />;
      case 'share':
        return <SocialIntegrationsPage />;
      case 'social-media':
        return <SocialMediaCreator />;
      case 'schedule':
        return <SchedulePage />;
      case 'social':
        return <SocialIntegrationsPage />;
      case 'automation':
        return <AutomationPage />;
      case 'marketing':
        return <MarketingRecommendations />;
      case 'symptom-checker':
        return <SymptomChecker />;
      case 'integrations':
        return <IntegrationsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'configuration':
        return <ConfigurationPage />;
      case 'settings':
        return <SettingsPage />;
      case 'support':
        return <SupportPage />;
      case 'contacts':
        return <ContactsPage />;
      default:
        return <LeadsPage />;
    }
  };

  // Define theme colors to match the quiz components
  const teal = '#0f766e';

  return (
    <div className="flex h-screen bg-gray-50">
      <AnimatedSidebar
        currentPage={currentPage}
        onPageChange={handleTabChange}
        onSignOut={handleSignOut}
      />
      <main className="flex-1 overflow-auto relative bg-gradient-to-br from-[#fef7f0] via-[#f8fafc] to-[#f0f4f9]">
        <DashboardHeader />
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="min-h-[calc(100vh-120px)]"
            >
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 bg-white px-6 py-4">
                  <h1 className="text-xl font-bold" style={{ color: teal }}>
                    {currentPage === 'dashboard' && 'Dashboard'}
                    {(currentPage === 'analytics' || currentPage === 'trends') && 'Analytics & Trends'}
                    {currentPage === 'quizzes' && 'Assessments'}
                    {currentPage === 'schedule' && 'Schedule'}
                    {currentPage === 'social' && 'Social Integrations'}
                    {currentPage === 'automation' && 'Automation'}
                    {currentPage === 'marketing' && 'Marketing Recommendations'}
                    {currentPage === 'symptom-checker' && 'Symptom Checker'}
                    {currentPage === 'integrations' && 'Integrations'}
                    {currentPage === 'profile' && 'Profile'}
                    {currentPage === 'configuration' && 'Configuration'}
                    {currentPage === 'settings' && 'Settings'}
                    {currentPage === 'support' && 'Support'}
                    {currentPage === 'contacts' && 'Contacts'}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {currentPage === 'dashboard' && 'Overview of your leads and recent activity'}
                    {(currentPage === 'analytics' || currentPage === 'trends') && 'Performance metrics, insights, and data trends'}
                    {currentPage === 'quizzes' && 'Manage your assessments and quizzes'}
                    {currentPage === 'schedule' && 'View and manage your appointments'}
                    {currentPage === 'social' && 'Connect and manage your social media accounts'}
                    {currentPage === 'automation' && 'Create and manage automated communications'}
                    {currentPage === 'marketing' && 'Daily content ideas and marketing strategies'}
                    {currentPage === 'symptom-checker' && 'Conversational assessment tool'}
                    {currentPage === 'integrations' && 'Connect with other services and platforms'}
                    {currentPage === 'profile' && 'Manage your account information'}
                    {currentPage === 'configuration' && 'Manage your clinic information and settings'}
                    {currentPage === 'settings' && 'Configure your preferences'}
                    {currentPage === 'support' && 'Get help and support'}
                    {currentPage === 'contacts' && 'Manage your contacts'}
                  </p>
                </div>
                <div className="p-6">
                  {renderCurrentPage()}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* AI Chat Agent */}
        <AIChatAgent />
      </main>
    </div>
  );
}