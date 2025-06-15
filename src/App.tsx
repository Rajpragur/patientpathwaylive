
import { Suspense } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PageLoader } from '@/components/ui/PageLoader';
import { AuthProvider } from '@/hooks/useAuth';
import Index from './pages/Index';
import AuthPage from './pages/AuthPage';
import PortalPage from './pages/PortalPage';
import CustomQuizPage from './pages/CustomQuizPage';
import UniversalQuizPage from './pages/UniversalQuizPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import NotFound from './pages/NotFound';
import { EmbeddedQuiz } from './routes/EmbeddedQuiz';
import { ShareQuizPage } from './components/dashboard/ShareQuizPage';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<PageLoader loading={true} />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/portal" element={<PortalPage />} />
                <Route path="/portal/share/:quizType" element={<ShareQuizPage />} />
                <Route path="/portal/share/custom/:customQuizId" element={<ShareQuizPage />} />
                <Route path="/custom-quiz/:customQuizId" element={<CustomQuizPage />} />
                <Route path="/quiz/:quizType" element={<UniversalQuizPage />} />
                <Route path="/embedded/:quizType" element={<EmbeddedQuiz />} />
                <Route path="/email-verification" element={<EmailVerificationPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
