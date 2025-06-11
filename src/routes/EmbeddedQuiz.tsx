import { useParams, useSearchParams } from 'react-router-dom';
import { EmbeddedChatBot } from '@/components/quiz/EmbeddedChatBot';
import { QuizType } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { quizzes } from '@/data/quizzes';

export function EmbeddedQuiz() {
  const { quizType } = useParams<{ quizType: QuizType }>();
  const [searchParams] = useSearchParams();
  const shareKey = searchParams.get('key');
  const doctorId = searchParams.get('doctor');
  const mode = searchParams.get('mode') || 'standard';
  const [quizData, setQuizData] = useState<any>(null);

  useEffect(() => {
    const fetchCustomQuiz = async () => {
      if (!quizType) return;

      // Only fetch for custom quizzes
      if (quizType.startsWith('custom_')) {
        const customQuizId = quizType.replace('custom_', '');
        const { data, error } = await supabase
          .from('custom_quizzes')
          .select('*')
          .eq('id', customQuizId)
          .single();
        
        if (!error && data) {
          // Transform custom quiz data to match expected format
          setQuizData({
            id: data.id,
            title: data.title,
            description: data.description,
            questions: data.questions,
            maxScore: data.max_score,
            scoring: data.scoring,
            isCustom: true
          });
        }
      } else {
        // For standard quizzes, use the data from quizzes object
        const standardQuiz = quizzes[quizType as keyof typeof quizzes];
        if (standardQuiz) {
          setQuizData({
            id: standardQuiz.id,
            title: standardQuiz.title,
            description: standardQuiz.description,
            questions: standardQuiz.questions,
            maxScore: standardQuiz.maxScore,
            isCustom: false
          });
        }
      }
    };

    fetchCustomQuiz();
  }, [quizType]);

  if (!quizType) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Quiz</h1>
          <p className="text-gray-600 mb-4">The requested quiz could not be found.</p>
          <Button onClick={() => window.location.href = '/'}>
            <Home className="w-4 h-4 mr-2" />
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  const isFullPage = mode === 'fullpage';
  const isCustomQuiz = quizType.startsWith('custom_');

  // Get the appropriate quiz title
  const quizTitle = isCustomQuiz 
    ? (quizData?.title || 'Loading...')
    : quizzes[quizType]?.title || `${quizType.toUpperCase()} Assessment`;

  return (
    <div className={`min-h-screen ${isFullPage ? 'bg-gray-50' : 'bg-transparent'}`}>
      {isFullPage && (
        <div className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">
              {quizTitle}
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
        </div>
      )}
      <div className="flex-1">
        {quizData && (
          <EmbeddedChatBot 
            quizType={quizType}
            quizData={quizData}
            shareKey={shareKey || undefined}
            doctorId={doctorId || undefined}
          />
        )}
      </div>
    </div>
  );
}
