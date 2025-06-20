
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Clock, Heart, Ear, Activity, Moon, Stethoscope } from 'lucide-react';
import { QuizType } from '@/types/quiz';

interface QuizOption {
  id: QuizType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  duration: string;
}

const quizOptions: QuizOption[] = [
  {
    id: 'SYMPTOM_CHECKER',
    title: 'Symptom Checker',
    description: 'AI-powered symptom analysis and assessment recommendation',
    icon: <Brain className="w-6 h-6" />,
    color: 'from-purple-400 to-purple-500',
    duration: 'Varies'
  },
  {
    id: 'SNOT22',
    title: 'SNOT-22',
    description: 'Sinus and nasal symptoms assessment',
    icon: <Brain className="w-6 h-6" />,
    color: 'from-blue-500 to-blue-600',
    duration: '5-7 minutes'
  },
  {
    id: 'NOSE',
    title: 'NOSE Scale',
    description: 'Nasal Obstruction Symptom Evaluation',
    icon: <Activity className="w-6 h-6" />,
    color: 'from-green-500 to-green-600',
    duration: '3-4 minutes'
  },
  {
    id: 'HHIA',
    title: 'HHIA-S',
    description: 'Hearing Handicap Inventory for Adults',
    icon: <Ear className="w-6 h-6" />,
    color: 'from-purple-500 to-purple-600',
    duration: '4-5 minutes'
  },
  {
    id: 'EPWORTH',
    title: 'Epworth Sleepiness Scale',
    description: 'Daytime sleepiness assessment',
    icon: <Moon className="w-6 h-6" />,
    color: 'from-indigo-500 to-indigo-600',
    duration: '3-4 minutes'
  },
  {
    id: 'DHI',
    title: 'DHI',
    description: 'Dizziness Handicap Inventory',
    icon: <Heart className="w-6 h-6" />,
    color: 'from-red-500 to-red-600',
    duration: '5-6 minutes'
  },
  {
    id: 'STOP',
    title: 'STOP-BANG',
    description: 'Sleep apnea screening questionnaire',
    icon: <Stethoscope className="w-6 h-6" />,
    color: 'from-orange-500 to-orange-600',
    duration: '2-3 minutes'
  },
  {
    id: 'TNSS',
    title: 'TNSS',
    description: 'Total Nasal Symptom Score',
    icon: <Clock className="w-6 h-6" />,
    color: 'from-teal-500 to-teal-600',
    duration: '2-3 minutes'
  }
];

interface QuizSelectorProps {
  onSelectQuiz: (quizType: QuizType) => void;
}

export function QuizSelector({ onSelectQuiz }: QuizSelectorProps) {
  const handleQuizSelect = (quizId: string) => {
    // Type assertion to ensure the string is a valid QuizType
    const validQuizTypes: QuizType[] = ['SNOT22', 'NOSE', 'HHIA', 'EPWORTH', 'DHI', 'STOP', 'TNSS', 'SYMPTOM_CHECKER'];
    if (validQuizTypes.includes(quizId as QuizType)) {
      onSelectQuiz(quizId as QuizType);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Health Assessment
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select the assessment that best matches your symptoms or concerns. 
          Each questionnaire is designed to help evaluate specific health conditions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizOptions.map((quiz) => (
          <Card 
            key={quiz.id} 
            className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-blue-200"
            onClick={() => handleQuizSelect(quiz.id)}
          >
            <CardHeader className="pb-3">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${quiz.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform duration-300`}>
                {quiz.icon}
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                {quiz.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {quiz.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {quiz.duration}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="group-hover:bg-blue-50 group-hover:border-blue-300 transition-colors duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuizSelect(quiz.id);
                  }}
                >
                  Start Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Need Help Choosing?
          </h3>
          <p className="text-blue-700">
            Not sure which assessment to take? Consider your primary symptoms:
            nasal/sinus issues (SNOT-22, NOSE), hearing problems (HHIA), 
            sleep concerns (Epworth, STOP-BANG), or dizziness (DHI).
          </p>
        </div>
      </div>
    </div>
  );
}
