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
import CardQuizPage from './pages/CardQuizPage';
import SocialAccountsPage from './pages/SocialAccountsPage';
import NotFound from './pages/NotFound';
import NoseLandingPage from './pages/NoseLandingPage';
import EditableNOSELandingPage from './pages/EditableNOSELandingPage';
import EmbeddedQuiz from './pages/EmbeddedQuiz';
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
              <Route path="/quiz/:quizId" element={<CardQuizPage />} />
              <Route path="/embed/quiz" element={<EmbeddedQuiz />} />
              <Route path="/social-accounts" element={<SocialAccountsPage />} />
              <Route path="/nose-editor/:doctorId" element={<NoseEditorPage />} />
              <Route path="/s/:shortId" element={<ShortLinkRedirect />} />
              <Route path="/embed/chatbot/:quizId" element={<EmbeddedChatbotPage />} />
              <Route path="/embed/custom/:quizId" element={<Embed />} />
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