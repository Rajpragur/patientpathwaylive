import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, User, Bot, Loader2, Home, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { quizzes } from '@/data/quizzes';
import { calculateQuizScore } from '@/utils/quizScoring';
import { toast } from 'sonner';

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
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
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

  useEffect(() => {
    const fetchCustomQuiz = async () => {
      if (quizType && quizType.startsWith('custom')) {
        setCustomQuizLoading(true);
        const { data, error } = await supabase
          .from('custom_quizzes')
          .select('*')
          .eq('id', quizType.replace('custom_', ''))
          .single();
        if (data) setCustomQuiz(data);
        setCustomQuizLoading(false);
      }
    };
    fetchCustomQuiz();
  }, [quizType]);

  let quiz: any = null;
  if (quizType && quizType.startsWith('custom')) {
    quiz = customQuiz ? {
      ...customQuiz,
      title: customQuiz.title,
      questions: customQuiz.questions || [],
    } : null;
  } else {
    quiz = quizzes[quizType as keyof typeof quizzes];
  }

  useEffect(() => {
    if (quiz) {
      const welcomeMessage: Message = {
        id: '1',
        text: `Hello! I'm here to help you complete the ${quiz.title}. This assessment will help evaluate your symptoms. Let's get started!`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    } else {
      const errorMessage: Message = {
        id: '1',
        text: 'Sorry, I couldn\'t find this assessment. Please contact support if this issue persists.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([errorMessage]);
    }
  }, [quiz]);

  useEffect(() => {
    // Scroll to bottom on new message
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: userInput,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setUserAnswers([...userAnswers, userInput]);
    setUserInput('');

    if (quiz && currentQuestionIndex < quiz.questions.length) {
      setLoading(true);
      setTimeout(() => {
        const botResponse: Message = {
          id: Date.now().toString(),
          text: quiz.questions[currentQuestionIndex].response,
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

    setLoading(true);
    try {
      const quizQuestions = quiz?.questions || [];
      const currentMaxScore = quizQuestions.reduce((acc, question) => acc + question.options.length, 0);
      setMaxScore(currentMaxScore);

      const calculatedScore = calculateQuizScore(quizType, userAnswers);
      setScore(calculatedScore);

      const { data, error } = await supabase
        .from('quiz_leads')
        .insert([
          {
            quiz_type: quizType,
            name: userName,
            email: userEmail,
            answers: userAnswers,
            score: calculatedScore,
            max_score: currentMaxScore,
            share_key: shareKey || null,
            doctor_id: doctorId || null
          }
        ]);

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
    return <div className="flex items-center justify-center h-full">Loading custom quiz...</div>;
  }

  if (!quiz) {
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
              Home
            </Button>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Assessment Not Found</h1>
            <p className="text-gray-600 mb-4">The requested assessment could not be found.</p>
            <Button onClick={handleGoHome}>
              <Home className="w-4 h-4 mr-2" />
              Go to Home
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
              {quiz.title}
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoHome}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home
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

      {!quizCompleted ? (
        <div className="p-4 bg-white border-t">
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
      ) : (
        <div className="p-4 bg-white border-t">
          {showCaptureForm && !leadCaptured ? (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle> প্রায় শেষ! </CardTitle>
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
      )}
    </div>
  );
}
