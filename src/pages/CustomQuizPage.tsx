
import { useParams, useSearchParams } from 'react-router-dom';
import { EmbeddedChatBot } from '@/components/quiz/EmbeddedChatBot';

export default function CustomQuizPage() {
  const { customQuizId } = useParams<{ customQuizId: string }>();
  const [searchParams] = useSearchParams();
  const shareKey = searchParams.get('key') || undefined;
  const doctorId = searchParams.get('doctor') || undefined;

  if (!customQuizId) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Invalid custom quiz ID
      </div>
    );
  }

  return (
    <EmbeddedChatBot 
      quizType={`custom_${customQuizId}`} 
      shareKey={shareKey}
      doctorId={doctorId}
    />
  );
}
