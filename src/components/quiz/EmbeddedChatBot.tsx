
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Send, RotateCcw, CheckCircle, AlertCircle, Info, ArrowLeft } from 'lucide-react';
import { quizzes } from '@/data/quizzes';
import { calculateQuizScore } from '@/utils/quizScoring';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
}

export function EmbeddedChatBot({ quizType, shareKey, doctorId }: EmbeddedChatBotProps) {
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
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      setLoading(true);
      
      try {
        if (quizType.startsWith('custom_')) {
          const customQuizId = quizType.replace('custom_', '');
          
          const { data: customQuizData, error } = await supabase
            .from('custom_quizzes')
            .select('*')
            .eq('id', customQuizId)
            .single();

          if (error || !customQuizData) {
            setNotFound(true);
            return;
          }

          setCurrentQuiz({
            id: customQuizData.id,
            title: customQuizData.title,
            description: customQuizData.description,
            questions: customQuizData.questions,
            maxScore: customQuizData.max_score,
            scoring: customQuizData.scoring,
            isCustom: true
          });
        } else {
          const standardQuiz = Object.values(quizzes).find(
            quiz => quiz.id.toLowerCase() === quizType.toLowerCase()
          );
          
          if (!standardQuiz) {
            setNotFound(true);
            return;
          }
          
          setCurrentQuiz({
            ...standardQuiz,
            isCustom: false
          });
        }
      } catch (error) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (quizType) {
      fetchQuizData();
    }
  }, [quizType]);

  useEffect(() => {
    if (currentQuiz && !quizStarted && !notFound) {
      setMessages([
        {
          role: 'assistant',
          content: `Hello! Welcome to the ${currentQuiz.title}. ${currentQuiz.description}\n\nThis assessment will help evaluate your symptoms. Click "Start Assessment" when you're ready to begin.`
        }
      ]);
    }
  }, [currentQuiz, quizStarted, notFound]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (notFound || !currentQuiz) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Assessment Not Found</h1>
          <p className="text-gray-600 mb-4">The requested assessment could not be found or is no longer available.</p>
          <Button onClick={() => window.location.href = '/'}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const startQuiz = () => {
    setQuizStarted(true);
    askNextQuestion(0);
  };

  const askNextQuestion = (questionIndex: number) => {
    if (questionIndex < currentQuiz.questions.length) {
      const question = currentQuiz.questions[questionIndex];
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Question ${questionIndex + 1} of ${currentQuiz.questions.length}:\n\n${question.text}`,
        isQuestion: true,
        questionIndex,
        options: question.options
      }]);
      setCurrentQuestionIndex(questionIndex);
    } else {
      completeQuiz();
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
    if (nextQuestionIndex < currentQuiz.questions.length) {
      setTimeout(() => askNextQuestion(nextQuestionIndex), 500);
    } else {
      setTimeout(() => completeQuiz(), 500);
    }
  };

  const completeQuiz = () => {
    setQuizCompleted(true);
    
    let score = 0;
    let detailedAnswers: any = {};

    if (currentQuiz.isCustom) {
      // Calculate score for custom quiz
      answers.forEach((answer, index) => {
        const question = currentQuiz.questions[answer.questionIndex];
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
      const percentage = (score / currentQuiz.maxScore) * 100;
      let severity = 'normal';
      let interpretation = '';

      if (percentage >= currentQuiz.scoring.severe_threshold) {
        severity = 'severe';
        interpretation = 'Your symptoms indicate a severe condition. Please consult with a healthcare provider immediately.';
      } else if (percentage >= currentQuiz.scoring.moderate_threshold) {
        severity = 'moderate';
        interpretation = 'Your symptoms indicate a moderate condition. We recommend scheduling a consultation.';
      } else if (percentage >= currentQuiz.scoring.mild_threshold) {
        severity = 'mild';
        interpretation = 'Your symptoms indicate a mild condition. Consider monitoring or consulting with a healthcare provider.';
      } else {
        interpretation = 'Your symptoms appear to be minimal. Continue monitoring your condition.';
      }

      setResult({ score, interpretation, severity, summary: interpretation, detailedAnswers });
    } else {
      // Use existing scoring for standard quizzes
      const quizResult = calculateQuizScore(currentQuiz.id as any, answers.map(a => a.answerIndex));
      answers.forEach((answer, index) => {
        const question = currentQuiz.questions[answer.questionIndex];
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
      content: `Thank you for completing the ${currentQuiz.title}!\n\nYour score: ${score}/${currentQuiz.maxScore}\n\nTo receive your detailed results, please provide your contact information.`
    }]);

    setCollectingInfo(true);
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
        { role: 'assistant', content: 'Thank you! Please provide your email address:' }
      ]);
      setInput('');
      return;
    }

    if (infoStep === 1) {
      if (!userInfo.email.trim() || !userInfo.email.includes('@')) {
        toast.error('Please enter a valid email address');
        return;
      }
      setInfoStep(2);
      setMessages(prev => [...prev, 
        { role: 'user', content: userInfo.email },
        { role: 'assistant', content: 'Great! Finally, please provide your phone number (optional):' }
      ]);
      setInput('');
      return;
    }

    if (infoStep === 2) {
      setMessages(prev => [...prev, 
        { role: 'user', content: userInfo.phone || 'Not provided' }
      ]);
      
      try {
        const leadData = {
          name: userInfo.name,
          email: userInfo.email,
          phone: userInfo.phone || null,
          quiz_type: currentQuiz.isCustom ? `custom_${currentQuiz.id}` : currentQuiz.id,
          score: result.score,
          answers: result.detailedAnswers,
          lead_source: 'website',
          lead_status: 'NEW',
          doctor_id: doctorId,
          share_key: shareKey,
          incident_source: shareKey || 'default'
        };

        const { error } = await supabase
          .from('quiz_leads')
          .insert([leadData]);

        if (error) throw error;

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Thank you ${userInfo.name}! Your assessment results have been saved.\n\n**Your Results:**\n\n**Score:** ${result.score}/${currentQuiz.maxScore}\n**Severity:** ${result.severity.charAt(0).toUpperCase() + result.severity.slice(1)}\n\n**Interpretation:** ${result.interpretation}\n\nA healthcare provider will review your results and may contact you for follow-up care if needed.`
        }]);

        setCollectingInfo(false);
        setInput('');
      } catch (error) {
        toast.error('Failed to save results. Please try again.');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
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
        content: `Hello! Welcome to the ${currentQuiz.title}. ${currentQuiz.description}\n\nThis assessment will help evaluate your symptoms. Click "Start Assessment" when you're ready to begin.`
      }]);
    }, 100);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'mild': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{currentQuiz.title}</h1>
          <p className="text-sm text-gray-600">{currentQuiz.description}</p>
        </div>
        {quizStarted && !quizCompleted && (
          <div className="flex items-center gap-4">
            <Progress 
              value={(currentQuestionIndex / currentQuiz.questions.length) * 100} 
              className="w-32"
            />
            <span className="text-sm text-gray-600">
              {currentQuestionIndex}/{currentQuiz.questions.length}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <Card className={`max-w-[80%] ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white'}`}>
                <CardContent className="p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                  
                  {message.isQuestion && message.options && !quizCompleted && (
                    <div className="mt-4 space-y-2">
                      {message.options.map((option, optionIndex) => (
                        <Button
                          key={optionIndex}
                          variant="outline"
                          className="w-full justify-start text-left h-auto p-3 bg-white hover:bg-gray-50 text-gray-900 border-gray-300"
                          onClick={() => handleAnswer(option, optionIndex)}
                        >
                          <span className="mr-2 font-medium">{String.fromCharCode(65 + optionIndex)}.</span>
                          {option}
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}

          {result && quizCompleted && !collectingInfo && (
            <Card className="bg-white border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Assessment Complete
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Your Score</p>
                    <p className="text-2xl font-bold text-blue-600">{result.score}/{currentQuiz.maxScore}</p>
                  </div>
                  <div className={`text-center p-4 rounded-lg border ${getSeverityColor(result.severity)}`}>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      {getSeverityIcon(result.severity)}
                      <p className="text-sm font-medium">Severity Level</p>
                    </div>
                    <p className="font-bold capitalize">{result.severity}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Questions</p>
                    <p className="text-2xl font-bold text-gray-600">{currentQuiz.questions.length}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Results Summary:</h4>
                  <p className="text-gray-700">{result.interpretation}</p>
                </div>

                <Button onClick={resetQuiz} className="w-full" variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Take Assessment Again
                </Button>
              </CardContent>
            </Card>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white border-t p-6">
          {!quizStarted && !quizCompleted && (
            <Button onClick={startQuiz} className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white">
              Start Assessment
            </Button>
          )}

          {collectingInfo && (
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder={
                  infoStep === 0 ? "Enter your full name..." :
                  infoStep === 1 ? "Enter your email address..." :
                  "Enter your phone number (optional)..."
                }
                onKeyPress={(e) => e.key === 'Enter' && handleInfoSubmit()}
                className="flex-1"
              />
              <Button onClick={handleInfoSubmit}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
