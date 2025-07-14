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
import { ImprovedAIAssistant } from './ImprovedAIAssistant';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

interface EmbeddedChatBotProps {
  quizType: string;
  shareKey?: string;
  doctorId?: string;
  customQuiz?: any;
  quizData?: any;
  doctorAvatarUrl?: string;
  chatbotColors?: typeof defaultChatbotColors;
}

export function EmbeddedChatBot({ quizType, shareKey, doctorId, customQuiz, quizData, doctorAvatarUrl,chatbotColors }: EmbeddedChatBotProps) {
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
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showTyping, setShowTyping] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [finalDoctorId, setFinalDoctorId] = useState<string | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const colors = chatbotColors || defaultChatbotColors;

  // Enhanced source tracking
  const source = searchParams.get('source') || searchParams.get('utm_source') || 'direct';
  const campaign = searchParams.get('campaign') || searchParams.get('utm_campaign') || 'default';
  const medium = searchParams.get('medium') || searchParams.get('utm_medium') || 'web';


  // Add state for post-quiz chat
  const [postQuizChat, setPostQuizChat] = useState([]);
  const [postQuizInput, setPostQuizInput] = useState('');

  // Add these validation functions at the top of your component
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string) => {
    // Allows formats: (123) 456-7890, 123-456-7890, 1234567890
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phoneRegex.test(phone);
  };

  useEffect(() => {
    if (quizData) {
      setLoading(false);
      setMessages([
        {
          role: 'assistant',
          content: `Hello! Welcome to the ${quizData.title}. ${quizData.description}\n\nThis assessment will help evaluate your symptoms. Click "Start Assessment" when you're ready to begin.`
        }
      ]);
    }
  }, [quizData]);

  useEffect(() => {
    // Get doctor ID from props or URL parameters
    const urlDoctorId = doctorId || searchParams.get('doctor');
    if (urlDoctorId) {
      console.log('Found doctor ID:', urlDoctorId);
      setFinalDoctorId(urlDoctorId);
    } else if (shareKey) {
      // Try to find doctor from share key
      findDoctorByShareKey();
    } else {
      // Fallback to first available doctor
      findFirstDoctor();
    }
  }, [doctorId, shareKey, searchParams]);

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
      console.log('Looking up doctor by share key:', shareKey);
      
      // First try to find in quiz_leads
      const { data: leadData, error: leadError } = await supabase
        .from('quiz_leads')
        .select('doctor_id')
        .eq('share_key', shareKey)
        .maybeSingle();

      if (leadData && !leadError) {
        console.log('Found doctor ID from quiz_leads:', leadData.doctor_id);
        setFinalDoctorId(leadData.doctor_id);
        return;
      }

      // If not found in quiz_leads, try custom_quizzes
      const { data: customData, error: customError } = await supabase
        .from('custom_quizzes')
        .select('doctor_id')
        .eq('share_key', shareKey)
        .maybeSingle();

      if (customData && !customError) {
        console.log('Found doctor ID from custom_quizzes:', customData.doctor_id);
        setFinalDoctorId(customData.doctor_id);
        return;
      }

      // If still not found, use first available doctor
      findFirstDoctor();
    } catch (error) {
      console.error('Error finding doctor by share key:', error);
      findFirstDoctor();
    }
  };

  const findFirstDoctor = async () => {
    try {
      console.log('Finding first available doctor');
      const { data: doctorProfiles } = await supabase
        .from('doctor_profiles')
        .select('id')
        .limit(1);
      
      if (doctorProfiles && doctorProfiles.length > 0) {
        console.log('Using fallback doctor ID:', doctorProfiles[0].id);
        setFinalDoctorId(doctorProfiles[0].id);
      }
    } catch (error) {
      console.error('Error finding first doctor:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: colors.primary	 }}></div>
          <p className="text-lg text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (notFound || !quizData) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: colors.background }}>
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Assessment Not Found</h1>
          <p className="text-gray-600 mb-4">The requested assessment could not be found or is no longer available.</p>
          <Button onClick={() => window.location.href = '/'} style={{ backgroundColor: colors.primary	, borderColor: colors.primary	 }}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const startQuiz = () => {
    setQuizStarted(true);
    setMessages(prev => [...prev, { role: 'user', content: 'Start Assessment' }]);
    setShowTyping(true);
    setTimeout(() => {
      setShowTyping(false);
      askNextQuestion(0);
    }, 700);
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
      setTimeout(() => completeQuiz(), 700);
    }
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
        completeQuiz();
      }, 700);
    }
  };

  const completeQuiz = () => {
    setQuizCompleted(true);
    
    let score = 0;
    let detailedAnswers: any = {};

    if (quizData.isCustom) {
      // Calculate score for custom quiz
      answers.forEach((answer, index) => {
        const question = quizData.questions[answer.questionIndex];
        const selectedOption = question.options?.[answer.answerIndex];
        if (selectedOption && typeof selectedOption.value === 'number') {
          score += selectedOption.value;
        }
        detailedAnswers[question.id || `q${index}`] = {
          question: question.text,
          answer: answer.answer,
          score: selectedOption?.value || 0
        };
      });

      // Calculate severity based on percentage
      const percentage = (score / quizData.maxScore) * 100;
      let severity = 'normal';
      let interpretation = '';

      if (percentage >= quizData.scoring.severe_threshold) {
        severity = 'severe';
        interpretation = 'Your symptoms indicate a severe condition. Please consult with a healthcare provider immediately.';
      } else if (percentage >= quizData.scoring.moderate_threshold) {
        severity = 'moderate';
        interpretation = 'Your symptoms indicate a moderate condition. We recommend scheduling a consultation.';
      } else if (percentage >= quizData.scoring.mild_threshold) {
        severity = 'mild';
        interpretation = 'Your symptoms indicate a mild condition. Consider monitoring or consulting with a healthcare provider.';
      } else {
        interpretation = 'Your symptoms appear to be minimal. Continue monitoring your condition.';
      }

      setResult({ score, interpretation, severity, summary: interpretation, detailedAnswers });
    } else {
      // Use existing scoring for standard quizzes
      const quizResult = calculateQuizScore(quizData.id as any, answers);
      answers.forEach((answer, index) => {
        const question = quizData.questions[answer.questionIndex];
        detailedAnswers[`q${index}`] = {
          question: question.text,
          answer: answer.answer,
          score: answer.answerIndex
        };
      });
      setResult({ ...quizResult, detailedAnswers });
      score = quizResult.score;
    }

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `🎉 Congratulations! You've completed the ${quizData.title}.\n\nTo receive your detailed results and connect with our medical team, please provide your contact information below.`
    }, {
      role: 'assistant',
      content: 'Please enter your full name:'
    }]);

    setCollectingInfo(true);
    setInfoStep(0);
  };

  // Update the handleInfoSubmit function
  const handleInfoSubmit = async () => {
    if (infoStep === 0) {
      if (!userInfo.name.trim()) {
        toast.error('Please enter your name');
        return;
      }
      if (userInfo.name.trim().length < 2) {
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
      if (!userInfo.email.trim()) {
        toast.error('Please enter your email address');
        setMessages(prev => [...prev, 
          { role: 'user', content: userInfo.email },
          { role: 'assistant', content: 'I need your email address to proceed. Please enter a valid email address.' }
        ]);
        return;
      }
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
      if (!userInfo.phone.trim()) {
        toast.error('Please enter your phone number');
        setMessages(prev => [...prev, 
          { role: 'user', content: userInfo.phone },
          { role: 'assistant', content: 'I need your phone number to proceed. Please enter a valid phone number.' }
        ]);
        return;
      }
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
      
      // Submit lead to database
      await submitLead();
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Thank you ${userInfo.name}! Your assessment results have been saved.\n\nYour Results:\n\nScore: ${result.score}/${quizData.maxScore}\nSeverity: ${result.severity.charAt(0).toUpperCase() + result.severity.slice(1)}\n\nInterpretation: ${result.interpretation}\n\nA healthcare provider will review your results and may contact you for follow-up care if needed.`
        }, { 
          role: 'assistant', 
          content: 'If you have any questions or want to chat, type below! Or click Retake Quiz to start again.' 
        }]);
      }, 300);
      return;
    }
  };

  const submitLead = async () => {
    console.log('Starting lead submission process...', {
      finalDoctorId,
      userInfo,
      result,
      quizData
    });

    if (!finalDoctorId) {
      console.error('No doctor ID available for lead submission');
      toast.error('Unable to save results - no doctor associated with this quiz');
      return;
    }

    setIsSubmittingLead(true);
    
    try {
      const leadData = {
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        quiz_type: quizData.isCustom ? `custom_${quizData.id}` : quizData.id.toUpperCase(),
        custom_quiz_id: quizData.isCustom ? quizData.id : null,
        score: result.score,
        answers: result.detailedAnswers,
        lead_source: shareKey ? 'shared_link' : 'website',
        lead_status: 'NEW',
        doctor_id: finalDoctorId,
        share_key: shareKey || null,
        incident_source: shareKey || 'default',
        submitted_at: new Date().toISOString()
      };

      console.log('Submitting lead with data:', leadData);

      // Use the Supabase edge function to submit the lead
      const { data, error } = await supabase.functions.invoke('submit-lead', {
        body: leadData
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      
      console.log('Lead saved successfully via edge function:', data);
      toast.success('Results saved successfully! Your information has been sent to the healthcare provider.');

      // Create notification for the doctor
      if (finalDoctorId) {
        const { error: notificationError } = await supabase
          .from('doctor_notifications')
          .insert([{
            doctor_id: finalDoctorId,
            title: 'New Assessment Completed',
            message: `${userInfo.name} completed a ${quizData.title} assessment with a score of ${result.score}/${quizData.maxScore}`,
            type: 'new_lead'
          }]);

        if (notificationError) {
          console.error('Error creating notification:', notificationError);
        } else {
          console.log('Notification created successfully');
        }
      }

    } catch (error) {
      console.error('Error submitting lead:', error);
      toast.error('Failed to save results. Please try again.');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const handlePostQuizSend = () => {
    if (postQuizInput.trim() === '') return;
    setPostQuizChat(prev => [...prev, { role: 'user', content: postQuizInput }]);
    setMessages(prev => [...prev, { role: 'user', content: postQuizInput }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: "Thank you for your message! A team member will get back to you soon." }]);
    }, 800);
    setPostQuizInput('');
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
      } else if (result && quizCompleted && !collectingInfo) {
        handlePostQuizSend();
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
    setPostQuizChat([]);
    setPostQuizInput('');
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

  // First, let's fix the theme implementation
const theme = {
  colors: {
    primary: '#2563eb',
    secondary: '#f59e0b',
    accent: '#0ea5e9',
    border: '#e2e8f0',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#1e293b'
  }
};

// Fix the renderMessage implementation
const renderMessage = (message: Message, index: number) => (
  <motion.div
    key={index}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`flex items-end gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
  >
    {message.role === 'assistant' && (
      <Avatar className="h-8 w-8 border border-gray-200 shadow-sm">
        <AvatarImage 
          src={doctorProfile?.avatar_url || doctorAvatarUrl || "/placeholder-doctor.jpg"}
          alt={`Dr. ${doctorProfile?.first_name || ''} ${doctorProfile?.last_name || ''}`}
        />
        <AvatarFallback className="bg-white">
          <Bot className="w-4 h-4" style={{ color: theme.colors.primary }} />
        </AvatarFallback>
      </Avatar>
    )}
    
    <div
      className='rounded-2xl px-5 py-3 max-w-[80%] shadow-sm transition-all duration-200'
      style={
        message.role === 'user'
          ? { backgroundColor: colors.userBubble, color: colors.userText }
          : { backgroundColor: colors.botBubble, color: colors.botText }
      }
    >
      <span className="whitespace-pre-wrap text-base leading-relaxed">
        {message.content}
      </span>
      {message.isQuestion && message.options && !quizCompleted && (
        <div className="mt-4 space-y-2">
          {Array.isArray(message.options) && message.options.map((option: any, optionIndex: number) =>
            renderAnswerOption(option, optionIndex, handleAnswer, setInput)
          )}
        </div>
      )}
    </div>

    {message.role === 'user' && (
      <Avatar className="h-8 w-8 border border-gray-200 shadow-sm">
        <AvatarFallback className="bg-white">
          <UserCircle className="w-4 h-4" style={{ color: theme.colors.secondary }} />
        </AvatarFallback>
      </Avatar>
    )}
  </motion.div>
);


// Fix the renderAnswerOption function
const renderAnswerOption = (option: any, index: number, handleAnswer: Function, setInput: Function) => (
  <motion.button
    key={`option-${index}`}
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    onClick={() => {
      handleAnswer(option.text || option, index);
      setInput('');
    }}
    className="w-full p-4 text-left rounded-xl border border-gray-200 
      bg-white hover:border-primary/30 hover:bg-gray-50
      transition-all duration-200 shadow-sm hover:shadow
      flex items-center gap-3"
    style={{ 
      '--tw-border-opacity': 0.5,
      color: theme.colors.primary 
    } as React.CSSProperties}
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

// Remove duplicate theme declarations and conflicting styles
// Remove any references to primary-light, primary-dark etc
// Use the simplified theme object above
  return (
    <div className="flex flex-col h-full max-h-full" style={{ background: colors.background	 }}>
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
                          src={doctorProfile?.avatar_url || doctorAvatarUrl || "/placeholder-doctor.jpg"}
                          alt={`Dr. ${doctorProfile?.first_name || ''} ${doctorProfile?.last_name || ''}`}
                        />
                        <AvatarFallback className="bg-white">
                          <Bot className="w-4 h-4" style={{ color: colors.text	 }} />
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
                    style={message.role === 'user' ? { backgroundColor: colors.userBubble, color: colors.userText , borderColor: colors.primary	 } : {backgroundColor: colors.botBubble, color: colors.botText , borderColor: colors.primary}}
                  >
                    <span className="whitespace-pre-wrap text-base leading-relaxed">{message.content}</span>
                    {message.isQuestion && message.options && !quizCompleted && (
                      <div className="mt-4 space-y-2 w-full">
                        {Array.isArray(message.options) && message.options.map((option: any, optionIndex: number) =>
                          renderAnswerOption(option, optionIndex, handleAnswer, setInput)
                        )}
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex-shrink-0">
                      <UserCircle className="w-7 h-7 bg-white rounded-full border border-gray-200 shadow p-1" style={{ color: colors.primary	 }} />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {showTyping && (
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex-shrink-0">
                <Avatar className="h-8 w-8 border border-gray-200 shadow">
                  <AvatarImage 
                    src={doctorProfile?.avatar_url || doctorAvatarUrl || "/placeholder-doctor.jpg"}
                    alt={`Dr. ${doctorProfile?.first_name || ''} ${doctorProfile?.last_name || ''}`}
                  />
                  <AvatarFallback className="bg-white">
                    <Bot className="w-4 h-4" style={{ color: colors.primary}} />
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            )}
          </AnimatePresence>
          
          {result && quizCompleted && !collectingInfo && (
            <Card className="rounded-2xl mt-6 border" style={{ borderColor: colors.primary	}}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: colors.primary	 }}>
                  <CheckCircle className="w-5 h-5" />
                  Assessment Complete
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-gray-50">
                    <p className="text-sm" style={{ color: colors.primary }}>Your Score</p>
                    <p className="text-2xl font-bold" style={{ color: colors.primary	 }}>{result.score}/{quizData.maxScore}</p>
                  </div>
                  <div className={`text-center p-4 rounded-lg border ${getSeverityColor(result.severity)}`}>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      {getSeverityIcon(result.severity)}
                      <p className="text-sm font-medium">Severity Level</p>
                    </div>
                    <p className="font-bold capitalize">{result.severity}</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gray-50">
                    <p className="text-sm" style={{ color: colors.primary }}>Questions</p>
                    <p className="text-2xl font-bold" style={{ color: colors.primary }}>{quizData.questions.length}</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gray-50">
                  <h4 className="font-semibold mb-2" style={{ color: colors.primary	 }}>Results Summary:</h4>
                  <p style={{ color: colors.primary }}>{result.interpretation}</p>
                </div>
                <Button 
                  onClick={resetQuiz} 
                  className="w-full rounded-xl text-white" 
                  style={{ backgroundColor: colors.primary	, borderColor: colors.primary	 }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake Quiz
                </Button>
              </CardContent>
            </Card>
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
          {!quizStarted && !quizCompleted && (
            <Button 
              onClick={startQuiz} 
              className="w-full rounded-xl text-lg font-semibold transition-all duration-150 shadow-md hover:shadow-lg text-white" 
              style={{ backgroundColor: colors.primary, borderColor: colors.primary	 }}
            >
              Start Assessment
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
                style={{ backgroundColor: colors.primary, borderColor: colors.primary }}
                disabled={isSubmittingLead}
              >
                {isSubmittingLead ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          )}
          
          {result && quizCompleted && !collectingInfo && (
            <div className="flex gap-2">
              <Input
                value={postQuizInput}
                onChange={(e) => setPostQuizInput(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={handleKeyDown}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-base bg-white shadow focus:ring-2 focus:outline-none transition-all duration-150"
              />
              <Button 
                onClick={handlePostQuizSend} 
                className="rounded-xl shadow text-white" 
                style={{ backgroundColor: colors.primary	, borderColor: colors.primary	 }}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {showAIAssistant && result && (
        <ImprovedAIAssistant
          quizTitle={quizData.title}
          score={result.score}
          maxScore={quizData.maxScore}
          severity={result.severity}
          interpretation={result.interpretation}
          onClose={() => setShowAIAssistant(false)}
        />
      )}
    </div>
  );
}

export default EmbeddedChatBot