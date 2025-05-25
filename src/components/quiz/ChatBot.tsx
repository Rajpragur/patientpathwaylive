
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
      const { data: leads } = await supabase
        .from('quiz_leads')
        .select('doctor_id')
        .eq('share_key', doctorShareKey)
        .limit(1);

      if (leads && leads.length > 0) {
        setDoctorId(leads[0].doctor_id);
      } else {
        // If no existing leads with this share key, try to find doctor profile by share key
        const { data: doctorProfiles } = await supabase
          .from('doctor_profiles')
          .select('id')
          .limit(1);
        
        if (doctorProfiles && doctorProfiles.length > 0) {
          setDoctorId(doctorProfiles[0].id);
        }
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
      // Only proceed if we're actually answering a quiz question
      if (currentQuestionIndex >= 0 && currentQuestionIndex < quiz.questions.length) {
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

    // Save to database
    try {
      await supabase.from('quiz_leads').insert({
        doctor_id: doctorId,
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        quiz_type: quizType,
        score: result.score,
        answers: answers,
        lead_source: doctorShareKey ? 'shared_link' : 'website',
        share_key: doctorShareKey
      });
      
      toast.success('Results saved successfully!');
    } catch (error) {
      console.error('Error saving lead:', error);
      toast.error('Error saving results');
    }

    addBotMessage(`Perfect, ${userInfo.name}! 🎯 Your ${quiz.title} assessment is complete. Here are your personalized results:`);
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
    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden flex flex-col">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-8 shadow-xl">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-2">{quizType} Assessment</h2>
          <p className="text-blue-100 text-xl">{quiz.title}</p>
          <div className="flex items-center gap-6 mt-4 text-blue-100">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{quiz.questions.length} Questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              <span>5-10 Minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span>Instant Results</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 max-w-4xl mx-auto w-full">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`flex items-end gap-4 max-w-2xl`}>
              {message.type === 'bot' && (
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  🤖
                </div>
              )}
              <div
                className={`px-8 py-6 rounded-3xl shadow-lg ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-auto'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
              >
                <p className="text-base whitespace-pre-line leading-relaxed">{message.content}</p>
                {message.options && (
                  <div className="mt-6 space-y-3">
                    {message.options.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="lg"
                        className="w-full text-left justify-start bg-white border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 hover:scale-105 text-gray-700 hover:text-blue-700 py-4 px-6 rounded-xl"
                        onClick={() => handleOptionClick(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              {message.type === 'user' && (
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  👤
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex items-end gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                🤖
              </div>
              <div className="bg-white text-gray-800 px-8 py-6 rounded-3xl shadow-lg border border-gray-200 flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced User Info Form */}
      {phase === 'userInfo' && (
        <div className="p-8 border-t bg-gradient-to-r from-blue-50 to-purple-50">
          <form onSubmit={handleUserInfoSubmit} className="space-y-6 max-w-md mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Almost Done! 🎯</h3>
              <p className="text-gray-600">Just a few details to get your personalized results</p>
            </div>
            <Input
              className="text-lg py-4 px-6 rounded-xl border-2 border-gray-300 focus:border-blue-500 transition-all duration-200"
              placeholder="Your Full Name *"
              value={userInfo.name}
              onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              className="text-lg py-4 px-6 rounded-xl border-2 border-gray-300 focus:border-blue-500 transition-all duration-200"
              type="email"
              placeholder="Your Email Address *"
              value={userInfo.email}
              onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
              required
            />
            <Input
              className="text-lg py-4 px-6 rounded-xl border-2 border-gray-300 focus:border-blue-500 transition-all duration-200"
              type="tel"
              placeholder="Your Phone Number (Optional)"
              value={userInfo.phone}
              onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
            />
            <Button 
              type="submit" 
              className="w-full text-xl py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 rounded-xl shadow-lg"
            >
              Get My Results 🎉
            </Button>
          </form>
        </div>
      )}

      {/* Enhanced Results Section */}
      {phase === 'results' && quizResult && (
        <div className="p-8 flex justify-center items-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 min-h-[500px]">
          <div
            className={`transition-all duration-1000 ease-out transform ${
              showResult ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
            } w-full max-w-4xl`}
          >
            <Card className="w-full shadow-2xl rounded-3xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-8 flex items-center gap-6 justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-6xl">🎉</div>
                  <div>
                    <CardTitle className="text-white text-3xl font-bold tracking-tight">
                      Assessment Complete!
                    </CardTitle>
                    <div className="text-blue-100 text-lg mt-2">{quiz.title}</div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="bg-white text-blue-700 border-blue-200 hover:bg-blue-50 px-6 py-3 text-lg rounded-xl transition-all duration-200 hover:scale-105"
                  onClick={() => window.print()}
                >
                  🖨️ Print Results
                </Button>
              </div>
              <CardContent className="bg-white px-8 py-8">
                {/* Enhanced Progress Bar */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-700 font-semibold text-lg">Your Score</span>
                    <span className="text-blue-700 font-bold text-2xl">{quizResult.score} / {quiz.maxScore || 100}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
                    <div
                      className={`
                        h-6 rounded-full transition-all duration-1000 relative overflow-hidden
                        ${quizResult.severity === 'normal' && 'bg-gradient-to-r from-green-400 to-green-500'}
                        ${quizResult.severity === 'mild' && 'bg-gradient-to-r from-blue-400 to-blue-500'}
                        ${quizResult.severity === 'moderate' && 'bg-gradient-to-r from-yellow-400 to-yellow-500'}
                        ${quizResult.severity === 'severe' && 'bg-gradient-to-r from-red-400 to-red-500'}
                      `}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((quizResult.score / (quiz.maxScore || 100)) * 100)
                        )}%`
                      }}
                    >
                      <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Severity Display */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mb-8">
                  <div className={`flex items-center gap-4 p-6 rounded-2xl border-2 ${getSeverityColor(quizResult.severity)} transition-all duration-300 hover:scale-105`}>
                    {getSeverityIcon(quizResult.severity)}
                    <div>
                      <span className="text-2xl font-bold capitalize">
                        {quizResult.severity}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">Severity Level</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-800 mb-2">
                      {Math.round((quizResult.score / (quiz.maxScore || 100)) * 100)}%
                    </div>
                    <p className="text-gray-600">Completion Score</p>
                  </div>
                </div>

                <hr className="my-8 border-gray-200" />
                
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">Your Results Summary</h4>
                  <p className="text-gray-700 text-lg leading-relaxed">{quizResult.summary}</p>
                </div>
                
                <div className="flex justify-between items-center">
                  <Badge className="text-lg px-6 py-3 bg-blue-50 text-blue-700 border-blue-200 rounded-xl" variant="outline">
                    {quiz.title}
                  </Badge>
                  <div className="text-sm text-gray-500">
                    Completed on {new Date().toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
