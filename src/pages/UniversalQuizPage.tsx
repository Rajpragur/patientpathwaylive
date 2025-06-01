
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
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const checkQuiz = async () => {
      if (!quizType) {
        setNotFound(true);
        return;
      }

      // Check if it's a custom quiz
      if (quizType.startsWith('custom_')) {
        setLoading(true);
        const customQuizId = quizType.replace('custom_', '');
        
        const { data, error } = await supabase
          .from('custom_quizzes')
          .select('*')
          .eq('id', customQuizId)
          .single();
        
        if (data) {
          setCustomQuiz(data);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      } else {
        // Check if it's a standard quiz - make case insensitive
        const standardQuiz = Object.values(quizzes).find(
          quiz => quiz.id.toLowerCase() === quizType.toLowerCase()
        );
        if (!standardQuiz) {
          setNotFound(true);
        }
      }
    };

    checkQuiz();
  }, [quizType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (notFound || !quizType) {
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
    <div className="min-h-screen bg-gray-50">
      <EmbeddedChatBot 
        quizType={quizType} 
        shareKey={shareKey} 
        doctorId={doctorId} 
      />
    </div>
  );
}
