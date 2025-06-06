
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import AuthPage from './pages/AuthPage';
import Index from './pages/Index';
import PortalPage from './pages/PortalPage';
import SNOT22Page from './pages/quizzes/SNOT22Page';
import NOSEPage from './pages/quizzes/NOSEPage';
import HHIAPage from './pages/quizzes/HHIAPage';
import EpworthPage from './pages/quizzes/EpworthPage';
import DHIPage from './pages/quizzes/DHIPage';
import STOPPage from './pages/quizzes/STOPPage';
import TNSSPage from './pages/quizzes/TNSSPage';
import EmbeddedQuiz from './pages/EmbeddedQuiz';
import NotFound from './pages/NotFound';
import EmailVerificationPage from './pages/EmailVerificationPage';
import { CustomQuizCreator } from './components/dashboard/CustomQuizCreator';
import { ShareQuizPage } from './components/dashboard/ShareQuizPage';
import { EmbeddedQuiz as EmbeddedQuizRoute } from './routes/EmbeddedQuiz';
import { supabase } from './integrations/supabase/client';
import UniversalQuizPage from './pages/UniversalQuizPage';
import CustomQuizPage from './pages/CustomQuizPage';
import { PageLoader } from './components/ui/PageLoader';

function App() {
  return (
    <Router>
      <AuthProvider>
        <PageLoader />
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route path="/portal" element={<PortalPage />} />
            <Route path="/portal/create-quiz" element={<CustomQuizCreator />} />
            <Route path="/portal/edit-quiz/:id" element={<CustomQuizCreator />} />
            <Route path="/portal/share/:quizType" element={<ShareQuizPage />} />
            <Route path="/portal/share/custom/:customQuizId" element={<ShareQuizPage />} />
            
            {/* Quiz routes */}
            <Route path="/quiz/:quizType" element={<UniversalQuizPage />} />
            <Route path="/quiz/custom/:customQuizId" element={<CustomQuizPage />} />
            
            {/* Legacy quiz routes - redirect to new format */}
            <Route path="/quiz" element={<UniversalQuizPage />} />
            
            {/* Embedded quiz routes */}
            <Route path="/embed/quiz/:quizType" element={<UniversalQuizPage />} />
            <Route path="/embed/quiz/custom/:customQuizId" element={<CustomQuizPage />} />
            
            {/* Short link redirect */}
            <Route path="/q/:shareKey" element={<ShortLinkRedirect />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

function ShortLinkRedirect() {
  const params = useParams();
  const navigate = useNavigate();
  const shareKey = params.shareKey;

  useEffect(() => {
    async function resolveShareKey() {
      if (!shareKey) {
        navigate('/', { replace: true });
        return;
      }

      try {
        // First try to find in quiz_leads
        const { data: leadData, error: leadError } = await supabase
          .from('quiz_leads')
          .select('quiz_type, custom_quiz_id, doctor_id')
          .eq('share_key', shareKey)
          .maybeSingle();

        if (!leadError && leadData) {
          const doctorParam = leadData.doctor_id ? `&doctor=${leadData.doctor_id}` : '';
          if (leadData.custom_quiz_id) {
            navigate(`/quiz/custom/${leadData.custom_quiz_id}?key=${shareKey}${doctorParam}`, { replace: true });
          } else if (leadData.quiz_type) {
            navigate(`/quiz/${leadData.quiz_type.toLowerCase()}?key=${shareKey}${doctorParam}`, { replace: true });
          }
          return;
        }

        // If not found in quiz_leads, try custom_quizzes
        const { data: customData, error: customError } = await supabase
          .from('custom_quizzes')
          .select('id, doctor_id')
          .eq('share_key', shareKey)
          .maybeSingle();

        if (!customError && customData?.id) {
          const doctorParam = customData.doctor_id ? `&doctor=${customData.doctor_id}` : '';
          navigate(`/quiz/custom/${customData.id}?key=${shareKey}${doctorParam}`, { replace: true });
          return;
        }

        // If still not found, try direct ID lookup for custom quizzes
        if (shareKey.startsWith('custom_')) {
          const customQuizId = shareKey.replace('custom_', '');
          const { data: directCustomData, error: directError } = await supabase
            .from('custom_quizzes')
            .select('id, doctor_id')
            .eq('id', customQuizId)
            .maybeSingle();

          if (!directError && directCustomData?.id) {
            const doctorParam = directCustomData.doctor_id ? `&doctor=${directCustomData.doctor_id}` : '';
            navigate(`/quiz/custom/${directCustomData.id}?key=${shareKey}${doctorParam}`, { replace: true });
            return;
          }
        }

        // If nothing found, redirect to home
        console.log('Share key not found, redirecting to home');
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Error resolving share key:', error);
        navigate('/', { replace: true });
      }
    }
    
    resolveShareKey();
  }, [shareKey, navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f7904f] mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Redirecting to your assessment...</p>
      </div>
    </div>
  );
}

export default App;
