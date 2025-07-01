
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import AuthPage from './pages/AuthPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import PortalPage from './pages/PortalPage';
import UniversalQuizPage from './pages/UniversalQuizPage';
import CustomQuizPage from './pages/CustomQuizPage';
import SocialAccountsPage from './pages/SocialAccountsPage';
import NotFound from './pages/NotFound';
import NoseLandingPage from './pages/NoseLandingPage';
import EditableNOSELandingPage from './pages/EditableNOSELandingPage';
import EmbeddedQuiz from './pages/EmbeddedQuiz';
import { NOSEPage } from './components/quiz/NOSEPage';
import { DHIPage } from './pages/quizzes/DHIPage';
import { EpworthPage } from './pages/quizzes/EpworthPage';
import { HHIAPage } from './pages/quizzes/HHIAPage';
import { SNOT22Page } from './pages/quizzes/SNOT22Page';
import { STOPPage } from './pages/quizzes/STOPPage';
import { TNSSPage } from './pages/quizzes/TNSSPage';
import NOSELandingPage from './pages/share/NOSELandingPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route path="/portal/*" element={<PortalPage />} />
            <Route path="/quiz" element={<UniversalQuizPage />} />
            <Route path="/quiz/custom/:quizId" element={<CustomQuizPage />} />
            <Route path="/quiz/nose" element={<NOSEPage />} />
            <Route path="/quiz/dhi" element={<DHIPage />} />
            <Route path="/quiz/epworth" element={<EpworthPage />} />
            <Route path="/quiz/hhia" element={<HHIAPage />} />
            <Route path="/quiz/snot22" element={<SNOT22Page />} />
            <Route path="/quiz/stop" element={<STOPPage />} />
            <Route path="/quiz/tnss" element={<TNSSPage />} />
            <Route path="/embed/quiz" element={<EmbeddedQuiz />} />
            <Route path="/social-accounts" element={<SocialAccountsPage />} />
            <Route path="/nose/:doctorId?" element={<NoseLandingPage />} />
            <Route path="/nose-editor/:doctorId?" element={<EditableNOSELandingPage />} />
            <Route path="/share/nose/:doctorId?" element={<NOSELandingPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
