
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QuizType } from '@/types/quiz';
import { quizzes } from '@/data/quizzes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuizSelectorProps {
  onSelectQuiz: (quizType: QuizType, shareKey?: string) => void;
}

export function QuizSelector({ onSelectQuiz }: QuizSelectorProps) {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<string>('normal');
  
  useEffect(() => {
    const quizType = searchParams.get('type') as QuizType;
    const shareKey = searchParams.get('key');
    const doctorId = searchParams.get('doctor');
    const pageMode = searchParams.get('mode') || 'normal';
    
    setMode(pageMode);
    
    // If we have a specific quiz type from URL parameters, auto-select it
    if (quizType && quizzes && quizzes[quizType] && (shareKey || doctorId)) {
      onSelectQuiz(quizType, shareKey || undefined);
      return;
    }
  }, [searchParams, onSelectQuiz]);

  // Check if quizzes data is available
  if (!quizzes || typeof quizzes !== 'object') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12 flex items-center justify-center">
        <Card className="max-w-md shadow-2xl border-0">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-6">⚠️</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">Loading Error</h1>
            <p className="text-gray-600 leading-relaxed">
              Unable to load quiz data. Please refresh the page or contact support.
            </p>
            <Button 
              className="mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If in single mode but no valid quiz, show error
  if (mode === 'single' || mode === 'embed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12 flex items-center justify-center">
        <Card className="max-w-md shadow-2xl border-0">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-6">⚠️</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Quiz Link</h1>
            <p className="text-gray-600 leading-relaxed">
              This quiz link is not valid or has expired. Please contact your healthcare provider for a new assessment link.
            </p>
            <Button 
              className="mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105"
              onClick={() => window.location.href = '/quiz'}
            >
              View All Assessments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter valid quizzes
  const validQuizzes = Object.values(quizzes).filter(quiz => 
    quiz && 
    typeof quiz === 'object' && 
    quiz.id && 
    quiz.title && 
    quiz.description &&
    Array.isArray(quiz.questions)
  );

  if (validQuizzes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12 flex items-center justify-center">
        <Card className="max-w-md shadow-2xl border-0">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-6">📋</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">No Assessments Available</h1>
            <p className="text-gray-600 leading-relaxed">
              No medical assessments are currently available. Please check back later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
            Patient Pathway
          </h1>
          <p className="text-3xl text-gray-700 mb-6">ENT Medical Assessment Platform</p>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            Select a medical assessment below to begin your personalized health evaluation. 
            Each assessment is designed by healthcare professionals to provide accurate insights into your symptoms.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {validQuizzes.map((quiz, index) => (
            <Card 
              key={quiz.id} 
              className="hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 border-transparent hover:border-blue-300 transform hover:scale-105 bg-white overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
                <CardTitle className="text-2xl font-bold">{quiz.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-gray-600 mb-6 text-base leading-relaxed min-h-[60px]">{quiz.description}</p>
                <div className="flex items-center justify-between mb-8">
                  <div className="bg-gray-100 px-4 py-2 rounded-full">
                    <span className="text-sm text-gray-600 font-medium">{quiz.questions?.length || 0} questions</span>
                  </div>
                  <div className="bg-blue-100 px-4 py-2 rounded-full">
                    <span className="text-sm text-blue-600 font-medium">5-10 minutes</span>
                  </div>
                </div>
                <Button 
                  onClick={() => onSelectQuiz(quiz.id)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 text-white font-semibold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl"
                >
                  Start Assessment →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Why Choose Patient Pathway?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🏥</div>
                <h3 className="font-semibold text-gray-800 mb-2">Clinically Validated</h3>
                <p className="text-gray-600 text-sm">All assessments are based on established medical questionnaires used by healthcare professionals worldwide.</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="font-semibold text-gray-800 mb-2">Secure & Private</h3>
                <p className="text-gray-600 text-sm">Your health information is protected with enterprise-grade security and privacy measures.</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="font-semibold text-gray-800 mb-2">Instant Results</h3>
                <p className="text-gray-600 text-sm">Receive immediate, personalized results with detailed explanations and next steps.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
