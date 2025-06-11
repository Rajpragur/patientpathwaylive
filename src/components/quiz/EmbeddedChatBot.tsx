
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QuizType } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface EmbeddedChatBotProps {
  quizType: string;
  quizData: any;
  shareKey?: string;
  doctorId?: string;
  customQuiz?: any;
}

interface Message {
  text: string;
  type: 'bot' | 'user' | 'question' | 'error';
  question?: any;
  options?: string[];
}

function EmbeddedChatBot({ quizType, quizData, shareKey, doctorId }: EmbeddedChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadInfo, setLeadInfo] = useState({ name: '', email: '', phone: '' });
  const [showLeadForm, setShowLeadForm] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const [extractedShareKey, setExtractedShareKey] = useState<string | null>(shareKey || searchParams.get('key'));
  const [extractedDoctorId, setExtractedDoctorId] = useState<string | null>(doctorId || searchParams.get('doctor'));
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [doctorProfile, setDoctorProfile] = useState<any>(null);

  useEffect(() => {
    if (quizData && quizData.questions && quizData.questions.length > 0) {
      setMessages([{
        text: quizData.description || `Let's start with the ${quizData.title} assessment!`,
        type: 'bot'
      }, {
        text: quizData.questions[0].text,
        type: 'question',
        question: quizData.questions[0],
        options: quizData.questions[0].options
      }]);
    }
  }, [quizData]);

  // Fetch doctor profile for avatar
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (extractedDoctorId) {
        try {
          const { data } = await supabase
            .from('doctor_profiles')
            .select('*')
            .eq('id', extractedDoctorId)
            .single();
          
          if (data) {
            setDoctorProfile(data);
          }
        } catch (error) {
          console.error('Error fetching doctor profile:', error);
        }
      }
    };

    fetchDoctorProfile();
  }, [extractedDoctorId]);

  const submitLead = useCallback(async () => {
    if (!leadInfo.name || !leadInfo.email) {
      toast.error('Please provide your name and email.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('quiz_leads')
        .insert({
          quiz_type: quizType,
          custom_quiz_id: quizData.isCustom ? quizData.id : null,
          name: leadInfo.name,
          email: leadInfo.email,
          phone: leadInfo.phone,
          answers: userAnswers,
          score: calculateScore(),
          share_key: extractedShareKey,
          doctor_id: extractedDoctorId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting lead:', error);
        toast.error('Failed to submit lead information.');
        return;
      }

      setLeadSubmitted(true);
      setShowLeadForm(false);
      toast.success('Lead information submitted successfully!');
    } catch (error: any) {
      console.error('Error submitting lead:', error);
      toast.error(error.message || 'Failed to submit lead information.');
    } finally {
      setIsSubmitting(false);
    }
  }, [leadInfo, userAnswers, quizType, quizData, extractedShareKey, extractedDoctorId]);

  const handleAnswer = (answer: string) => {
    setUserAnswers(prev => [...prev, answer]);

    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < quizData.questions.length) {
      const nextQuestion = quizData.questions[nextQuestionIndex];
      setMessages(prevMessages => [
        ...prevMessages,
        { text: answer, type: 'user' },
        {
          text: nextQuestion.text,
          type: 'question',
          question: nextQuestion,
          options: nextQuestion.options
        }
      ]);
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      setMessages(prevMessages => [...prevMessages, { text: answer, type: 'user' }]);
      setIsQuizComplete(true);
      setShowLeadForm(true);
    }
  };

  const calculateScore = () => {
    if (!quizData.scoring) {
      return 'N/A';
    }
  
    let score = 0;
    quizData.questions.forEach((question: any, index: number) => {
      const userAnswer = userAnswers[index];
      if (userAnswer) {
        const correctOption = question.options.find((option: any) => option.correct);
        if (correctOption && userAnswer === correctOption.text) {
          score++;
        }
      }
    });
  
    return score;
  };

  const renderQuestion = (message: Message) => {
    if (!message.question || !message.question.options) {
      return <p className="text-red-500">Error: Question or options are missing.</p>;
    }

    return getQuestionComponent(message.question, message.options);
  };

  const getQuestionComponent = (question: any, options: string[]) => {
    return (
      <div className="space-y-3">
        {options && options.map((option, index) => (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-start rounded-2xl"
            onClick={() => handleAnswer(option)}
          >
            {option}
          </Button>
        ))}
      </div>
    );
  };

  const getDoctorAvatar = () => {
    if (doctorProfile?.avatar_url) {
      return doctorProfile.avatar_url;
    }
    return "/placeholder-doctor.jpg";
  };

  const getDoctorName = () => {
    if (doctorProfile?.first_name && doctorProfile?.last_name) {
      return `Dr. ${doctorProfile.first_name} ${doctorProfile.last_name}`;
    }
    if (doctorProfile?.first_name) {
      return `Dr. ${doctorProfile.first_name}`;
    }
    return "Dr. Assistant";
  };

  const renderMessage = (message: Message, index: number) => {
    const isBot = message.type === 'bot';
    const isUser = message.type === 'user';

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} mb-4`}
      >
        {isBot && (
          <div className="flex-shrink-0">
            <img
              src={getDoctorAvatar()}
              alt={getDoctorName()}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#f7904f]/20"
            />
          </div>
        )}
        
        <div
          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
            isBot
              ? 'bg-white border border-gray-200 text-gray-800 shadow-sm'
              : isUser
              ? 'bg-gradient-to-r from-[#f7904f] to-[#0E7C9D] text-white'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.type === 'question' ? (
            renderQuestion(message)
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.text}
            </p>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto mb-4">
        {messages.map((message, index) => (
          renderMessage(message, index)
        ))}
      </div>

      {isQuizComplete && showLeadForm && !leadSubmitted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4 p-4 bg-white rounded-2xl shadow-md border border-gray-100"
        >
          <h3 className="text-lg font-semibold mb-3">
            Submit Your Information
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Please provide your name and email to receive your assessment results and personalized recommendations.
          </p>
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your Name"
                value={leadInfo.name}
                onChange={(e) => setLeadInfo({ ...leadInfo, name: e.target.value })}
                className="rounded-2xl"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Your Email"
                value={leadInfo.email}
                onChange={(e) => setLeadInfo({ ...leadInfo, email: e.target.value })}
                className="rounded-2xl"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Your Phone Number"
                value={leadInfo.phone}
                onChange={(e) => setLeadInfo({ ...leadInfo, phone: e.target.value })}
                className="rounded-2xl"
              />
            </div>
            <Button
              className="w-full rounded-2xl"
              onClick={submitLead}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </div>
              ) : (
                'Get Your Results'
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {isQuizComplete && leadSubmitted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 bg-green-50 rounded-2xl shadow-md border border-green-200 text-green-800 flex items-center justify-center gap-3"
        >
          <CheckCircle className="w-5 h-5" />
          <p className="text-sm font-medium">
            Thank you! Your assessment has been submitted.
          </p>
        </motion.div>
      )}
    </div>
  );
}

// Named export for compatibility
export { EmbeddedChatBot };

// Default export
export default EmbeddedChatBot;
