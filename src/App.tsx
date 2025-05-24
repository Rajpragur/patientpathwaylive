
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
        return <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Company Settings</h2>
          <p className="text-gray-600">Manage your company information and team settings.</p>
        </div>;
      case 'lead-capture':
        return <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Lead Capture Tools</h2>
          <p className="text-gray-600">Configure your lead capture forms and conversion tracking.</p>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <button
              onClick={() => setSelectedQuiz(null)}
              className="text-blue-600 hover:underline transition-all duration-200 hover:scale-105"
            >
              ← Back to Quiz Selection
            </button>
          </div>
          <ChatBot quizType={selectedQuiz.type} shareKey={selectedQuiz.shareKey} />
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-600 mx-auto"></div>
          <h1 className="mt-6 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Patient Pathway
          </h1>
          <p className="mt-2 text-gray-600">Loading your medical assessment platform...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/quiz" element={<QuizApp />} />
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
