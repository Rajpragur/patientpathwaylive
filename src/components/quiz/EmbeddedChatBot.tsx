import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QuizType } from '@/types/quiz';
import { quizzes } from '@/data/quizzes';
import { calculateQuizScore } from '@/utils/quizScoring';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, AlertTriangle, Info, TrendingUp, Award, Target, Users, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  options?: string[];
}

interface EmbeddedChatBotProps {
  quizType: QuizType;
  shareKey?: string;
}

export function EmbeddedChatBot({ quizType, shareKey }: EmbeddedChatBotProps) {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [answers, setAnswers] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState({ name: '', email: '', phone: '' });
  const [phase, setPhase] = useState<'greeting' | 'quiz' | 'userInfo' | 'results'>('greeting');
  const [isTyping, setIsTyping] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
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
      case 'normal': return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'mild': return <Info className="w-8 h-8 text-blue-500" />;
      case 'moderate': return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
      case 'severe': return <TrendingUp className="w-8 h-8 text-red-500" />;
      default: return <Info className="w-8 h-8 text-gray-500" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {!isExpanded ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              onClick={() => setIsExpanded(true)}
              className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <MessageSquare className="w-6 h-6" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-[400px] h-[600px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden backdrop-blur-sm bg-opacity-95"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{quizType} Assessment</h3>
                  <p className="text-sm text-blue-100">{quiz.title}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 rounded-full p-2 transition-all duration-200"
                onClick={() => setIsExpanded(false)}
              >
                ×
              </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "flex",
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div className="flex items-end gap-2 max-w-[80%]">
                      {message.type === 'bot' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm shadow-md"
                        >
                          🤖
                        </motion.div>
                      )}
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={cn(
                          "px-4 py-2 rounded-2xl shadow-sm",
                          message.type === 'user'
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                            : 'bg-slate-100 text-slate-800'
                        )}
                      >
                        <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                        {message.options && (
                          <div className="mt-2 space-y-1">
                            {message.options.map((option, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-left justify-start bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 py-2 px-3 rounded-xl text-xs transition-all duration-200 hover:scale-[1.02]"
                                  onClick={() => handleOptionClick(option)}
                                >
                                  {option}
                                </Button>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                      {message.type === 'user' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-sm shadow-md"
                        >
                          👤
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-end gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm shadow-md">
                      🤖
                    </div>
                    <div className="bg-slate-100 px-4 py-2 rounded-2xl flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* User Info Form */}
            {phase === 'userInfo' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border-t bg-white"
              >
                <form onSubmit={handleUserInfoSubmit} className="space-y-3">
                  <Input
                    className="py-2 px-3 rounded-xl text-sm border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    placeholder="Your Full Name *"
                    value={userInfo.name}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                  <Input
                    className="py-2 px-3 rounded-xl text-sm border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    type="email"
                    placeholder="Your Email Address *"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                  <Input
                    className="py-2 px-3 rounded-xl text-sm border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    type="tel"
                    placeholder="Your Phone Number (Optional)"
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                  />
                  <Button 
                    type="submit" 
                    className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Get My Results 🎉
                  </Button>
                </form>
              </motion.div>
            )}

            {/* Results Section */}
            {phase === 'results' && quizResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border-t bg-white overflow-y-auto"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {getSeverityIcon(quizResult.severity)}
                    <div>
                      <h4 className="font-bold text-slate-800">Your Results</h4>
                      <p className="text-sm text-slate-600">Based on your responses</p>
                    </div>
                  </div>

                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-slate-700">Your Score</span>
                      <span className="text-blue-600 font-bold">{quizResult.score} / {quiz.maxScore}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, Math.round((quizResult.score / quiz.maxScore) * 100))}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                      />
                    </div>
                  </motion.div>

                  <div className="space-y-3">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h5 className="text-sm font-semibold text-slate-800 mb-1">Interpretation</h5>
                      <p className="text-sm text-slate-700 leading-relaxed">{quizResult.interpretation}</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h5 className="text-sm font-semibold text-slate-800 mb-1">Summary</h5>
                      <p className="text-sm text-slate-700 leading-relaxed">{quizResult.summary}</p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 