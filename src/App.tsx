
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { AuthPage } from '@/components/auth/AuthPage';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopTabs } from '@/components/dashboard/TopTabs';
import { LeadsPage } from '@/components/dashboard/LeadsPage';
import { AnalyticsPage } from '@/components/dashboard/AnalyticsPage';
import { TrendsPage } from '@/components/dashboard/TrendsPage';
import { QuizManagementPage } from '@/components/dashboard/QuizManagementPage';
import { SettingsPage } from '@/components/dashboard/SettingsPage';
import { SupportPage } from '@/components/dashboard/SupportPage';
import { ProfilePage } from '@/components/dashboard/ProfilePage';
import { QuizSelector } from '@/components/quiz/QuizSelector';
import { ChatBot } from '@/components/quiz/ChatBot';
import { SNOT22Page } from '@/components/quiz/SNOT22Page';
import { NOSEPage } from '@/components/quiz/NOSEPage';
import { HHIAPage } from '@/components/quiz/HHIAPage';
import { EpworthPage } from '@/components/quiz/EpworthPage';
import { DHIPage } from '@/components/quiz/DHIPage';
import { STOPPage } from '@/components/quiz/STOPPage';
import { TNSSPage } from '@/components/quiz/TNSSPage';
import { QuizType } from '@/types/quiz';

const queryClient = new QueryClient();

function DoctorPortal() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentTab, setCurrentTab] = useState('leads');

  const renderTabContent = () => {
    switch (currentTab) {
      case 'leads':
        return <LeadsPage />;
      case 'contact':
        return <LeadsPage filterStatus="CONTACTED" />;
      case 'company':
        return <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Company Settings</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Practice Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Practice Name</label>
                    <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Enter practice name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Enter practice address"></textarea>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Team Management</h3>
                <p className="text-gray-600 mb-4">Manage your team members and their access levels.</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Add Team Member
                </button>
              </div>
            </div>
          </div>
        </div>;
      case 'lead-capture':
        return <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Lead Capture Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg border border-blue-200">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Quiz Integration</h3>
                <p className="text-gray-600 mb-4">Embed medical assessments on your website to capture qualified leads.</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105">
                  Configure Quizzes
                </button>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-lg border border-green-200">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Analytics Tracking</h3>
                <p className="text-gray-600 mb-4">Track conversion rates and optimize your lead capture performance.</p>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 hover:scale-105">
                  View Analytics
                </button>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-lg border border-purple-200">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Targeted Campaigns</h3>
                <p className="text-gray-600 mb-4">Create targeted campaigns for specific conditions and demographics.</p>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all duration-200 hover:scale-105">
                  Create Campaign
                </button>
              </div>
            </div>
          </div>
        </div>;
      default:
        return <LeadsPage />;
    }
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div>
            <TopTabs currentTab={currentTab} onTabChange={setCurrentTab} />
            {renderTabContent()}
          </div>
        );
      case 'analytics':
        return <AnalyticsPage />;
      case 'trends':
        return <TrendsPage />;
      case 'quizzes':
        return <QuizManagementPage />;
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
      case 'support':
        return <SupportPage />;
      default:
        return (
          <div>
            <TopTabs currentTab={currentTab} onTabChange={setCurrentTab} />
            {renderTabContent()}
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          {renderPageContent()}
        </main>
      </div>
    </div>
  );
}

function QuizApp() {
  const [selectedQuiz, setSelectedQuiz] = useState<{ type: QuizType; shareKey?: string } | null>(null);

  const handleSelectQuiz = (quizType: QuizType, shareKey?: string) => {
    setSelectedQuiz({ type: quizType, shareKey });
  };

  if (selectedQuiz) {
    return (
      <div className="min-h-screen h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="h-full flex flex-col">
          <div className="border-b border-gray-700 bg-gray-800/80 backdrop-blur-sm">
            <div className="w-full mx-auto px-8 py-3 flex items-center justify-between">
              <button
                onClick={() => setSelectedQuiz(null)}
                className="text-blue-400 hover:text-blue-300 hover:underline transition-all duration-200 hover:scale-105 flex items-center gap-2"
              >
                ← Back to Assessments
              </button>
              <h1 className="text-lg font-semibold text-gray-200">
                {selectedQuiz.type} Assessment
              </h1>
            </div>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="flex-1 h-[calc(100vh-4rem)]">
              <ChatBot quizType={selectedQuiz.type} shareKey={selectedQuiz.shareKey} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <QuizSelector onSelectQuiz={handleSelectQuiz} />;
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-400 mx-auto"></div>
          <h1 className="mt-6 text-2xl font-bold bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
            Patient Pathway
          </h1>
          <p className="mt-2 text-gray-400">Loading your medical assessment platform...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter basename="">
      <Routes>
        <Route path="/quiz" element={<QuizApp />} />
        <Route path="/quiz/snot22" element={<SNOT22Page />} />
        <Route path="/quiz/nose" element={<NOSEPage />} />
        <Route path="/quiz/hhia" element={<HHIAPage />} />
        <Route path="/quiz/epworth" element={<EpworthPage />} />
        <Route path="/quiz/dhi" element={<DHIPage />} />
        <Route path="/quiz/stop" element={<STOPPage />} />
        <Route path="/quiz/tnss" element={<TNSSPage />} />
        <Route 
          path="/portal" 
          element={user ? <DoctorPortal /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/auth" 
          element={!user ? <AuthPage /> : <Navigate to="/portal" />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={user ? "/portal" : "/quiz"} />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
