
import { QuizType } from '@/types/quiz';
import { quizzes } from '@/data/quizzes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuizSelectorProps {
  onSelectQuiz: (quizType: QuizType) => void;
}

export function QuizSelector({ onSelectQuiz }: QuizSelectorProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">Patient Pathway</h1>
          <p className="text-xl text-gray-600">ENT Medical Assessment Platform</p>
          <p className="text-gray-500 mt-2">Select a quiz to begin your assessment</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(quizzes).map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-blue-600">{quiz.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{quiz.description}</p>
                <p className="text-sm text-gray-500 mb-4">
                  {quiz.questions.length} questions
                </p>
                <Button 
                  onClick={() => onSelectQuiz(quiz.id)}
                  className="w-full"
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
