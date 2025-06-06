
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
}

export function EmbeddedChatBot({ quizType, shareKey, doctorId, customQuiz, quizData }: EmbeddedChatBotProps) {
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

  // Enhanced source tracking
  const source = searchParams.get('source') || searchParams.get('utm_source') || 'direct';
  const campaign = searchParams.get('campaign') || searchParams.get('utm_campaign') || 'default';
  const medium = searchParams.get('medium') || searchParams.get('utm_medium') || 'web';

  // Set up new color theme
  const orange = '#f97316';
  const teal = '#0f766e';
  const lightBg = '#fef7f0';
  const cardBg = '#ffffff';

  // Add state for post-quiz chat
  const [postQuizChat, setPostQuizChat] = useState([]);
  const [postQuizInput, setPostQuizInput] = useState('');

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: lightBg }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: orange }}></div>
          <p className="text-lg text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (notFound || !quizData) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: lightBg }}>
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Assessment Not Found</h1>
          <p className="text-gray-600 mb-4">The requested assessment could not be found or is no longer available.</p>
          <Button onClick={() => window.location.href = '/'} style={{ backgroundColor: orange, borderColor: orange }}>
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

  const handleInfoSubmit = async () => {
    if (infoStep === 0) {
      if (!userInfo.name.trim()) {
        toast.error('Please enter your name');
        return;
      }
      setInfoStep(1);
      setMessages(prev => [...prev, 
        { role: 'user', content: userInfo.name },
        { role: 'assistant', content: 'Thank you! Please provide your email address (optional):' }
      ]);
      setInput('');
      return;
    }

    if (infoStep === 1) {
      setInfoStep(2);
      setMessages(prev => [...prev, 
        { role: 'user', content: userInfo.email || 'Not provided' },
        { role: 'assistant', content: 'Great! Finally, please provide your phone number (optional):' }
      ]);
      setInput('');
      return;
    }

    if (infoStep === 2) {
      setMessages(prev => [...prev, 
        { role: 'user', content: userInfo.phone || 'Not provided' }
      ]);
      setCollectingInfo(false);
      setInput('');
      
      // Submit lead to database
      await submitLead();
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Thank you ${userInfo.name}! Your assessment results have been saved.\n\n**Your Results:**\n\n**Score:** ${result.score}/${quizData.maxScore}\n**Severity:** ${result.severity.charAt(0).toUpperCase() + result.severity.slice(1)}\n\n**Interpretation:** ${result.interpretation}\n\nA healthcare provider will review your results and may contact you for follow-up care if needed.`
        }, { 
          role: 'assistant', 
          content: 'If you have any questions or want to chat, type below! Or click Retake Quiz to start again.' 
        }]);
      }, 300);
      return;
    }
  };

  const submitLead = async () => {
    if (!doctorId) {
      toast.error('No doctor is associated with this quiz. Please use a valid quiz link.');
      console.error('No doctorId provided for lead insert', { doctorId, shareKey, quizData });
      return;
    }

    setIsSubmittingLead(true);
    
    try {
      console.log('Submitting lead with data:', {
        name: userInfo.name,
        email: userInfo.email || null,
        phone: userInfo.phone || null,
        quiz_type: quizData.isCustom ? `custom_${quizData.id}` : quizData.id,
        score: result.score,
        answers: result.detailedAnswers,
        lead_source: 'website',
        lead_status: 'NEW',
        doctor_id: doctorId,
        share_key: shareKey,
        incident_source: shareKey || 'default'
      });

      const { data, error } = await supabase
        .from('quiz_leads')
        .insert([{
          name: userInfo.name,
          email: userInfo.email || null,
          phone: userInfo.phone || null,
          quiz_type: quizData.isCustom ? `custom_${quizData.id}` : quizData.id,
          score: result.score,
          answers: result.detailedAnswers,
          lead_source: 'website',
          lead_status: 'NEW',
          doctor_id: doctorId,
          share_key: shareKey,
          incident_source: shareKey || 'default'
        }])
        .select();

      if (error) {
        console.error('Supabase lead insert error:', error);
        toast.error('Failed to save results. Please try again or contact support.');
      } else {
        console.log('Lead saved successfully:', data);
        toast.success('Results saved successfully!');
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

  return (
    <div className="flex flex-col h-screen" style={{ background: lightBg }}>
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
        <div>
          <h1 className="text-xl font-bold" style={{ color: teal }}>{quizData.title}</h1>
          <p className="text-sm text-gray-500">{quizData.description}</p>
        </div>
        {quizStarted && !quizCompleted && (
          <div className="flex items-center gap-4">
            <Progress 
              value={(currentQuestionIndex / quizData.questions.length) * 100} 
              className="w-32"
            />
            <span className="text-sm text-gray-500">
              {currentQuestionIndex}/{quizData.questions.length}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-hidden flex flex-col max-w-2xl mx-auto w-full rounded-2xl shadow-lg bg-white" style={{ minHeight: 400 }}>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                <div className="flex items-end gap-2">
                  {message.role === 'assistant' && (
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex-shrink-0">
                      <Bot className="w-7 h-7 bg-white rounded-full border border-gray-200 shadow p-1" style={{ color: teal }} />
                    </motion.div>
                  )}
                  <div
                    className={`rounded-2xl px-5 py-3 max-w-[80%] shadow-md transition-all duration-200 ${
                      message.role === 'user'
                        ? 'text-gray-900 hover:shadow-lg'
                        : 'bg-white border border-gray-200 text-gray-700 hover:shadow-lg'
                    }`}
                    style={message.role === 'user' ? { backgroundColor: `${orange}20`, borderColor: orange } : {}}
                  >
                    <span className="whitespace-pre-wrap text-base leading-relaxed">{message.content}</span>
                    {message.isQuestion && message.options && !quizCompleted && (
                      <div className="mt-4 space-y-2">
                        {message.options.map((option, optionIndex) => (
                          <motion.div
                            key={optionIndex}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left h-auto p-3 rounded-xl border border-gray-200 bg-white text-gray-700 transition-all duration-150"
                              style={{ borderColor: `${teal}40` }}
                              onClick={() => {
                                handleAnswer(option, optionIndex);
                                setInput('');
                              }}
                            >
                              <span className="mr-2 font-medium text-gray-400">{String.fromCharCode(65 + optionIndex)}.</span>
                              {option}
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex-shrink-0">
                      <UserCircle className="w-7 h-7 bg-white rounded-full border border-gray-200 shadow p-1" style={{ color: orange }} />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {showTyping && (
              <motion.div
                key="typing-indicator"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="flex justify-start"
              >
                <div className="flex items-end gap-2">
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex-shrink-0">
                    <Bot className="w-7 h-7 bg-white rounded-full border border-gray-200 shadow p-1" style={{ color: teal }} />
                  </motion.div>
                  <div className="rounded-2xl px-5 py-3 max-w-[80%] shadow-md bg-white border border-gray-200 text-gray-700 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce mr-1" style={{ animationDelay: '0ms' }}></span>
                    <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce mr-1" style={{ animationDelay: '120ms' }}></span>
                    <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '240ms' }}></span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {result && quizCompleted && !collectingInfo && (
            <Card className="rounded-2xl mt-6 border" style={{ borderColor: teal }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: orange }}>
                  <CheckCircle className="w-5 h-5" />
                  Assessment Complete
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-gray-50">
                    <p className="text-sm" style={{ color: teal }}>Your Score</p>
                    <p className="text-2xl font-bold" style={{ color: orange }}>{result.score}/{quizData.maxScore}</p>
                  </div>
                  <div className={`text-center p-4 rounded-lg border ${getSeverityColor(result.severity)}`}>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      {getSeverityIcon(result.severity)}
                      <p className="text-sm font-medium">Severity Level</p>
                    </div>
                    <p className="font-bold capitalize">{result.severity}</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gray-50">
                    <p className="text-sm" style={{ color: teal }}>Questions</p>
                    <p className="text-2xl font-bold" style={{ color: teal }}>{quizData.questions.length}</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gray-50">
                  <h4 className="font-semibold mb-2" style={{ color: orange }}>Results Summary:</h4>
                  <p style={{ color: teal }}>{result.interpretation}</p>
                </div>
                <Button 
                  onClick={resetQuiz} 
                  className="w-full rounded-xl text-white" 
                  style={{ backgroundColor: orange, borderColor: orange }}
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
              style={{ backgroundColor: orange, borderColor: orange }}
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
                  infoStep === 1 ? "Enter your email address (optional)..." :
                  "Enter your phone number (optional)..."
                }
                onKeyDown={handleKeyDown}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-base bg-white shadow focus:ring-2 focus:outline-none transition-all duration-150"
                style={{ focusRingColor: `${orange}40` }}
                disabled={isSubmittingLead}
              />
              <Button 
                onClick={handleInfoSubmit} 
                className="rounded-xl shadow text-white" 
                style={{ backgroundColor: teal, borderColor: teal }}
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
                style={{ focusRingColor: `${orange}40` }}
              />
              <Button 
                onClick={handlePostQuizSend} 
                className="rounded-xl shadow text-white" 
                style={{ backgroundColor: orange, borderColor: orange }}
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
