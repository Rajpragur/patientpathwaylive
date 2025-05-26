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
import { CheckCircle, AlertTriangle, Info, TrendingUp, Award, Target, Users } from 'lucide-react';
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
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quiz = quizzes[quizType];
  const doctorShareKey = shareKey || searchParams.get('key');

  useEffect(() => {
    if (doctorShareKey) {
      findDoctorByShareKey();
    }
    
    if (messages.length === 0) {
      addBotMessage(
        `Hi! 👋 I'm here to help you with the ${quiz.title} assessment. This questionnaire will help evaluate your symptoms and provide valuable insights. Ready to begin?`,
        ['Yes, let\'s start', 'Tell me more first']
      );
    }
  }, [quiz.title, doctorShareKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (phase === 'results') {
      setShowResult(false);
      const timer = setTimeout(() => setShowResult(true), 500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const findDoctorByShareKey = async () => {
    if (!doctorShareKey) return;
    
    try {
      const { data: doctorProfiles } = await supabase
        .from('doctor_profiles')
        .select('id')
        .limit(1);
      
      if (doctorProfiles && doctorProfiles.length > 0) {
        setDoctorId(doctorProfiles[0].id);
      }
    } catch (error) {
      console.error('Error finding doctor:', error);
    }
  };

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
      if (currentQuestionIndex >= 0 && currentQuestionIndex < quiz.questions.length) {
        const currentQuestion = quiz.questions[currentQuestionIndex];
        
        // Validate that the selected option is valid for this question
        if (!currentQuestion.options.includes(option)) {
          addBotMessage(
            "Please select one of the provided options for this question.",
            currentQuestion.options
          );
          return;
        }

        const newAnswers = [...answers, {
          questionId: currentQuestion.id,
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

    // Only save to database when quiz is actually submitted with user info
    try {
      const leadSource = doctorShareKey ? 'shared_link' : 'website';
      
      const { data, error } = await supabase.from('quiz_leads').insert({
        doctor_id: doctorId,
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        quiz_type: quizType,
        score: result.score,
        answers: answers,
        lead_source: leadSource,
        share_key: doctorShareKey,
        lead_status: 'NEW',
        submitted_at: new Date().toISOString()
      }).select();

      if (error) throw error;
      
      toast.success('Results saved successfully!');
      addBotMessage(`Perfect, ${userInfo.name}! 🎯 Your ${quiz.title} assessment is complete. Here are your personalized results:`);
    } catch (error) {
      console.error('Error saving lead:', error);
      toast.error('Error saving results. Please try again.');
      return;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'normal': return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'mild': return <Info className="w-12 h-12 text-blue-500" />;
      case 'moderate': return <AlertTriangle className="w-12 h-12 text-yellow-500" />;
      case 'severe': return <TrendingUp className="w-12 h-12 text-red-500" />;
      default: return <Info className="w-12 h-12 text-gray-500" />;
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
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 text-slate-800 p-6 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-blue-600">{quizType} Assessment</h2>
          <p className="text-slate-600 text-lg">{quiz.title}</p>
          <div className="flex items-center gap-6 mt-3 text-slate-500">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">{quiz.questions.length} Questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="text-sm">5-10 Minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span className="text-sm">Instant Results</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} transition-all duration-300 ease-in-out transform hover:scale-[1.01]`}
          >
            <div className={`flex items-end gap-3 max-w-2xl`}>
              {message.type === 'bot' && (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-md">
                  🤖
                </div>
              )}
              <div
                className={`px-6 py-4 rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white ml-auto'
                    : 'bg-white text-slate-800 border border-slate-200'
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
                        className="w-full text-left justify-start bg-slate-50 border border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 hover:scale-105 text-slate-700 hover:text-blue-700 py-3 px-4 rounded-xl"
                        onClick={() => handleOptionClick(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              {message.type === 'user' && (
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold shadow-md">
                  👤
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-end gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-md">
                🤖
              </div>
              <div className="bg-white text-slate-800 px-6 py-4 rounded-2xl shadow-md border border-slate-200 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* User Info Form */}
      {phase === 'userInfo' && (
        <div className="p-6 border-t bg-white">
          <form onSubmit={handleUserInfoSubmit} className="space-y-4 max-w-md mx-auto">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Almost Done! 🎯</h3>
              <p className="text-slate-600">Just a few details to get your personalized results</p>
            </div>
            <Input
              className="py-3 px-4 rounded-xl border border-slate-300 focus:border-blue-500 transition-all duration-200"
              placeholder="Your Full Name *"
              value={userInfo.name}
              onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              className="py-3 px-4 rounded-xl border border-slate-300 focus:border-blue-500 transition-all duration-200"
              type="email"
              placeholder="Your Email Address *"
              value={userInfo.email}
              onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
              required
            />
            <Input
              className="py-3 px-4 rounded-xl border border-slate-300 focus:border-blue-500 transition-all duration-200"
              type="tel"
              placeholder="Your Phone Number (Optional)"
              value={userInfo.phone}
              onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
            />
            <Button 
              type="submit" 
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 transition-all duration-200 hover:scale-105 rounded-xl shadow-md"
            >
              Get My Results 🎉
            </Button>
          </form>
        </div>
      )}

      {/* Results Section */}
      {phase === 'results' && quizResult && (
        <div className="p-6 border-t bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                {getSeverityIcon(quizResult.severity)}
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Your Results</h3>
                  <p className="text-slate-600">Based on your responses</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-700 font-semibold">Your Score</span>
                    <span className="text-blue-600 font-bold text-xl">{quizResult.score} / {quiz.maxScore}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                      style={{ 
                        width: `${Math.min(100, Math.round((quizResult.score / quiz.maxScore) * 100))}%`
                      }}
                    ></div>
                  </div>
                  <div className="mt-2 text-right">
                    <span className="text-blue-600 font-semibold">
                      {Math.round((quizResult.score / quiz.maxScore) * 100)}%
                    </span>
                    <p className="text-slate-600">Completion Score</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-800 mb-2">Interpretation</h4>
                    <p className="text-slate-700 leading-relaxed">{quizResult.interpretation}</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-800 mb-2">Summary</h4>
                    <p className="text-slate-700 leading-relaxed">{quizResult.summary}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
