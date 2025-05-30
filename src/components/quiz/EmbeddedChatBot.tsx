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
  const [showCaptureForm, setShowCaptureForm] = useState(true);
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [showBackButton, setShowBackButton] = useState(true);
  const [customQuiz, setCustomQuiz] = useState<any>(null);
  const [customQuizLoading, setCustomQuizLoading] = useState(false);
  const [quizNotFound, setQuizNotFound] = useState(false);

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
        const standardQuiz = quizzes[quizType as keyof typeof quizzes];
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
    quiz = quizzes[quizType as keyof typeof quizzes];
  }

  console.log('Current quiz object:', quiz);
  console.log('Quiz not found state:', quizNotFound);
  console.log('Custom quiz loading state:', customQuizLoading);

  useEffect(() => {
    if (quiz && quiz.questions && quiz.questions.length > 0) {
      const welcomeMessage: Message = {
        id: '1',
        text: `Hello! I'm here to help you complete the ${quiz.title}. This assessment will help evaluate your symptoms. Let's get started!`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    } else if (!customQuizLoading && !quiz && !quizNotFound) {
      // Only show error if we're not loading and truly have no quiz
      const errorMessage: Message = {
        id: '1',
        text: 'Sorry, I couldn\'t find this assessment. Please contact support if this issue persists.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([errorMessage]);
    }
  }, [quiz, customQuizLoading, quizNotFound]);

  useEffect(() => {
    // Scroll to bottom on new message
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || !quiz || !quiz.questions) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: userInput,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    // Create proper QuizAnswer object
    const currentQuestion = quiz.questions[currentQuestionIndex];
    if (currentQuestion) {
      const newAnswer: QuizAnswer = {
        questionId: currentQuestion.id,
        answer: userInput
      };
      setUserAnswers([...userAnswers, newAnswer]);
    }
    
    setUserInput('');

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setLoading(true);
      setTimeout(() => {
        const botResponse: Message = {
          id: Date.now().toString(),
          text: `Thank you for your answer. Let's continue with the next question.`,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prevMessages => [...prevMessages, botResponse]);
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setLoading(false);
      }, 500);
    } else {
      setQuizCompleted(true);
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
      const quizQuestions = quiz.questions || [];
      const currentMaxScore = quizQuestions.reduce((acc: number, question: any) => acc + (question.options?.length || 0), 0);
      setMaxScore(currentMaxScore);

      const calculatedScore = calculateQuizScore(quizType as any, userAnswers);
      const scoreValue = typeof calculatedScore === 'object' ? calculatedScore.score : calculatedScore;
      setScore(scoreValue);

      // Convert userAnswers to JSON format for Supabase
      const answersJson = userAnswers as any;

      const { data, error } = await supabase
        .from('quiz_leads')
        .insert({
          quiz_type: quizType,
          name: userName,
          email: userEmail,
          answers: answersJson,
          score: scoreValue,
          share_key: shareKey || null,
          doctor_id: doctorId || null
        });

      if (error) {
        console.error('Error saving lead:', error);
        toast.error('Failed to submit your information. Please try again.');
      } else {
        console.log('Lead saved successfully:', data);
        toast.success('Your information has been submitted successfully!');
        setLeadCaptured(true);
        setShowCaptureForm(false);
      }
    } catch (error: any) {
      console.error('Error saving lead:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    window.location.href = '/portal';
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/portal';
    }
  };

  if (customQuizLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading custom quiz...</p>
        </div>
      </div>
    );
  }

  if (quizNotFound || (!quiz && !customQuizLoading)) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {showBackButton && (
          <div className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoHome}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Portal
            </Button>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Assessment Not Found</h1>
            <p className="text-gray-600 mb-4">The requested assessment could not be found.</p>
            <Button onClick={handleGoHome}>
              <Home className="w-4 h-4 mr-2" />
              Go to Portal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {showBackButton && (
        <div className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">
              {quiz?.title || 'Assessment'}
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoHome}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Portal
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div key={message.id} className={`mb-2 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-xl px-4 py-2 ${message.sender === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'}`}>
              {message.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="mb-2 flex justify-start">
            <div className="rounded-xl px-4 py-2 bg-gray-200 text-gray-800">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {!quizCompleted && quiz && quiz.questions && quiz.questions.length > 0 ? (
        <div className="p-4 bg-white border-t">
          <div className="mb-2">
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </p>
            <h3 className="font-medium text-gray-800">
              {quiz.questions[currentQuestionIndex]?.text || 'Loading question...'}
            </h3>
          </div>
          <div className="flex items-center">
            <Input
              type="text"
              placeholder="Type your answer..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="flex-1 rounded-l-md border-r-0"
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button
              onClick={handleSendMessage}
              className="rounded-l-none bg-[#0E7C9D] hover:bg-[#0E7C9D]/90"
              disabled={loading}
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      ) : quizCompleted ? (
        <div className="p-4 bg-white border-t">
          {showCaptureForm && !leadCaptured ? (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Almost There!</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <p className="text-sm text-gray-600">
                  Please provide your name and email to see your results.
                </p>
                <div className="grid gap-2">
                  <label htmlFor="name">Name</label>
                  <Input
                    id="name"
                    placeholder="Your Name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="email">Email</label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your Email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                </div>
                <Button onClick={handleSubmitLead} className="bg-[#0E7C9D] hover:bg-[#0E7C9D]/90" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <User className="w-4 h-4 mr-2" />}
                  Submit
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Your Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Thank you for completing the assessment!
                </p>
                <p className="text-2xl font-bold">
                  Your Score: {score} / {maxScore}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}
    </div>
  );
}
