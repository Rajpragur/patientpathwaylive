
import { useState, useEffect, useRef } from 'react';
import { QuizType } from '@/types/quiz';
import { quizzes } from '@/data/quizzes';
import { calculateQuizScore } from '@/utils/quizScoring';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  options?: string[];
}

interface ChatBotProps {
  quizType: QuizType;
  doctorId?: string;
  source?: string;
}

export function ChatBot({ quizType, doctorId, source = 'website' }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [answers, setAnswers] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState({ name: '', email: '', phone: '' });
  const [phase, setPhase] = useState<'greeting' | 'quiz' | 'userInfo' | 'results'>('greeting');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quiz = quizzes[quizType];

  useEffect(() => {
    if (messages.length === 0) {
      addBotMessage(
        `Hi! I'm here to help you with the ${quiz.title} assessment. This quick questionnaire will help evaluate your symptoms. Would you like to begin?`,
        ['Yes, let\'s start', 'Maybe later']
      );
    }
  }, [quiz.title]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      if (option === 'Yes, let\'s start') {
        setPhase('quiz');
        setCurrentQuestionIndex(0);
        setTimeout(() => {
          addBotMessage(
            quiz.questions[0].text,
            quiz.questions[0].options
          );
        }, 500);
      } else {
        addBotMessage("No problem! Feel free to come back when you're ready. Have a great day!");
      }
    } else if (phase === 'quiz') {
      const newAnswers = [...answers, {
        questionId: quiz.questions[currentQuestionIndex].id,
        answer: option
      }];
      setAnswers(newAnswers);

      if (currentQuestionIndex < quiz.questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        setTimeout(() => {
          addBotMessage(
            quiz.questions[nextIndex].text,
            quiz.questions[nextIndex].options
          );
        }, 500);
      } else {
        setPhase('userInfo');
        setTimeout(() => {
          addBotMessage("Great! Now I need some contact information to provide you with your results.");
        }, 500);
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

    // Save to database if doctorId is provided
    if (doctorId) {
      try {
        await supabase.from('quiz_leads').insert({
          doctor_id: doctorId,
          name: userInfo.name,
          email: userInfo.email,
          phone: userInfo.phone,
          quiz_type: quizType,
          score: result.score,
          answers: answers,
          lead_source: source
        });
      } catch (error) {
        console.error('Error saving lead:', error);
      }
    }

    addBotMessage(
      `Thank you, ${userInfo.name}! Here are your ${quiz.title} results:\n\nScore: ${result.score}\n\n${result.interpretation}`
    );
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-blue-600 text-white p-4">
        <h2 className="text-xl font-semibold">{quiz.title} Assessment</h2>
        <p className="text-blue-100 text-sm">{quiz.description}</p>
      </div>
      
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.type === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              <p className="text-sm whitespace-pre-line">{message.content}</p>
              {message.options && (
                <div className="mt-2 space-y-1">
                  {message.options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start"
                      onClick={() => handleOptionClick(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {phase === 'userInfo' && (
        <div className="p-4 border-t bg-gray-50">
          <form onSubmit={handleUserInfoSubmit} className="space-y-3">
            <Input
              placeholder="Your Name *"
              value={userInfo.name}
              onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              type="email"
              placeholder="Your Email *"
              value={userInfo.email}
              onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
              required
            />
            <Input
              type="tel"
              placeholder="Your Phone Number"
              value={userInfo.phone}
              onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
            />
            <Button type="submit" className="w-full">
              Get My Results
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
