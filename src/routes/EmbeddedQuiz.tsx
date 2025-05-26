import { useParams, useSearchParams } from 'react-router-dom';
import { EmbeddedChatBot } from '@/components/quiz/EmbeddedChatBot';
import { QuizType } from '@/types/quiz';

export function EmbeddedQuiz() {
  const { quizType } = useParams<{ quizType: QuizType }>();
  const [searchParams] = useSearchParams();
  const shareKey = searchParams.get('key');

  if (!quizType) {
    return <div>Invalid quiz type</div>;
  }

  return (
    <div className="min-h-screen bg-transparent">
      <EmbeddedChatBot quizType={quizType} shareKey={shareKey || undefined} />
    </div>
  );
} 