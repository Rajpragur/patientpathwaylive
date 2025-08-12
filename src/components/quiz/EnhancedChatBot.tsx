import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Send, RotateCcw, CheckCircle, AlertCircle, Info, ArrowLeft, Bot, Loader2, UserCircle } from 'lucide-react';
import { quizzes } from '@/data/quizzes';
import { calculateQuizScore } from '@/utils/quizScoring';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { QuizType } from '@/types/quiz';

const defaultChatbotColors = {
  primary: '#2563eb',
  background: '#ffffff',
  text: '#ffffff',
  userBubble: '#2563eb',
  botBubble: '#f1f5f9',
  userText: '#ffffff',
  botText: '#334155'
};

interface Message {
  role: 'assistant' | 'user';
  content: string;
  isQuestion?: boolean;
  questionIndex?: number;
  options?: string[];
}

interface QuizAnswer {
  questionIndex: number;
  answer: string;
  answerIndex: number;
}

interface EnhancedChatBotProps {
  quizType: QuizType;
  shareKey?: string;
}

export function EnhancedChatBot({ quizType, shareKey }: EnhancedChatBotProps) {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [userInfo, setUserInfo] = useState({ name: '', email: '', phone: '' });
  const [collectingInfo, setCollectingInfo] = useState(false);
  const [infoStep, setInfoStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showTyping, setShowTyping] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [finalDoctorId, setFinalDoctorId] = useState<string | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [chatbotColors, setChatbotColors] = useState(defaultChatbotColors);
  const [dimensions, setDimensions] = useState({ width: '100%', height: '100%' });

  useEffect(() => {
    const primary = searchParams.get('primary');
    const background = searchParams.get('background');
    const text = searchParams.get('text');
    const userBubble = searchParams.get('userBubble');
    const botBubble = searchParams.get('botBubble');
    const userText = searchParams.get('userText');
    const botText = searchParams.get('botText');

    const newColors = { ...defaultChatbotColors };
    if (primary) newColors.primary = `#${primary}`;
    if (background) newColors.background = `#${background}`;
    if (text) newColors.text = `#${text}`;
    if (userBubble) newColors.userBubble = `#${userBubble}`;
    if (botBubble) newColors.botBubble = `#${botBubble}`;
    if (userText) newColors.userText = `#${userText}`;
    if (botText) newColors.botText = `#${botText}`;
    setChatbotColors(newColors);

    const width = searchParams.get('width');
    const height = searchParams.get('height');
    if (width) setDimensions(prev => ({ ...prev, width }));
    if (height) setDimensions(prev => ({ ...prev, height }));

  }, [searchParams]);

  const quizData = quizzes[quizType];

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string) => {
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phoneRegex.test(phone);
  };

  const askNextQuestion = (questionIndex: number) => {
    if (questionIndex < quizData.questions.length) {
      setShowTyping(true);
      setTimeout(() => {
        setShowTyping(false);
        const question = quizData.questions[questionIndex];
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Question ${questionIndex + 1} of ${quizData.questions.length}:\n\n${question.text}`,
          isQuestion: true,
          questionIndex,
          options: question.options
        }]);
        setCurrentQuestionIndex(questionIndex);
      }, 700);
    } else {
      setTimeout(() => completeQuiz(answers), 700);
    }
  };

  useEffect(() => {
    if (quizData && !quizStarted) {
      setLoading(false);
      setMessages([
        {
          role: 'assistant',
          content: `Hello! Welcome to the ${quizData.title}. ${quizData.description}\n\nThis assessment will help evaluate your symptoms. Let's get started.`
        }
      ]);
      // Automatically start the quiz
      setQuizStarted(true);
      askNextQuestion(0);
    }
  }, [quizData, quizStarted]);

  useEffect(() => {
    const urlDoctorId = searchParams.get('doctor');
    if (urlDoctorId) {
      setFinalDoctorId(urlDoctorId);
    } else if (shareKey) {
      findDoctorByShareKey();
    } else {
      findFirstDoctor();
    }
  }, [shareKey, searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const fetchDoctorProfile = async () => {
    if (finalDoctorId) {
      try {
        const { data, error } = await supabase
          .from('doctor_profiles')
          .select('*')
          .eq('id', finalDoctorId)
          .single();
        
        if (error) {
          console.error('Error fetching doctor profile:', error);
          return;
        }
        
        if (data) {
          setDoctorProfile(data);
        } else {
          console.warn('No doctor profile found for ID:', finalDoctorId);
        }
      } catch (error) {
        console.error('Error fetching doctor profile:', error);
      }
    }
  };

  useEffect(() => {
    fetchDoctorProfile();
  }, [finalDoctorId]);

  const findDoctorByShareKey = async () => {
    try {
      const { data: leadData, error: leadError } = await supabase
        .from('quiz_leads')
        .select('doctor_id')
        .eq('share_key', shareKey)
        .maybeSingle();

      if (leadData && !leadError) {
        setFinalDoctorId(leadData.doctor_id);
        return;
      }

      const { data: customData, error: customError } = await supabase
        .from('custom_quizzes')
        .select('doctor_id')
        .eq('share_key', shareKey)
        .maybeSingle();

      if (customData && !customError) {
        setFinalDoctorId(customData.doctor_id);
        return;
      }

      findFirstDoctor();
    } catch (error) {
      console.error('Error finding doctor by share key:', error);
      findFirstDoctor();
    }
  };

  const findFirstDoctor = async () => {
    try {
      const { data: doctorProfiles } = await supabase
        .from('doctor_profiles')
        .select('id')
        .limit(1);
      
      if (doctorProfiles && doctorProfiles.length > 0) {
        setFinalDoctorId(doctorProfiles[0].id);
      }
    } catch (error) {
      console.error('Error finding first doctor:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: chatbotColors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: chatbotColors.primary }}></div>
          <p className="text-lg text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (notFound || !quizData) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: chatbotColors.background }}>
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Assessment Not Found</h1>
          <p className="text-gray-600 mb-4">The requested assessment could not be found or is no longer available.</p>
          <Button onClick={() => window.location.href = '/'} style={{ backgroundColor: chatbotColors.primary, borderColor: chatbotColors.primary }}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const handleStartQuiz = () => {
    // This function is now empty as the quiz starts automatically.
    // It's kept to avoid breaking other parts of the code that might reference it.
  };

  const handleAnswer = (answerText: string, answerIndex: number) => {
    const newAnswer: QuizAnswer = {
      questionIndex: currentQuestionIndex,
      answer: answerText,
      answerIndex
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    setMessages(prev => [...prev, {
      role: 'user',
      content: answerText
    }]);

    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < quizData.questions.length) {
      setShowTyping(true);
      setTimeout(() => {
        setShowTyping(false);
        askNextQuestion(nextQuestionIndex);
      }, 700);
    } else {
      setShowTyping(true);
      setTimeout(() => {
        setShowTyping(false);
        completeQuiz(updatedAnswers);
      }, 700);
    }
  };

  const completeQuiz = (finalAnswers: QuizAnswer[]) => {
    setQuizCompleted(true);
    
    const quizResult = calculateQuizScore(quizType, finalAnswers);
    setResult(quizResult);

    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: `🎉 Congratulations! You've completed the ${quizData.title}. Here are your results. Proceed with submitting details ahead.`
      }
    ]);
  };
  
  const handleInfoSubmit = async () => {
    if (infoStep === 0) {
      if (!userInfo.name.trim() || userInfo.name.trim().length < 2) {
        toast.error('Please enter a valid name (at least 2 characters)');
        return;
      }
      setInfoStep(1);
      setMessages(prev => [...prev, 
        { role: 'user', content: userInfo.name },
        { role: 'assistant', content: 'Thank you! Please provide your email address:' }
      ]);
      setInput('');
      return;
    }

    if (infoStep === 1) {
      if (!isValidEmail(userInfo.email)) {
        toast.error('Invalid email format');
        setMessages(prev => [...prev, 
          { role: 'user', content: userInfo.email },
          { role: 'assistant', content: `"${userInfo.email}" doesn't seem to be a valid email address. Please enter a valid email address (e.g., name@example.com)` }
        ]);
        setInput('');
        return;
      }
      setInfoStep(2);
      setMessages(prev => [...prev, 
        { role: 'user', content: userInfo.email },
        { role: 'assistant', content: 'Great! Finally, please provide your phone number:' }
      ]);
      setInput('');
      return;
    }

    if (infoStep === 2) {
      if (!isValidPhone(userInfo.phone)) {
        toast.error('Invalid phone format');
        setMessages(prev => [...prev, 
          { role: 'user', content: userInfo.phone },
          { role: 'assistant', content: `"${userInfo.phone}" doesn't seem to be a valid phone number. Please enter a number in the format: 123-456-7890 or (123) 456-7890` }
        ]);
        setInput('');
        return;
      }
      setMessages(prev => [...prev, 
        { role: 'user', content: userInfo.phone }
      ]);
      setCollectingInfo(false);
      setInput('');
      
      await submitLead();
    }
  };

  const submitLead = async () => {
    if (!finalDoctorId) {
      toast.error('Unable to save results - no doctor associated with this quiz');
      return;
    }

    setIsSubmittingLead(true);
    
    try {
      const leadData = {
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        quiz_type: quizType,
        score: result.score,
        answers: answers,
        lead_source: searchParams.get('utm_source') || (shareKey ? 'shared_link' : 'website'),
        lead_status: 'NEW',
        doctor_id: finalDoctorId,
        share_key: shareKey || null,
      };

      const { error } = await supabase.from('quiz_leads').insert(leadData);

      if (error) {
        throw error;
      }
      
      toast.success('Results saved successfully! You will receive a follow-up soon.');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Thank you! Your results are now displayed. A team member will get back to you soon.' 
      }]);

    } catch (error) {
      console.error('Error submitting lead:', error);
      toast.error('Failed to save results. Please try again.');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);

    if (collectingInfo) {
      if (infoStep === 0) {
        setUserInfo(prev => ({ ...prev, name: value }));
      } else if (infoStep === 1) {
        setUserInfo(prev => ({ ...prev, email: value }));
      } else if (infoStep === 2) {
        setUserInfo(prev => ({ ...prev, phone: value }));
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (collectingInfo) {
        handleInfoSubmit();
      }
    }
  };

  const resetQuiz = () => {
    setMessages([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setQuizCompleted(false);
    setQuizStarted(false);
    setResult(null);
    setUserInfo({ name: '', email: '', phone: '' });
    setCollectingInfo(false);
    setInfoStep(0);
    setInput('');
    setTimeout(() => {
      setMessages([{
        role: 'assistant',
        content: `Hello! Welcome to the ${quizData.title}. ${quizData.description}\n\nThis assessment will help evaluate your symptoms. Click "Start Assessment" when you're ready to begin.`
      }]);
    }, 100);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'mild': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-teal-600 bg-teal-50 border-teal-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'severe': return <AlertCircle className="w-4 h-4" />;
      case 'moderate': return <AlertCircle className="w-4 h-4" />;
      case 'mild': return <Info className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const renderAnswerOption = (option: any, index: number) => (
    <motion.button
      key={`option-${index}`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => handleAnswer(option.text || option, index)}
      className="w-full p-4 text-left rounded-xl border border-gray-200 
        bg-white hover:border-primary/30 hover:bg-gray-50
        transition-all duration-200 shadow-sm hover:shadow
        flex items-center gap-3"
      style={{ '--tw-border-opacity': 0.5, color: chatbotColors.primary } as React.CSSProperties}
    >
      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100
        flex items-center justify-center text-gray-600 text-sm font-medium">
        {String.fromCharCode(65 + index)}
      </span>
      <span className="flex-1 text-gray-700 font-medium">
        {option.text || option}
      </span>
    </motion.button>
  );

  return (
    <div className="flex flex-col h-full max-h-full" style={{ background: chatbotColors.background, width: dimensions.width, height: dimensions.height }}>
      <div className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full rounded-2xl shadow-lg" style={{ minHeight: 400 }}>
        <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: '100%', minHeight: 0 }}>
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex items-end gap-2 max-w-4xl">
                  {message.role === 'assistant' && (
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex-shrink-0">
                      <Avatar className="h-8 w-8 border border-gray-200 shadow">
                        <AvatarImage 
                          src={doctorProfile?.avatar_url || "/placeholder-doctor.jpg"}
                          alt={`Dr. ${doctorProfile?.first_name || ''} ${doctorProfile?.last_name || ''}`}
                        />
                        <AvatarFallback className="bg-white">
                          <Bot className="w-4 h-4" style={{ color: chatbotColors.text }} />
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                  )}
                  <div
                    className={`rounded-2xl px-5 py-3 max-w-full shadow-md transition-all duration-200 ${
                      message.role === 'user'
                        ? 'text-gray-900 hover:shadow-lg'
                        : 'bg-white border border-gray-200 text-gray-700 hover:shadow-lg'
                    }`}
                    style={message.role === 'user' ? { backgroundColor: chatbotColors.userBubble, color: chatbotColors.userText , borderColor: chatbotColors.primary } : {backgroundColor: chatbotColors.botBubble, color: chatbotColors.botText , borderColor: chatbotColors.primary}}
                  >
                    <span className="whitespace-pre-wrap text-base leading-relaxed">{message.content}</span>
                    {message.isQuestion && message.options && !quizCompleted && (
                      <div className="mt-4 space-y-2 w-full">
                        {Array.isArray(message.options) && message.options.map((option: any, optionIndex: number) =>
                          renderAnswerOption(option, optionIndex)
                        )}
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex-shrink-0">
                      <UserCircle className="w-7 h-7 bg-white rounded-full border border-gray-200 shadow p-1" style={{ color: chatbotColors.primary }} />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {showTyping && (
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex-shrink-0">
                <Avatar className="h-8 w-8 border border-gray-200 shadow">
                  <AvatarImage 
                    src={doctorProfile?.avatar_url || "/placeholder-doctor.jpg"}
                    alt={`Dr. ${doctorProfile?.first_name || ''} ${doctorProfile?.last_name || ''}`}
                  />
                  <AvatarFallback className="bg-white">
                    <Bot className="w-4 h-4" style={{ color: chatbotColors.primary}} />
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            )}
          </AnimatePresence>
          
          {result && quizCompleted && !collectingInfo && (
            <div className="overflow-y-auto">
              <Card className="rounded-2xl mt-6 border" style={{ borderColor: chatbotColors.primary }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: chatbotColors.primary }}>
                    <CheckCircle className="w-5 h-5" />
                    Assessment Complete
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg bg-gray-50">
                      <p className="text-sm" style={{ color: chatbotColors.primary }}>Your Score</p>
                      <p className="text-2xl font-bold" style={{ color: chatbotColors.primary }}>{result.score}/{quizData.maxScore}</p>
                    </div>
                    <div className={`text-center p-4 rounded-lg border ${getSeverityColor(result.severity)}`}>
                      <div className="flex items-center justify-center gap-2 mb-1">
                        {getSeverityIcon(result.severity)}
                        <p className="text-sm font-medium">Severity Level</p>
                      </div>
                      <p className="font-bold capitalize">{result.severity}</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-gray-50">
                      <p className="text-sm" style={{ color: chatbotColors.primary }}>Questions</p>
                      <p className="text-2xl font-bold" style={{ color: chatbotColors.primary }}>{quizData.questions.length}</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50">
                    <h4 className="font-semibold mb-2" style={{ color: chatbotColors.primary }}>Results Summary:</h4>
                    <p style={{ color: chatbotColors.primary }}>{result.interpretation}</p>
                  </div>
                  <Button 
                    onClick={resetQuiz} 
                    className="w-full rounded-xl text-white"
                    style={{ backgroundColor: chatbotColors.primary, borderColor: chatbotColors.primary }}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retake Quiz
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 32 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="p-4 sticky bottom-0 z-10 bg-white/90 backdrop-blur rounded-b-2xl border-t border-gray-200"
        >
          {result && quizCompleted && !collectingInfo && (
            <Button
              onClick={() => {
                setCollectingInfo(true);
                setMessages(prev => [
                  ...prev,
                  {
                    role: 'assistant',
                    content: 'To save your results, please enter your full name:'
                  }
                ]);
              }}
              className="w-full rounded-xl text-white"
              style={{ backgroundColor: chatbotColors.primary, borderColor: chatbotColors.primary }}
            >
              Save My Results
            </Button>
          )}
          {collectingInfo && (
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={
                  infoStep === 0 ? "Enter your full name..." :
                  infoStep === 1 ? "Enter your email (e.g., name@example.com)..." :
                  "Enter your phone (e.g., 123-456-7890)..."
                }
                onKeyDown={handleKeyDown}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-base bg-white shadow focus:ring-2 focus:outline-none transition-all duration-150"
                disabled={isSubmittingLead}
                required
                type={infoStep === 1 ? "email" : infoStep === 2 ? "tel" : "text"}
              />
              <Button 
                onClick={handleInfoSubmit} 
                className="rounded-xl shadow text-white"
                style={{ backgroundColor: chatbotColors.primary, borderColor: chatbotColors.primary }}
                disabled={isSubmittingLead}
              >
                {isSubmittingLead ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
