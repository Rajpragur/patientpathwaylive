
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
            
            {/* Quiz routes */}
            <Route path="/quiz/:quizType" element={<UniversalQuizPage />} />
            <Route path="/quiz/custom/:customQuizId" element={<CustomQuizPage />} />
            
            {/* Embedded quiz routes */}
            <Route path="/embed/quiz/:quizType" element={<UniversalQuizPage />} />
            <Route path="/embed/quiz/custom/:customQuizId" element={<CustomQuizPage />} />
            
            <Route path="/q/:shareKey" element={<ShortLinkRedirect />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

function ShortLinkRedirect() {
  const { shareKey } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    async function resolveShareKey() {
      if (!shareKey) {
        navigate('/', { replace: true });
        return;
      }

      console.log('Resolving share key:', shareKey);

      try {
        // Try to fetch from quiz_leads first
        const { data, error } = await supabase
          .from('quiz_leads')
          .select('quiz_type, doctor_id')
          .eq('share_key', shareKey)
          .limit(1)
          .single();
          
        console.log('Quiz leads lookup result:', { data, error });
          
        if (data && data.quiz_type) {
          const doctorParam = data.doctor_id ? `&doctor=${data.doctor_id}` : '';
          
          // Check if it's a custom quiz
          if (data.quiz_type.startsWith('custom_')) {
            const customQuizId = data.quiz_type.replace('custom_', '');
            navigate(`/quiz/custom/${customQuizId}?key=${shareKey}${doctorParam}`, { replace: true });
          } else {
            navigate(`/quiz/${data.quiz_type.toLowerCase()}?key=${shareKey}${doctorParam}`, { replace: true });
          }
          return;
        }
        
        // If not found in quiz_leads, try to fetch from custom_quizzes directly
        const { data: customData, error: customError } = await supabase
          .from('custom_quizzes')
          .select('id, doctor_id')
          .eq('id', shareKey.replace('custom_', ''))
          .single();
          
        console.log('Custom quiz lookup result:', { customData, customError });
          
        if (customData && customData.id) {
          const doctorParam = customData.doctor_id ? `&doctor=${customData.doctor_id}` : '';
          navigate(`/quiz/custom/${customData.id}?key=${shareKey}${doctorParam}`, { replace: true });
          return;
        }
        
        // Not found - redirect to home
        console.log('Share key not found, redirecting to home');
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Error resolving share key:', error);
        navigate('/', { replace: true });
      }
    }
    
    resolveShareKey();
  }, [shareKey, navigate]);
  
  return <div className="flex items-center justify-center h-screen text-lg">Redirecting...</div>;
}

export default App;
