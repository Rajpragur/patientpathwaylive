
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, User, Bot, Loader2, Home, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { quizzes } from '@/data/quizzes';
import { calculateQuizScore } from '@/utils/quizScoring';
import { toast } from 'sonner';
import { QuizAnswer } from '@/types/quiz';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface EmbeddedChatBotProps {
  quizType: string;
  shareKey?: string;
  doctorId?: string;
}

export function EmbeddedChatBot({ quizType, shareKey, doctorId }: EmbeddedChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<QuizAnswer[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [showCaptureForm, setShowCaptureForm] = useState(false);
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [showBackButton, setShowBackButton] = useState(true);
  const [customQuiz, setCustomQuiz] = useState<any>(null);
  const [customQuizLoading, setCustomQuizLoading] = useState(false);
  const [quizNotFound, setQuizNotFound] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    const fetchQuizData = async () => {
      console.log('Fetching quiz data for quizType:', quizType);
      
      if (quizType && quizType.startsWith('custom_')) {
        setCustomQuizLoading(true);
        const customQuizId = quizType.replace('custom_', '');
        console.log('Fetching custom quiz with ID:', customQuizId);
        
        try {
          const { data, error } = await supabase
            .from('custom_quizzes')
            .select('*')
            .eq('id', customQuizId)
            .single();
          
          console.log('Custom quiz fetch result:', { data, error });
          
          if (error) {
            console.error('Error fetching custom quiz:', error);
            setQuizNotFound(true);
          } else if (data) {
            setCustomQuiz(data);
            console.log('Custom quiz loaded:', data);
          } else {
            console.log('No custom quiz found');
            setQuizNotFound(true);
          }
        } catch (error) {
          console.error('Exception fetching custom quiz:', error);
          setQuizNotFound(true);
        } finally {
          setCustomQuizLoading(false);
        }
      } else {
        // Check if it's a valid standard quiz
        const standardQuiz = quizzes[quizType.toUpperCase() as keyof typeof quizzes];
        console.log('Standard quiz lookup for', quizType, ':', standardQuiz);
        
        if (!standardQuiz) {
          console.log('Standard quiz not found for type:', quizType);
          setQuizNotFound(true);
        }
      }
    };

    fetchQuizData();
  }, [quizType]);

  // Determine the current quiz object
  let quiz: any = null;
  if (quizType && quizType.startsWith('custom_')) {
    quiz = customQuiz ? {
      ...customQuiz,
      title: customQuiz.title,
      questions: customQuiz.questions || [],
    } : null;
  } else {
    quiz = quizzes[quizType.toUpperCase() as keyof typeof quizzes];
  }

  // Set max score based on quiz type
  useEffect(() => {
    if (quiz && quiz.questions) {
      let calculatedMaxScore = 0;
      
      if (quizType.toLowerCase() === 'nose') {
        calculatedMaxScore = 100; // NOSE max score is 100
      } else if (quizType.toLowerCase() === 'snot22') {
        calculatedMaxScore = quiz.questions.length * 5; // SNOT-22: 5 points per question
      } else if (quiz.maxScore) {
        calculatedMaxScore = quiz.maxScore;
      } else {
        calculatedMaxScore = quiz.questions.length * 5; // Default: 5 points per question
      }
      
      setMaxScore(calculatedMaxScore);
    }
  }, [quiz, quizType]);

  console.log('Current quiz object:', quiz);
  console.log('Quiz not found state:', quizNotFound);
  console.log('Custom quiz loading state:', customQuizLoading);

  useEffect(() => {
    if (quiz && quiz.questions && quiz.questions.length > 0 && !quizStarted) {
      const welcomeMessage: Message = {
        id: '1',
        text: `🎯 Welcome to the **${quiz.title}**!\n\nThis assessment helps evaluate your symptoms and takes about 5-10 minutes to complete.\n\n📋 **${quiz.questions.length} questions** • ⏱️ **5-10 minutes** • 📊 **Instant results**\n\nAre you ready to begin?`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    } else if (!customQuizLoading && !quiz && !quizNotFound) {
      const errorMessage: Message = {
        id: '1',
        text: '❌ Sorry, I couldn\'t find this assessment. Please contact support if this issue persists.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([errorMessage]);
    }
  }, [quiz, customQuizLoading, quizNotFound, quizStarted]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startQuiz = () => {
    setQuizStarted(true);
    if (quiz && quiz.questions && quiz.questions.length > 0) {
      const firstQuestionMessage: Message = {
        id: Date.now().toString(),
        text: `🚀 **Question ${currentQuestionIndex + 1} of ${quiz.questions.length}**\n\n${quiz.questions[0].text}`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, firstQuestionMessage]);
    }
  };

  const handleOptionClick = (option: string) => {
    if (!quiz || !quiz.questions) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: option,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    const currentQuestion = quiz.questions[currentQuestionIndex];
    if (currentQuestion) {
      const newAnswer: QuizAnswer = {
        questionId: currentQuestion.id,
        answer: option
      };
      setUserAnswers(prev => [...prev, newAnswer]);
    }

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setLoading(true);
      setTimeout(() => {
        const nextIndex = currentQuestionIndex + 1;
        const progress = Math.round(((nextIndex + 1) / quiz.questions.length) * 100);
        const nextQuestionMessage: Message = {
          id: Date.now().toString(),
          text: `📊 **Progress: ${progress}%**\n\n🚀 **Question ${nextIndex + 1} of ${quiz.questions.length}**\n\n${quiz.questions[nextIndex].text}`,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, nextQuestionMessage]);
        setCurrentQuestionIndex(nextIndex);
        setLoading(false);
      }, 1000);
    } else {
      setQuizCompleted(true);
      setShowCaptureForm(true);
      setTimeout(() => {
        const completionMessage: Message = {
          id: Date.now().toString(),
          text: "🎉 **Excellent!** You've completed all the questions.\n\nPlease provide your contact information below to receive your personalized results and connect with our medical team.",
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, completionMessage]);
      }, 1000);
    }
  };

  const handleSubmitLead = async () => {
    if (!userName.trim() || !userEmail.trim()) {
      toast.error('Please enter your name and email.');
      return;
    }

    if (!quiz) {
      toast.error('Quiz not found. Cannot submit results.');
      return;
    }

    setLoading(true);
    try {
      const calculatedScore = calculateQuizScore(quizType.toUpperCase() as any, userAnswers);
      const scoreValue = typeof calculatedScore === 'object' ? calculatedScore.score : calculatedScore;
      setScore(scoreValue);

      // Convert userAnswers to a format compatible with Supabase JSONB
      const answersForDb = userAnswers.map(answer => ({
        questionId: answer.questionId,
        answer: answer.answer
      }));

      const { data, error } = await supabase
        .from('quiz_leads')
        .insert({
          quiz_type: quizType.toUpperCase(),
          name: userName,
          email: userEmail,
          phone: userPhone || null,
          answers: answersForDb,
          score: scoreValue,
          share_key: shareKey || null,
          doctor_id: doctorId || null,
          lead_source: shareKey ? 'shared_link' : 'website',
          lead_status: 'NEW'
        });

      if (error) {
        console.error('Error saving lead:', error);
        toast.error('Failed to submit your information. Please try again.');
      } else {
        console.log('Lead saved successfully:', data);
        toast.success('Your information has been submitted successfully!');
        setLeadCaptured(true);
        setShowCaptureForm(false);
        
        const resultsMessage: Message = {
          id: Date.now().toString(),
          text: `🎯 **Thank you, ${userName}!** Your assessment is complete.\n\n📊 **Your Score: ${scoreValue}/${maxScore}**\n\n🔔 Our medical team will review your results and contact you soon with personalized recommendations.`,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, resultsMessage]);
      }
    } catch (error: any) {
      console.error('Error saving lead:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  if (customQuizLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-orange-50 to-green-50">
        <div className="text-center bg-white p-8 rounded-3xl shadow-lg">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-lg font-semibold text-gray-700">Loading your assessment...</p>
        </div>
      </div>
    );
  }

  if (quizNotFound || (!quiz && !customQuizLoading)) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-orange-50 to-green-50">
        {showBackButton && (
          <div className="bg-white shadow-lg border-b px-6 py-4 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoBack}
              className="flex items-center gap-2 border-orange-200 hover:bg-orange-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoHome}
              className="flex items-center gap-2 border-green-200 hover:bg-green-50"
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center bg-white p-8 rounded-3xl shadow-lg max-w-md">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Assessment Not Found</h1>
            <p className="text-gray-600 mb-6">The requested assessment could not be found.</p>
            <Button onClick={handleGoHome} className="bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white px-6 py-3 rounded-2xl">
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-orange-50 to-green-50">
      {showBackButton && (
        <div className="bg-white shadow-lg border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoBack}
              className="flex items-center gap-2 border-orange-200 hover:bg-orange-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
              {quiz?.title || 'Assessment'}
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoHome}
            className="flex items-center gap-2 border-green-200 hover:bg-green-50"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end gap-3 max-w-2xl ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                  message.sender === 'bot' 
                    ? 'bg-gradient-to-r from-orange-500 to-green-500' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-500'
                }`}>
                  {message.sender === 'bot' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div className={`px-6 py-4 rounded-3xl shadow-lg max-w-lg ${
                  message.sender === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                    : 'bg-white text-gray-800 border border-orange-100'
                }`}>
                  <p className="text-sm whitespace-pre-line leading-relaxed font-medium">{message.text}</p>
                </div>
              </div>
            </div>
          ))}

          {!quizStarted && quiz && quiz.questions && quiz.questions.length > 0 && (
            <div className="flex justify-center mt-8">
              <Button 
                onClick={startQuiz}
                className="bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white px-8 py-4 rounded-3xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                🚀 Start Assessment
              </Button>
            </div>
          )}

          {quizStarted && !quizCompleted && quiz && quiz.questions && quiz.questions.length > 0 && (
            <div className="mt-6">
              <div className="bg-white rounded-3xl border-2 border-orange-100 shadow-lg p-6">
                <div className="space-y-3">
                  {quiz.questions[currentQuestionIndex]?.options?.map((option: string, index: number) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full text-left justify-start hover:bg-gradient-to-r hover:from-orange-50 hover:to-green-50 hover:border-orange-300 border-2 border-gray-200 rounded-2xl py-4 px-6 text-gray-700 font-medium transition-all duration-200 hover:shadow-md"
                      onClick={() => handleOptionClick(option)}
                      disabled={loading}
                    >
                      <span className="bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 text-sm font-bold">
                        {index + 1}
                      </span>
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex justify-center mt-6">
              <div className="bg-white rounded-3xl px-6 py-4 border-2 border-orange-100 shadow-lg">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                  <span className="text-gray-700 font-medium">Processing your answer...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>
      </div>

      {showCaptureForm && quizCompleted && !leadCaptured && (
        <div className="p-6 bg-white border-t-2 border-orange-100">
          <div className="max-w-md mx-auto">
            <Card className="shadow-xl border-2 border-orange-100 rounded-3xl">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                  🎯 Get Your Results
                </CardTitle>
                <p className="text-gray-600">Just a few details to receive your personalized assessment results</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name *</label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="rounded-2xl border-2 border-gray-200 focus:border-orange-300 py-3"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address *</label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="rounded-2xl border-2 border-gray-200 focus:border-orange-300 py-3"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number</label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number (optional)"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="rounded-2xl border-2 border-gray-200 focus:border-orange-300 py-3"
                  />
                </div>
                <Button 
                  onClick={handleSubmitLead} 
                  className="w-full bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5 mr-2" />
                      Get My Results 🎉
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
