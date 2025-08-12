import { EnhancedChatBot } from "@/components/quiz/EnhancedChatBot";
import { useParams } from "react-router-dom";
import { QuizType } from "@/types/quiz";
import { quizzes } from "@/data/quizzes";

const Embed = () => {
  const { quizId } = useParams<{ quizId: string }>();

  const quizType = quizId?.toUpperCase() as QuizType;

  if (!quizId || !quizzes[quizType]) {
    return <div>Quiz not found</div>;
  }

  return (
    <div className="w-full h-screen">
      <EnhancedChatBot quizType={quizType} />
    </div>
  );
};

export default Embed;