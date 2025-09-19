import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatedSidebar } from '@/components/dashboard/AnimatedSidebar';
import { QuizManagementPage } from '@/components/dashboard/QuizManagementPage';
import { TrendsPage } from '@/components/dashboard/TrendsPage';
import { LeadsPage } from '@/components/dashboard/LeadsPage';
import { ProfilePage } from '@/components/dashboard/ProfilePage';
import { ConfigurationPage } from '@/components/dashboard/ConfigurationPage';
import { SettingsPage } from '@/components/dashboard/SettingsPage';
import { SupportPage } from '@/components/dashboard/SupportPage';
import { SocialIntegrationsPage } from '@/components/dashboard/SocialIntegrationsPage';
import { AutomationPage } from '@/components/dashboard/AutomationPage';
import { SymptomChecker } from '@/components/dashboard/SymptomChecker';
import { IntegrationsPage } from '@/components/dashboard/IntegrationsPage';
import { EmailConfigurationPage } from '@/components/dashboard/EmailConfigurationPage';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { PageLoader } from '@/components/ui/PageLoader';
import { AnimatePresence, motion } from 'framer-motion';
import SocialMediaCreator from '@/components/dashboard/SocialMediaCreator';
import { supabase } from '@/integrations/supabase/client';

export default function PortalPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [tabLoading, setTabLoading] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [accessLoading, setAccessLoading] = useState(true);
  const [accessRevoked, setAccessRevoked] = useState(false);

  // Check for tab parameter in URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setCurrentPage(tab);
    }
  }, [searchParams]);

  // Check doctor access control
  const checkDoctorAccess = async (userId: string) => {
    try {
      setAccessLoading(true);
      console.log('Checking access for user:', userId);
      
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select('id, access_control, first_name, last_name, email')
        .eq('user_id', userId);

      if (error) {
        console.error('Error checking doctor access:', error);
        console.error('Error details:', error.message, error.code);
        
        // If doctor profile doesn't exist or there's an error, deny access
        setHasAccess(false);
        setAccessRevoked(true);
        await signOut();
        return;
      }

      console.log('Doctor profiles found:', data);

      // Check if any doctor profile has access_control = true
      if (!data || data.length === 0) {
        console.log('No doctor profiles found for user');
        setHasAccess(false);
        setAccessRevoked(true);
        await signOut();
        return;
      }

      // Check if ANY profile has access_control = true (user should have access)
      // OR if ALL profiles have access_control = false (user should be denied)
      const profilesWithAccess = data.filter(profile => profile.access_control === true);
      const profilesWithoutAccess = data.filter(profile => profile.access_control === false);
      
      console.log('🔍 Access check results:');
      console.log('- Total profiles found:', data.length);
      console.log('- Profiles with access (true):', profilesWithAccess.length);
      console.log('- Profiles without access (false):', profilesWithoutAccess.length);
      console.log('- All profiles access_control values:', data.map(p => ({ 
        id: p.id, 
        access_control: p.access_control, 
        name: `${p.first_name} ${p.last_name}` 
      })));
      
      // Grant access if ANY profile has access_control = true
      if (profilesWithAccess.length > 0) {
        const profileWithAccess = profilesWithAccess[0];
        console.log('✅ Access granted successfully!');
        console.log('Doctor:', profileWithAccess.first_name, profileWithAccess.last_name);
        console.log('Access control value:', profileWithAccess.access_control);
        console.log('Setting hasAccess to TRUE');
        setHasAccess(true);
      } else {
        console.log('❌ Access denied. No profile with access_control = true found');
        console.log('All profiles have access_control = false or null');
        console.log('Setting hasAccess to FALSE and accessRevoked to TRUE');
        setHasAccess(false);
        setAccessRevoked(true);
        toast.error('You do not have access to the portal');
        await signOut();
      }
    } catch (error) {
      console.error('Error checking doctor access:', error);
      setHasAccess(false);
      setAccessRevoked(true);
      toast.error('You do not have access to the portal');
      await signOut();
    } finally {
      setAccessLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !hasCheckedAuth) {
      setHasCheckedAuth(true);
      if (!user) {
        console.log('No user found, redirecting to auth');
        navigate('/auth', { replace: true });
      } else {
        // Check doctor access control when user is authenticated
        checkDoctorAccess(user.id);
      }
    }
  }, [user, loading, navigate, hasCheckedAuth]);

  // Periodic access check (every 5 minutes)
  useEffect(() => {
    if (!user || !hasAccess || accessRevoked) return;

    const interval = setInterval(async () => {
      console.log('Performing periodic access check...');
      await checkDoctorAccess(user.id);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user, hasAccess, accessRevoked]);

  // Check access when user focuses back on the tab
  useEffect(() => {
    if (!user || !hasAccess || accessRevoked) return;

    const handleFocus = async () => {
      console.log('Window focused, checking access...');
      await checkDoctorAccess(user.id);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, hasAccess, accessRevoked]);

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

  // Show access revoked page
  if (accessRevoked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You do not have access to the portal. Please contact your administrator to request access.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/auth')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Return to Login
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loader overlay if loading, checking auth, or checking access
  if (loading || !hasCheckedAuth || accessLoading || hasAccess === null) {
    return <PageLoader loading={true} />;
  }

  // Debug logging for access state
  console.log('Render check - User:', !!user, 'HasAccess:', hasAccess, 'AccessRevoked:', accessRevoked);

  // Deny access if no user, no access, or access revoked
  if (!user || hasAccess !== true || accessRevoked) {
    console.log('Access denied in render - User:', !!user, 'HasAccess:', hasAccess, 'AccessRevoked:', accessRevoked);
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
      case 'automation':
        return <AutomationPage />;
      case 'integrations':
        return <IntegrationsPage />;
      case 'email-config':
        return <EmailConfigurationPage />;
      case 'profile':
        return <ProfilePage />;
      case 'configuration':
        return <ConfigurationPage />;
      case 'settings':
        return <SettingsPage />;
      case 'support':
        return <SupportPage />;
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
                    {currentPage === 'email' && 'Email Automation'}
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
                    {currentPage === 'email' && 'Connect email accounts and send quiz invitations'}
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
      </main>
    </div>
  );
}