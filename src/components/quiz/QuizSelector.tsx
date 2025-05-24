
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
    const pageMode = searchParams.get('mode') || 'normal';
    
    setMode(pageMode);
    
    // If we have a specific quiz type from URL parameters, auto-select it
    if (quizType && quizzes[quizType] && shareKey) {
      onSelectQuiz(quizType, shareKey);
      return;
    }
  }, [searchParams, onSelectQuiz]);

  // If in single mode but no valid quiz, show error
  if (mode === 'single' || mode === 'embed') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h1 className="text-xl font-bold text-red-600 mb-4">Invalid Quiz Link</h1>
            <p className="text-gray-600">This quiz link is not valid or has expired.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Patient Pathway
          </h1>
          <p className="text-2xl text-gray-700 mb-4">ENT Medical Assessment Platform</p>
          <p className="text-gray-600 text-lg">Select an assessment to begin your health evaluation</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.values(quizzes).map((quiz) => (
            <Card 
              key={quiz.id} 
              className="hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-300 transform hover:scale-105 bg-white"
            >
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="text-xl">{quiz.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">{quiz.description}</p>
                <p className="text-xs text-gray-500 mb-6 bg-gray-100 px-3 py-1 rounded-full inline-block">
                  {quiz.questions.length} questions • 5-10 minutes
                </p>
                <Button 
                  onClick={() => onSelectQuiz(quiz.id)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 text-white font-semibold py-3"
                >
                  Start Assessment
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
