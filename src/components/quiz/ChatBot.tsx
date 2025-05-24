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
  const [showResult, setShowResult] = useState(false);
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

  useEffect(() => {
    if (phase === 'results') {
      setShowResult(false);
      const timer = setTimeout(() => setShowResult(true), 200); // delay for fade-in
      return () => clearTimeout(timer);
    }
  }, [phase]);

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
      if (option === "Yes, let's start" || option === "I'm ready now") {
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
          ["I'm ready now", 'Maybe later']
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
    <div
      className="w-full h-full bg-white rounded-none shadow-none overflow-hidden flex flex-col mt-[2.5cm]"
    >
      {/* Chat header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
        <h2 className="text-3xl font-bold">{quizType} Assessment</h2>
        <p className="text-blue-100 text-lg mt-2">{quiz.title}</p>
      </div>

      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-end gap-2`}>
              {message.type === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold">
                  🤖
                </div>
              )}
              <div
                className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl shadow-md ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white ml-auto'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                {message.options && (
                  <div className="mt-4 space-y-2">
                    {message.options.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full text-left justify-start bg-white border-gray-300"
                        onClick={() => handleOptionClick(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              {message.type === 'user' && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  🧑
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-6 py-4 rounded-2xl shadow-md flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* User info form as chat bubble */}
      {phase === 'userInfo' && (
        <div className="p-6 border-t bg-gray-50">
          <form onSubmit={handleUserInfoSubmit} className="space-y-4 max-w-md mx-auto">
            <Input
              className="text-lg py-3"
              placeholder="Your Full Name *"
              value={userInfo.name}
              onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              className="text-lg py-3"
              type="email"
              placeholder="Your Email Address *"
              value={userInfo.email}
              onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
              required
            />
            <Input
              className="text-lg py-3"
              type="tel"
              placeholder="Your Phone Number (Optional)"
              value={userInfo.phone}
              onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
            />
            <Button type="submit" className="w-full text-lg py-3">
              Get My Results
            </Button>
          </form>
        </div>
      )}

      {/* Results section with transition, progress bar, and print button */}
      {phase === 'results' && quizResult && (
        <div className="p-8 flex justify-center items-center bg-gradient-to-br from-blue-50 to-purple-100 min-h-[350px]">
          <div
            className={`transition-all duration-700 ease-out transform ${
              showResult ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
            } w-full max-w-2xl`}
          >
            <Card className="w-full shadow-2xl rounded-3xl border-0">
              <div className="rounded-t-3xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 flex items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">🎉</span>
                  <div>
                    <CardTitle className="text-white text-2xl font-bold tracking-tight">
                      Assessment Complete!
                    </CardTitle>
                    <div className="text-blue-100 text-sm mt-1">{quiz.title}</div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
                  onClick={() => window.print()}
                >
                  🖨️ Print Results
                </Button>
              </div>
              <CardContent className="bg-white rounded-b-3xl px-8 py-8">
                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 font-medium">Your Score</span>
                    <span className="text-blue-700 font-bold">{quizResult.score} / {quiz.maxScore || 100}</span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-4 overflow-hidden">
                    <div
                      className={`
                        h-4 rounded-full transition-all duration-700
                        ${quizResult.severity === 'normal' && 'bg-green-400'}
                        ${quizResult.severity === 'mild' && 'bg-blue-400'}
                        ${quizResult.severity === 'moderate' && 'bg-yellow-400'}
                        ${quizResult.severity === 'severe' && 'bg-red-400'}
                      `}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((quizResult.score / (quiz.maxScore || 100)) * 100)
                        )}%`
                      }}
                    />
                  </div>
                </div>
                {/* Severity & Icon */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
                  <div className="flex items-center gap-3">
                    {getSeverityIcon(quizResult.severity)}
                    <span className={`text-lg font-semibold capitalize px-3 py-1 rounded-full
                      ${quizResult.severity === 'normal' && 'bg-green-100 text-green-700'}
                      ${quizResult.severity === 'mild' && 'bg-blue-100 text-blue-700'}
                      ${quizResult.severity === 'moderate' && 'bg-yellow-100 text-yellow-800'}
                      ${quizResult.severity === 'severe' && 'bg-red-100 text-red-700'}
                    `}>
                      {quizResult.severity}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-gray-500 text-sm">Severity Level</span>
                    <span className="text-xl font-bold">
                      {quizResult.severity.charAt(0).toUpperCase() + quizResult.severity.slice(1)}
                    </span>
                  </div>
                </div>
                <hr className="my-6" />
                <div className="mb-6 text-gray-700 text-base leading-relaxed">
                  {quizResult.summary}
                </div>
                <div className="flex justify-end">
                  <Badge className="text-base px-4 py-2 bg-blue-50 text-blue-700 border-blue-200" variant="outline">
                    {quiz.title}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
