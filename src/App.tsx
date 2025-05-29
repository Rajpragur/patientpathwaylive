
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
            <Route path="/quiz/snot22" element={<SNOT22Page />} />
            <Route path="/quiz/nose" element={<NOSEPage />} />
            <Route path="/quiz/hhia" element={<HHIAPage />} />
            <Route path="/quiz/epworth" element={<EpworthPage />} />
            <Route path="/quiz/dhi" element={<DHIPage />} />
            <Route path="/quiz/stop" element={<STOPPage />} />
            <Route path="/quiz/tnss" element={<TNSSPage />} />
            
            {/* Embedded quiz routes */}
            <Route path="/embed/quiz/:quizType" element={<EmbeddedQuiz />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
