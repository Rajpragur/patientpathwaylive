import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Send, RotateCcw, CheckCircle, AlertCircle, Info, ArrowLeft, Bot } from 'lucide-react';
import { quizzes } from '@/data/quizzes';
import { calculateQuizScore } from '@/utils/quizScoring';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { AIAssistant, ImprovedAIAssistant } from './AIAssistant';

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

  // Enhanced source tracking
  const source = searchParams.get('source') || searchParams.get('utm_source') || 'direct';
  const campaign = searchParams.get('campaign') || searchParams.get('utm_campaign') || 'default';
  const medium = searchParams.get('medium') || searchParams.get('utm_medium') || 'web';

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
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f7904f] mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (notFound || !quizData) {
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
    if (questionIndex < quizData.questions.length) {
      const question = quizData.questions[questionIndex];
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Question ${questionIndex + 1} of ${quizData.questions.length}:\n\n${question.text}`,
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
    if (nextQuestionIndex < quizData.questions.length) {
      setTimeout(() => askNextQuestion(nextQuestionIndex), 500);
    } else {
      setTimeout(() => completeQuiz(), 500);
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
      // Use existing scoring for standard quizzes - pass QuizAnswer array
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
        { role: 'assistant', content: '📧 Thank you! Please provide your email address:' }
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
        { role: 'assistant', content: '📱 Great! Finally, please provide your phone number (optional):' }
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
          quiz_type: quizData.isCustom ? `custom_${quizData.id}` : quizData.id,
          score: result.score,
          answers: result.detailedAnswers,
          lead_source: source,
          lead_status: 'NEW',
          doctor_id: doctorId,
          share_key: shareKey,
          incident_source: `${source}-${campaign}-${medium}`
        };

        const { error } = await supabase
          .from('quiz_leads')
          .insert([leadData]);

        if (error) throw error;

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `✅ Perfect! Your information has been saved successfully.\n\nYour assessment is now complete and our medical team has been notified. They will review your results and may contact you for follow-up care if needed.\n\n🤖 In the meantime, I've activated our AI Health Assistant to help answer any questions you might have about your results!`
        }]);

        setCollectingInfo(false);
        setShowAIAssistant(true);
        setInput('');
      } catch (error) {
        console.error('Failed to save results:', error);
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
        content: `Hello! Welcome to the ${quizData.title}. ${quizData.description}\n\nThis assessment will help evaluate your symptoms. Click "Start Assessment" when you're ready to begin.`
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{quizData.title}</h1>
          <p className="text-sm text-gray-600">{quizData.description}</p>
        </div>
        {quizStarted && !quizCompleted && (
          <div className="flex items-center gap-4">
            <Progress 
              value={(currentQuestionIndex / quizData.questions.length) * 100} 
              className="w-32"
            />
            <span className="text-sm text-gray-600">
              {currentQuestionIndex}/{quizData.questions.length}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <Card className={`max-w-[80%] shadow-lg border-0 ${
                message.role === 'user' 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                  : 'bg-white border border-gray-200'
              }`}>
                <CardContent className="p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                  
                  {message.isQuestion && message.options && !quizCompleted && (
                    <div className="mt-4 space-y-2">
                      {message.options.map((option, optionIndex) => (
                        <Button
                          key={optionIndex}
                          variant="outline"
                          className="w-full justify-start text-left h-auto p-3 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 text-gray-900 border-gray-300 transition-all duration-200"
                          onClick={() => handleAnswer(option, optionIndex)}
                        >
                          <span className="mr-2 font-medium text-blue-600">{String.fromCharCode(65 + optionIndex)}.</span>
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
            <Card className="bg-white border-2 border-blue-200 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Assessment Complete - Results Ready
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-700 font-medium">Your Score</p>
                    <p className="text-3xl font-bold text-blue-900">{result.score}</p>
                    <p className="text-sm text-blue-600">out of {quizData.maxScore}</p>
                  </div>
                  <div className={`text-center p-4 rounded-xl border-2 ${getSeverityColor(result.severity)}`}>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      {getSeverityIcon(result.severity)}
                      <p className="text-sm font-bold">Severity Level</p>
                    </div>
                    <p className="font-bold text-lg capitalize">{result.severity}</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-700 font-medium">Questions</p>
                    <p className="text-3xl font-bold text-gray-900">{quizData.questions.length}</p>
                    <p className="text-sm text-gray-600">completed</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                  <h4 className="font-bold mb-2 text-blue-900">📋 Results Summary:</h4>
                  <p className="text-gray-800 leading-relaxed">{result.interpretation}</p>
                </div>

                <div className="flex gap-3">
                  <Button onClick={resetQuiz} className="flex-1" variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retake Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white border-t border-gray-200 p-6 shadow-lg">
          {!quizStarted && !quizCompleted && (
            <Button 
              onClick={startQuiz} 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold rounded-xl shadow-lg"
            >
              🚀 Start Assessment
            </Button>
          )}

          {collectingInfo && (
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder={
                  infoStep === 0 ? "👤 Enter your full name..." :
                  infoStep === 1 ? "📧 Enter your email address..." :
                  "📱 Enter your phone number (optional)..."
                }
                onKeyPress={(e) => e.key === 'Enter' && handleInfoSubmit()}
                className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <Button 
                onClick={handleInfoSubmit}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
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
