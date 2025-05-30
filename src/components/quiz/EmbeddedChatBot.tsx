
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
    if (quiz && quiz.questions && quiz.questions.length > 0 && !quizStarted) {
      const welcomeMessage: Message = {
        id: '1',
        text: `Hello! Welcome to the ${quiz.title}. This assessment will help evaluate your symptoms and takes about 5-10 minutes to complete. Are you ready to begin?`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    } else if (!customQuizLoading && !quiz && !quizNotFound) {
      const errorMessage: Message = {
        id: '1',
        text: 'Sorry, I couldn\'t find this assessment. Please contact support if this issue persists.',
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
        text: `Great! Let's begin with question 1 of ${quiz.questions.length}:\n\n${quiz.questions[0].text}`,
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
        const nextQuestionMessage: Message = {
          id: Date.now().toString(),
          text: `Question ${nextIndex + 1} of ${quiz.questions.length}:\n\n${quiz.questions[nextIndex].text}`,
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
          text: "Excellent! You've completed all the questions. Please provide your contact information below to receive your personalized results.",
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
      const quizQuestions = quiz.questions || [];
      const currentMaxScore = quizQuestions.length * 5; // Assuming max 5 points per question
      setMaxScore(currentMaxScore);

      const calculatedScore = calculateQuizScore(quizType as any, userAnswers);
      const scoreValue = typeof calculatedScore === 'object' ? calculatedScore.score : calculatedScore;
      setScore(scoreValue);

      // Convert userAnswers to a plain object format for Supabase
      const answersForDb = userAnswers.map(answer => ({
        questionId: answer.questionId,
        answer: answer.answer
      }));

      const { data, error } = await supabase
        .from('quiz_leads')
        .insert({
          quiz_type: quizType,
          name: userName,
          email: userEmail,
          answers: answersForDb as any,
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
        
        const resultsMessage: Message = {
          id: Date.now().toString(),
          text: `Thank you, ${userName}! Your assessment is complete. Your score: ${scoreValue}/${currentMaxScore}`,
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
          <p>Loading quiz...</p>
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
          <div key={message.id} className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-lg px-4 py-2 ${
              message.sender === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-800 border border-gray-200'
            }`}>
              <p className="text-sm whitespace-pre-line">{message.text}</p>
            </div>
          </div>
        ))}

        {!quizStarted && quiz && quiz.questions && quiz.questions.length > 0 && (
          <div className="flex justify-center mt-4">
            <Button 
              onClick={startQuiz}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Start Assessment
            </Button>
          </div>
        )}

        {quizStarted && !quizCompleted && quiz && quiz.questions && quiz.questions.length > 0 && (
          <div className="mt-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="space-y-2">
                {quiz.questions[currentQuestionIndex]?.options?.map((option: string, index: number) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full text-left justify-start hover:bg-blue-50 hover:border-blue-300"
                    onClick={() => handleOptionClick(option)}
                    disabled={loading}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center mt-4">
            <div className="bg-white rounded-lg px-4 py-2 border border-gray-200">
              <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
              Processing...
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {showCaptureForm && quizCompleted && !leadCaptured && (
        <div className="p-4 bg-white border-t">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Get Your Results</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
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
              <Button 
                onClick={handleSubmitLead} 
                className="bg-blue-500 hover:bg-blue-600" 
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <User className="w-4 h-4 mr-2" />}
                Get My Results
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
