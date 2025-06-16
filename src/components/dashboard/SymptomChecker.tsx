import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Loader2, ArrowRight, Brain, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function SymptomChecker() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 Hello! I'm your ENT Symptom Checker. I can help identify your symptoms and recommend the most appropriate assessment for your needs.\n\nPlease describe the symptoms you're experiencing, and I'll guide you to the right assessment.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendedQuiz, setRecommendedQuiz] = useState<string | null>(null);
  const [quizDescription, setQuizDescription] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Simulate AI response with symptom analysis
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check for keywords to determine which quiz to recommend
      const lowerCaseInput = userMessage.toLowerCase();
      
      let quiz = null;
      let description = '';
      
      if (lowerCaseInput.includes('nose') || lowerCaseInput.includes('nasal') || lowerCaseInput.includes('breathing') || lowerCaseInput.includes('congestion')) {
        quiz = 'NOSE';
        description = 'The NOSE (Nasal Obstruction Symptom Evaluation) assessment is designed to evaluate nasal breathing difficulties and obstruction.';
      } else if (lowerCaseInput.includes('sinus') || lowerCaseInput.includes('facial pain') || lowerCaseInput.includes('pressure')) {
        quiz = 'SNOT22';
        description = 'The SNOT-22 (Sino-Nasal Outcome Test) is a comprehensive assessment for sinus and nasal symptoms, including facial pain/pressure.';
      } else if (lowerCaseInput.includes('sleep') || lowerCaseInput.includes('tired') || lowerCaseInput.includes('snore') || lowerCaseInput.includes('apnea')) {
        quiz = 'STOP';
        description = 'The STOP-BANG questionnaire screens for sleep apnea risk factors and sleep-disordered breathing.';
      } else if (lowerCaseInput.includes('dizzy') || lowerCaseInput.includes('vertigo') || lowerCaseInput.includes('balance')) {
        quiz = 'DHI';
        description = 'The DHI (Dizziness Handicap Inventory) evaluates how dizziness and balance issues affect your daily life.';
      } else if (lowerCaseInput.includes('hear') || lowerCaseInput.includes('ear') || lowerCaseInput.includes('deaf')) {
        quiz = 'HHIA';
        description = 'The HHIA (Hearing Handicap Inventory for Adults) assesses the impact of hearing difficulties on your daily life.';
      } else if (lowerCaseInput.includes('sleepy') || lowerCaseInput.includes('daytime') || lowerCaseInput.includes('tired')) {
        quiz = 'EPWORTH';
        description = 'The Epworth Sleepiness Scale measures your general level of daytime sleepiness and can help identify sleep disorders.';
      } else if (lowerCaseInput.includes('allergy') || lowerCaseInput.includes('sneeze') || lowerCaseInput.includes('runny')) {
        quiz = 'TNSS';
        description = 'The TNSS (Total Nasal Symptom Score) evaluates nasal allergy symptoms like congestion, runny nose, and sneezing.';
      }
      
      setRecommendedQuiz(quiz);
      setQuizDescription(description);
      
      let responseContent = '';
      
      if (quiz) {
        responseContent = `Based on your symptoms, I recommend taking the ${quiz} assessment. ${description}\n\nWould you like to take this assessment now?`;
      } else {
        responseContent = "I need a bit more information about your symptoms to recommend the right assessment. Could you please tell me more about what you're experiencing? For example:\n\n- Where are your symptoms located?\n- How long have you had them?\n- Are they constant or do they come and go?\n- What makes them better or worse?";
      }
      
      const aiMessage: Message = {
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Sorry, I encountered an error. Please try again.');
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try asking your question again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTakeQuiz = () => {
    if (recommendedQuiz) {
      navigate(`/quiz?type=${recommendedQuiz}&mode=single`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg overflow-hidden">
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Symptom Checker</h1>
            <p className="text-sm text-gray-500">Describe your symptoms to find the right assessment</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                }`}>
                  {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-3 rounded-2xl shadow-sm ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 rounded-bl-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
          
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 rounded-2xl rounded-bl-none bg-white border border-gray-200 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-sm text-gray-600">Analyzing symptoms...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {recommendedQuiz && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  Recommended Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{recommendedQuiz} Assessment</h3>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    Recommended
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">{quizDescription}</p>
                <Button 
                  onClick={handleTakeQuiz}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Take {recommendedQuiz} Assessment
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Describe your symptoms (e.g., nasal congestion, difficulty breathing)..."
            disabled={loading}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          This symptom checker is for informational purposes only and does not provide medical advice.
        </p>
      </div>
    </div>
  );
}