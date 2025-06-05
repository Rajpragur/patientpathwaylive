
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

function App() {
  return (
    <Router>
      <AuthProvider>
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
            
            {/* Universal quiz routes */}
            <Route path="/quiz/:quizType" element={<UniversalQuizPage />} />
            <Route path="/quiz/custom/:customQuizId" element={<CustomQuizPage />} />
            
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
  const shareKey: string | undefined = params.shareKey;
  const navigate = useNavigate();

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
          .select('quiz_type, doctor_id, lead_source, incident_source')
          .eq('share_key', shareKey)
          .single();

        if (leadData && !leadError) {
          const doctorParam = leadData.doctor_id ? `&doctor=${leadData.doctor_id}` : '';
          const sourceParams = leadData.lead_source ? `&source=${leadData.lead_source}` : '';
          const incidentParams = leadData.incident_source ? `&campaign=${leadData.incident_source}` : '';
          
          if (leadData.quiz_type?.startsWith('custom_')) {
            const customQuizId = leadData.quiz_type.replace('custom_', '');
            navigate(`/quiz/custom/${customQuizId}?key=${shareKey}${doctorParam}${sourceParams}${incidentParams}`, { replace: true });
          } else if (leadData.quiz_type) {
            navigate(`/quiz/${leadData.quiz_type.toLowerCase()}?key=${shareKey}${doctorParam}${sourceParams}${incidentParams}`, { replace: true });
          }
          return;
        }

        // If not found in quiz_leads, try custom_quizzes
        const { data: customData, error: customError } = await supabase
          .from('custom_quizzes')
          .select('id, doctor_id')
          .eq('share_key', shareKey)
          .single();

        if (customData?.id && !customError) {
          const doctorParam = customData.doctor_id ? `&doctor=${customData.doctor_id}` : '';
          navigate(`/quiz/custom/${customData.id}?key=${shareKey}${doctorParam}`, { replace: true });
          return;
        }

        // If nothing found, redirect to home
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Error resolving share key:', error);
        navigate('/', { replace: true });
      }
    }
    
    resolveShareKey();
  }, [shareKey, navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f7904f] mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Redirecting to your assessment...</p>
      </div>
    </div>
  );
}

export default App;
