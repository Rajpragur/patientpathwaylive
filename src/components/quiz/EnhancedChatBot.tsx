
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
import { CheckCircle, AlertTriangle, Info, TrendingUp, Award, Target, Users, Brain, Clock, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  options?: string[];
}

interface EnhancedChatBotProps {
  quizType: QuizType;
  shareKey?: string;
}

export function EnhancedChatBot({ quizType, shareKey }: EnhancedChatBotProps) {
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
  const [questionValidation, setQuestionValidation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quiz = quizzes[quizType];
  const doctorShareKey = shareKey || searchParams.get('key');

  useEffect(() => {
    if (doctorShareKey) {
      findDoctorByShareKey();
    }
    
    if (messages.length === 0) {
      addBotMessage(
        `Welcome to the ${quiz.title} Assessment! 🏥\n\nI'm your AI health assistant. This scientifically-validated questionnaire will help evaluate your symptoms and provide personalized insights.\n\n✅ Takes 5-10 minutes\n✅ Instant results\n✅ Confidential & secure\n\nReady to begin your assessment?`,
        ['Yes, let\'s start!', 'Tell me more about this assessment']
      );
    }
  }, [quiz.title, doctorShareKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (phase === 'results') {
      setShowResult(false);
      const timer = setTimeout(() => setShowResult(true), 800);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const findDoctorByShareKey = async () => {
    if (!doctorShareKey) return;
    
    try {
      // First try to find doctor by share key in existing leads
      const { data: existingLeads } = await supabase
        .from('quiz_leads')
        .select('doctor_id')
        .eq('share_key', doctorShareKey)
        .limit(1);
      
      if (existingLeads && existingLeads.length > 0) {
        setDoctorId(existingLeads[0].doctor_id);
      } else {
        // If no existing lead, try to extract doctor from URL
        const doctorParam = searchParams.get('doctor');
        if (doctorParam) {
          setDoctorId(doctorParam);
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
    }, 1200);
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
      if (option === "Yes, let's start!") {
        setPhase('quiz');
        setCurrentQuestionIndex(0);
        setTimeout(() => {
          addBotMessage(
            `Excellent! Let's begin your ${quiz.title} assessment.\n\n📋 Question 1 of ${quiz.questions.length}\n\n${quiz.questions[0].text}`,
            quiz.questions[0].options
          );
        }, 600);
      } else if (option === 'Tell me more about this assessment') {
        addBotMessage(
          `The ${quiz.title} is a clinically validated assessment tool used by healthcare professionals worldwide.\n\n🔬 **Scientifically Proven**: Based on peer-reviewed research\n🎯 **Personalized Results**: Tailored insights for your symptoms\n🔒 **Completely Confidential**: Your privacy is our priority\n⚡ **Instant Analysis**: Get results immediately\n\nThis assessment helps identify symptom patterns and provides valuable insights that you can discuss with your healthcare provider.\n\nReady to start?`,
          ["Yes, I'm ready!", 'I need more time']
        );
      } else if (option === "Yes, I'm ready!") {
        setPhase('quiz');
        setCurrentQuestionIndex(0);
        setTimeout(() => {
          addBotMessage(
            `Perfect! Let's begin your comprehensive assessment.\n\n📋 Question 1 of ${quiz.questions.length}\n\n${quiz.questions[0].text}`,
            quiz.questions[0].options
          );
        }, 600);
      } else {
        addBotMessage(
          "No worries at all! Take your time to consider. When you're ready to proceed with your health assessment, just return here. Your wellbeing is worth the wait! 💙",
          []
        );
      }
    } else if (phase === 'quiz') {
      if (currentQuestionIndex >= 0 && currentQuestionIndex < quiz.questions.length) {
        const currentQuestion = quiz.questions[currentQuestionIndex];
        
        // Strict validation - only proceed if option is from current question
        if (!currentQuestion.options.includes(option)) {
          setQuestionValidation(true);
          addBotMessage(
            "⚠️ Please select one of the provided options for this question to continue. Choose from the options shown above.",
            currentQuestion.options
          );
          return;
        }

        setQuestionValidation(false);
        const newAnswers = [...answers, {
          questionId: currentQuestion.id,
          answer: option
        }];
        setAnswers(newAnswers);

        if (currentQuestionIndex < quiz.questions.length - 1) {
          const nextIndex = currentQuestionIndex + 1;
          setCurrentQuestionIndex(nextIndex);
          setTimeout(() => {
            const progress = Math.round(((nextIndex + 1) / quiz.questions.length) * 100);
            addBotMessage(
              `Great answer! 📊 Progress: ${progress}%\n\n📋 Question ${nextIndex + 1} of ${quiz.questions.length}\n\n${quiz.questions[nextIndex].text}`,
              quiz.questions[nextIndex].options
            );
          }, 700);
        } else {
          setPhase('userInfo');
          setTimeout(() => {
            addBotMessage(
              "🎉 **Assessment Complete!** \n\nYou've successfully completed all questions. Now I need some contact information to provide you with your personalized health insights and recommendations.\n\n📧 This helps us deliver your detailed results securely."
            );
          }, 800);
        }
      }
    }
  };

  const handleUserInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo.name || !userInfo.email) {
      toast.error('Please fill in your name and email to receive results');
      return;
    }

    // Calculate result before saving
    const result = calculateQuizScore(quizType, answers);
    setQuizResult(result);
    setPhase('results');

    // ONLY NOW save to database when user actually submits with contact info
    try {
      const leadSource = doctorShareKey ? 'shared_link' : 'website';
      
      const { error } = await supabase.from('quiz_leads').insert({
        doctor_id: doctorId,
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        quiz_type: quizType,
        score: result.score,
        answers: answers,
        lead_source: leadSource,
        share_key: doctorShareKey,
        lead_status: 'NEW'
      });

      if (error) {
        console.error('Error saving lead:', error);
        toast.error('Error saving results. Please try again.');
        return;
      }
      
      toast.success('✅ Assessment completed! Results saved securely.');
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error('Error saving results. Please try again.');
      return;
    }

    addBotMessage(
      `Thank you, ${userInfo.name}! 🎯 Your ${quiz.title} assessment has been completed and analyzed. Here are your comprehensive results:`
    );
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'normal': return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'mild': return <Info className="w-16 h-16 text-blue-500" />;
      case 'moderate': return <AlertTriangle className="w-16 h-16 text-yellow-500" />;
      case 'severe': return <TrendingUp className="w-16 h-16 text-red-500" />;
      default: return <Info className="w-16 h-16 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'normal': return 'border-green-400 bg-gradient-to-br from-green-50 to-green-100';
      case 'mild': return 'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100';
      case 'moderate': return 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100';
      case 'severe': return 'border-red-400 bg-gradient-to-br from-red-50 to-red-100';
      default: return 'border-gray-400 bg-gradient-to-br from-gray-50 to-gray-100';
    }
  };

  const getMaxScore = () => {
    switch (quizType) {
      case 'SNOT22': return 110; // 22 questions × 5 points
      case 'NOSE': return 20; // 5 questions × 4 points
      case 'HHIA': return 100; // Scaled score
      case 'EPWORTH': return 24; // 8 questions × 3 points
      case 'DHI': return 100; // 25 questions × 4 points
      case 'STOP': return 8; // 8 yes/no questions
      case 'TNSS': return 12; // 4 questions × 3 points
      default: return 100;
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden flex flex-col">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-slate-200 text-slate-800 p-6 shadow-lg rounded-b-2xl">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] bg-clip-text text-transparent">
                {quizType} Assessment
              </h2>
              <p className="text-slate-600 text-lg">{quiz.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-slate-500">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl">
              <Users className="w-4 h-4" />
              <span className="font-medium text-sm">{quiz.questions.length} Questions</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl">
              <Clock className="w-4 h-4" />
              <span className="font-medium text-sm">5-10 Minutes</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl">
              <Shield className="w-4 h-4" />
              <span className="font-medium text-sm">Validated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-3xl mx-auto w-full">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} transition-all duration-500 ease-out transform`}
            style={{
              animation: `fadeInSlide 0.6s ease-out ${index * 0.1}s both`
            }}
          >
            <div className={`flex items-end gap-3 max-w-2xl`}>
              {message.type === 'bot' && (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] flex items-center justify-center text-white font-bold shadow-lg text-sm">
                  🤖
                </div>
              )}
              <div
                className={`px-5 py-4 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] text-white ml-auto'
                    : 'bg-white text-slate-800 border border-slate-200'
                }`}
              >
                <p className="text-sm whitespace-pre-line leading-relaxed font-medium">{message.content}</p>
                {message.options && (
                  <div className="mt-4 space-y-2">
                    {message.options.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full text-left justify-start bg-slate-50 border border-slate-300 hover:border-[#0E7C9D] hover:bg-blue-50 transition-all duration-300 hover:scale-[1.02] text-slate-700 hover:text-[#0E7C9D] py-3 px-4 rounded-xl font-medium shadow-sm hover:shadow-md"
                        onClick={() => handleOptionClick(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              {message.type === 'user' && (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-lg text-sm">
                  👤
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-end gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] flex items-center justify-center text-white font-bold shadow-lg text-sm">
                🤖
              </div>
              <div className="bg-white text-slate-800 px-5 py-4 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#0E7C9D] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#0E7C9D] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-[#0E7C9D] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm font-medium text-slate-600">Analyzing your response...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced User Info Form */}
      {phase === 'userInfo' && (
        <div className="p-6 border-t bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
          <form onSubmit={handleUserInfoSubmit} className="space-y-4 max-w-lg mx-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Almost There! 🎯</h3>
              <p className="text-slate-600 leading-relaxed">Enter your details to receive your personalized health assessment results and recommendations.</p>
            </div>
            <Input
              className="py-4 px-5 rounded-2xl border-2 border-slate-300 focus:border-[#0E7C9D] transition-all duration-200 text-lg"
              placeholder="Your Full Name *"
              value={userInfo.name}
              onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              className="py-4 px-5 rounded-2xl border-2 border-slate-300 focus:border-[#0E7C9D] transition-all duration-200 text-lg"
              type="email"
              placeholder="Your Email Address *"
              value={userInfo.email}
              onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
              required
            />
            <Input
              className="py-4 px-5 rounded-2xl border-2 border-slate-300 focus:border-[#0E7C9D] transition-all duration-200 text-lg"
              type="tel"
              placeholder="Your Phone Number (Optional)"
              value={userInfo.phone}
              onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
            />
            <Button 
              type="submit" 
              className="w-full py-4 bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] hover:from-[#0E7C9D]/90 hover:to-[#FD904B]/90 transition-all duration-300 hover:scale-[1.02] rounded-2xl shadow-lg hover:shadow-xl text-lg font-semibold"
            >
              Get My Assessment Results 🎉
            </Button>
          </form>
        </div>
      )}

      {/* Enhanced Results Section */}
      {phase === 'results' && quizResult && (
        <div className="p-6 flex justify-center items-center bg-gradient-to-br from-slate-50 to-blue-50 min-h-[500px]">
          <div
            className={`transition-all duration-1000 ease-out transform ${
              showResult ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
            } w-full max-w-3xl`}
          >
            <Card className="w-full shadow-2xl rounded-3xl border-0 overflow-hidden bg-white">
              <div className="bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] px-8 py-8 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="text-6xl">🎉</div>
                    <div>
                      <CardTitle className="text-white text-3xl font-bold mb-2">
                        Assessment Complete!
                      </CardTitle>
                      <div className="text-blue-100 text-lg">{quiz.title}</div>
                      <div className="text-blue-200 text-sm mt-1">
                        Completed on {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="bg-white text-[#0E7C9D] border-blue-200 hover:bg-blue-50 px-6 py-3 rounded-2xl transition-all duration-200 hover:scale-105 font-semibold"
                    onClick={() => window.print()}
                  >
                    🖨️ Print Results
                  </Button>
                </div>
              </div>
              
              <CardContent className="bg-white px-8 py-8">
                {/* Score Display */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-700 font-bold text-xl">Your Assessment Score</span>
                    <span className="text-[#0E7C9D] font-bold text-3xl">{quizResult.score} / {getMaxScore()}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-6 overflow-hidden">
                    <div
                      className={`h-6 rounded-full transition-all duration-1500 ${
                        quizResult.severity === 'normal' && 'bg-gradient-to-r from-green-400 to-green-500'
                      } ${
                        quizResult.severity === 'mild' && 'bg-gradient-to-r from-blue-400 to-blue-500'
                      } ${
                        quizResult.severity === 'moderate' && 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                      } ${
                        quizResult.severity === 'severe' && 'bg-gradient-to-r from-red-400 to-red-500'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.round((quizResult.score / getMaxScore()) * 100))}%`
                      }}
                    />
                  </div>
                </div>

                {/* Severity & Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className={`flex flex-col items-center gap-4 p-6 rounded-2xl border-2 ${getSeverityColor(quizResult.severity)}`}>
                    {getSeverityIcon(quizResult.severity)}
                    <div className="text-center">
                      <span className="text-2xl font-bold capitalize mb-2 block">
                        {quizResult.severity} Level
                      </span>
                      <p className="text-sm text-slate-600">Severity Assessment</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-center items-center text-center bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl">
                    <div className="text-4xl font-bold text-slate-800 mb-2">
                      {Math.round((quizResult.score / getMaxScore()) * 100)}%
                    </div>
                    <p className="text-slate-600 font-medium">Score Percentage</p>
                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                      <Award className="w-4 h-4" />
                      <span>Clinically Validated Result</span>
                    </div>
                  </div>
                </div>
                
                {/* Results Summary */}
                <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                  <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Brain className="w-6 h-6 text-[#0E7C9D]" />
                    Your Personalized Analysis
                  </h4>
                  <p className="text-slate-700 leading-relaxed text-lg">{quizResult.interpretation}</p>
                </div>

                {/* Additional Info */}
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <Badge className="px-4 py-2 bg-blue-50 text-[#0E7C9D] border-blue-200 rounded-2xl text-lg font-medium" variant="outline">
                    {quiz.title}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Shield className="w-4 h-4" />
                    <span>Results saved securely & confidentially</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes fadeInSlide {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}
