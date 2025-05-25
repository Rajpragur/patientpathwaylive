
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
import { SchedulePage } from '@/components/dashboard/SchedulePage';
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
      case 'company':
        return <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Company Settings</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Practice Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Practice Name</label>
                    <input className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter practice name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                    <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows={3} placeholder="Enter practice address"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                    <input className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter phone number" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Team Management</h3>
                <p className="text-slate-600 mb-4">Manage your team members and their access levels.</p>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  Add Team Member
                </button>
              </div>
            </div>
          </div>
        </div>;
      case 'lead-capture':
        return <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Lead Capture Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">📋</div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Quiz Integration</h3>
                <p className="text-slate-600 mb-4 text-sm">Embed medical assessments on your website to capture qualified leads.</p>
                <button 
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  onClick={() => setCurrentPage('quizzes')}
                >
                  Configure Quizzes
                </button>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Analytics Tracking</h3>
                <p className="text-slate-600 mb-4 text-sm">Track conversion rates and optimize your lead capture performance.</p>
                <button 
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                  onClick={() => setCurrentPage('analytics')}
                >
                  View Analytics
                </button>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Campaign Management</h3>
                <p className="text-slate-600 mb-4 text-sm">Create and manage targeted campaigns for specific conditions.</p>
                <button 
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm"
                  onClick={() => setCurrentPage('trends')}
                >
                  Manage Campaigns
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
      case 'schedule':
        return <SchedulePage />;
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
    <div className="flex h-screen bg-slate-50">
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
      <div className="min-h-screen h-screen bg-slate-50">
        <div className="h-full flex flex-col">
          <div className="border-b border-slate-200 bg-white">
            <div className="w-full mx-auto px-6 py-3 flex items-center justify-between">
              <button
                onClick={() => setSelectedQuiz(null)}
                className="text-blue-500 hover:text-blue-600 hover:underline transition-colors flex items-center gap-2"
              >
                ← Back to Assessments
              </button>
              <h1 className="text-lg font-semibold text-slate-700">
                {selectedQuiz.type} Assessment
              </h1>
            </div>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
          <h1 className="mt-4 text-xl font-bold text-blue-600">
            Patient Pathway
          </h1>
          <p className="mt-2 text-slate-600">Loading your medical assessment platform...</p>
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
