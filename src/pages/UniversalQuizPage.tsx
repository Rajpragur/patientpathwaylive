import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { EmbeddedChatBot } from '@/components/quiz/EmbeddedChatBot';
import { quizzes } from '@/data/quizzes';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function UniversalQuizPage() {
  const { quizType } = useParams<{ quizType: string }>();
  const [searchParams] = useSearchParams();
  const shareKey = searchParams.get('key') || undefined;
  const doctorId = searchParams.get('doctor') || undefined;
  const [customQuiz, setCustomQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  let isCustom = quizType && quizType.startsWith('custom');

  useEffect(() => {
    if (isCustom && quizType) {
      setLoading(true);
      supabase
        .from('custom_quizzes')
        .select('*')
        .eq('id', quizType.replace('custom_', ''))
        .single()
        .then(({ data }) => {
          setCustomQuiz(data);
          setLoading(false);
        });
    }
  }, [quizType, isCustom]);

  let quiz = null;
  if (isCustom) {
    quiz = customQuiz ? {
      ...customQuiz,
      id: customQuiz.id,
      title: customQuiz.title,
      questions: customQuiz.questions || [],
    } : null;
  } else {
    quiz = quizzes[quizType as keyof typeof quizzes];
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-lg">Loading quiz...</div>;
  }

  if (!quiz) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Assessment Not Found</h1>
            <p className="text-gray-600 mb-4">The requested assessment could not be found.</p>
            <Button onClick={() => window.location.href = '/'}>
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <EmbeddedChatBot quizType={quizType!} shareKey={shareKey} doctorId={doctorId} />
  );
} 