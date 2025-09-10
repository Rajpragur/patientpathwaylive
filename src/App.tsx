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
import  DHIPage  from './pages/quizzes/DHIPage';
import EpworthPage  from './pages/quizzes/EpworthPage';
import HHIAPage  from './pages/quizzes/HHIAPage';
import SNOT22Page from './pages/quizzes/SNOT22Page';
import STOPPage from './pages/quizzes/STOPPage';
import TNSSPage from './pages/quizzes/TNSSPage';
import NOSELandingPage from './pages/share/NOSELandingPage';
import SNOTLandingPage from './pages/share/SNOT12LandingPage';
import { AuthProvider } from '@/hooks/useAuth';
import NoseEditorPage from './pages/NoseEditorPage';
import ShareQuizPage from './pages/ShareQuizPage';
import ShortLinkRedirect from './pages/ShortLinkRedirect';
import EmbeddedChatbotPage from './pages/EmbeddedChatbotPage';
import Embed from './pages/Embed';
import Snot12LandingPage from './pages/SNOT12LandingPage';
import Snot22LandingPage from './pages/share/SNOT22LandingPage';
import TNSSLandingPage from './pages/share/TNSSLandingPage';
import AdminPortal from './pages/AdminPortal';
import GmailCallback from './pages/GmailCallback';
import OutlookCallback from './pages/OutlookCallback';
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin-portal" element={<AdminPortal />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/verify-email" element={<EmailVerificationPage />} />
              <Route path="/nose/:doctorId?" element={<NoseLandingPage />} />
              <Route path="/share/nose/:doctorId?" element={<NOSELandingPage />} />
              <Route path="/share/snot12/:doctorId?" element={<SNOTLandingPage/>}/>
              <Route path="/share/snot22/:doctorId?" element={<Snot22LandingPage/>}/>
              <Route path="/share/tnss/:doctorId?" element={<TNSSLandingPage/>}/>
              <Route path="/share/:quizType/:doctorId?" element={<ShareQuizPage />} />
              <Route path="/portal/*" element={<PortalPage />} />
              <Route path="/portal/share/:quizId" element={<ShareQuizPage />} />
              <Route path="/portal/share/custom/:customQuizId" element={<ShareQuizPage />} />
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
              <Route path="/nose-editor/:doctorId" element={<NoseEditorPage />} />
              <Route path="/s/:shortId" element={<ShortLinkRedirect />} />
              <Route path="/auth/gmail/callback" element={<GmailCallback />} />
              <Route path="/auth/outlook/callback" element={<OutlookCallback />} />
              <Route path="/embed/chatbot/:quizId" element={<EmbeddedChatbotPage />} />
              <Route path="/embed/:quizId" element={<Embed />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;