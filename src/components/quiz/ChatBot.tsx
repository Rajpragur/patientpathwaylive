
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QuizType } from '@/types/quiz';
import { quizzes } from '@/data/quizzes';
import { calculateQuizScore } from '@/utils/quizScoring';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Info, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  options?: string[];
}

interface ChatBotProps {
  quizType: QuizType;
  shareKey?: string;
}

export function ChatBot({ quizType, shareKey }: ChatBotProps) {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [answers, setAnswers] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState({ name: '', email: '', phone: '' });
  const [phase, setPhase] = useState<'greeting' | 'quiz' | 'userInfo' | 'results'>('greeting');
  const [isTyping, setIsTyping] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quiz = quizzes[quizType];
  const doctorShareKey = shareKey || searchParams.get('key');

  useEffect(() => {
    if (messages.length === 0) {
      addBotMessage(
        `Hi! 👋 I'm here to help you with the ${quiz.title} assessment. This questionnaire will help evaluate your symptoms and provide valuable insights. Ready to begin?`,
        ['Yes, let\'s start', 'Tell me more first']
      );
    }
  }, [quiz.title]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addBotMessage = (content: string, options?: string[]) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'bot',
        content,
        options
      }]);
      setIsTyping(false);
    }, 1000);
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      content
    }]);
  };

  const handleOptionClick = (option: string) => {
    addUserMessage(option);

    if (phase === 'greeting') {
      if (option === 'Yes, let\'s start') {
        setPhase('quiz');
        setCurrentQuestionIndex(0);
        setTimeout(() => {
          addBotMessage(
            `Great! Let's begin with question 1 of ${quiz.questions.length}:\n\n${quiz.questions[0].text}`,
            quiz.questions[0].options
          );
        }, 500);
      } else if (option === 'Tell me more first') {
        addBotMessage(
          `The ${quiz.title} assessment helps evaluate your symptoms and provides insights about your condition. It takes about 5-10 minutes to complete. When you're ready, we can start!`,
          ['I\'m ready now', 'Maybe later']
        );
      } else {
        addBotMessage("No problem! Feel free to return when you're ready. Take care! 💙");
      }
    } else if (phase === 'quiz') {
      const newAnswers = [...answers, {
        questionId: quiz.questions[currentQuestionIndex].id,
        answer: option
      }];
      setAnswers(newAnswers);

      if (currentQuestionIndex < quiz.questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        setTimeout(() => {
          addBotMessage(
            `Question ${nextIndex + 1} of ${quiz.questions.length}:\n\n${quiz.questions[nextIndex].text}`,
            quiz.questions[nextIndex].options
          );
        }, 500);
      } else {
        setPhase('userInfo');
        setTimeout(() => {
          addBotMessage("Excellent! 🎉 You've completed all questions. Now I need some contact information to provide you with your personalized results.");
        }, 500);
      }
    }
  };

  const handleUserInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo.name || !userInfo.email) {
      toast.error('Please fill in required fields');
      return;
    }

    setPhase('results');
    const result = calculateQuizScore(quizType, answers);
    setQuizResult(result);

    // Save to database if shareKey is provided
    if (doctorShareKey) {
      try {
        const { data: leads } = await supabase
          .from('quiz_leads')
          .select('doctor_id')
          .eq('share_key', doctorShareKey)
          .limit(1);

        if (leads && leads.length > 0) {
          await supabase.from('quiz_leads').insert({
            doctor_id: leads[0].doctor_id,
            name: userInfo.name,
            email: userInfo.email,
            phone: userInfo.phone,
            quiz_type: quizType,
            score: result.score,
            answers: answers,
            lead_source: 'shared_link',
            share_key: doctorShareKey
          });
        }
      } catch (error) {
        console.error('Error saving lead:', error);
      }
    }

    addBotMessage(`Perfect, ${userInfo.name}! 🎯 Your ${quiz.title} assessment is complete. Here are your personalized results:`);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'normal': return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'mild': return <Info className="w-8 h-8 text-blue-500" />;
      case 'moderate': return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
      case 'severe': return <TrendingUp className="w-8 h-8 text-red-500" />;
      default: return <Info className="w-8 h-8 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'normal': return 'border-green-500 bg-green-50';
      case 'mild': return 'border-blue-500 bg-blue-50';
      case 'moderate': return 'border-yellow-500 bg-yellow-50';
      case 'severe': return 'border-red-500 bg-red-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <h2 className="text-2xl font-bold">{quiz.title} Assessment</h2>
        <p className="text-blue-100 text-sm mt-2">{quiz.description}</p>
        {phase === 'quiz' && (
          <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{currentQuestionIndex + 1} of {quiz.questions.length}</span>
            </div>
            <div className="w-full bg-white bg-opacity-30 rounded-full h-2 mt-1">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500" 
                style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      
      <div className="h-96 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl transition-all duration-200 ${
              message.type === 'user' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                : 'bg-gray-100 text-gray-800 shadow-md'
            }`}>
              <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
              {message.options && (
                <div className="mt-4 space-y-2">
                  {message.options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start transition-all duration-200 hover:scale-105 hover:shadow-md bg-white border-gray-300"
                      onClick={() => handleOptionClick(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-6 py-4 rounded-2xl shadow-md">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Results Display */}
        {phase === 'results' && quizResult && (
          <div className="space-y-6">
            <Card className={`border-2 ${getSeverityColor(quizResult.severity)} shadow-xl`}>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {getSeverityIcon(quizResult.severity)}
                </div>
                <CardTitle className="text-2xl text-gray-800">Your Assessment Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-800 mb-2">{quizResult.score}</div>
                  <Badge className={`text-lg px-4 py-2 ${
                    quizResult.severity === 'normal' ? 'bg-green-500' :
                    quizResult.severity === 'mild' ? 'bg-blue-500' :
                    quizResult.severity === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}>
                    {quizResult.severity.toUpperCase()} SYMPTOMS
                  </Badge>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-inner">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">What This Means:</h3>
                  <p className="text-gray-700 leading-relaxed">{quizResult.interpretation}</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <h4 className="font-semibold text-blue-800 mb-2">Next Steps:</h4>
                  <p className="text-blue-700 text-sm">
                    Consider discussing these results with a healthcare professional for personalized medical advice and treatment options.
                  </p>
                </div>

                <div className="text-center pt-4">
                  <Button 
                    onClick={() => window.print()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full transition-all duration-200 transform hover:scale-105"
                  >
                    Print Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {phase === 'userInfo' && (
        <div className="p-6 border-t bg-gradient-to-r from-blue-50 to-purple-50">
          <form onSubmit={handleUserInfoSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Your Full Name *"
                value={userInfo.name}
                onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                className="rounded-xl border-2 border-blue-200 focus:border-blue-500 transition-all duration-200"
                required
              />
              <Input
                type="email"
                placeholder="Your Email Address *"
                value={userInfo.email}
                onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                className="rounded-xl border-2 border-blue-200 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>
            <Input
              type="tel"
              placeholder="Your Phone Number (Optional)"
              value={userInfo.phone}
              onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
              className="rounded-xl border-2 border-blue-200 focus:border-blue-500 transition-all duration-200"
            />
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl transition-all duration-200 transform hover:scale-105 text-lg font-semibold"
            >
              Get My Personalized Results 🎯
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
