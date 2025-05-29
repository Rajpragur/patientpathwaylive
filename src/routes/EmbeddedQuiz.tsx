
import { useParams, useSearchParams } from 'react-router-dom';
import { EmbeddedChatBot } from '@/components/quiz/EmbeddedChatBot';
import { QuizType } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export function EmbeddedQuiz() {
  const { quizType } = useParams<{ quizType: QuizType }>();
  const [searchParams] = useSearchParams();
  const shareKey = searchParams.get('key');
  const mode = searchParams.get('mode') || 'standard';

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
              {quizType.toUpperCase()} Assessment
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
      <EmbeddedChatBot quizType={quizType} shareKey={shareKey || undefined} />
    </div>
  );
}
