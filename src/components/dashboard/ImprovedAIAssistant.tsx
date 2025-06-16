import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Loader2, MessageCircle, X } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ImprovedAIAssistantProps {
  quizTitle: string;
  score: number;
  maxScore: number;
  severity: string;
  interpretation: string;
  onClose?: () => void;
}

export function ImprovedAIAssistant({ 
  quizTitle, 
  score, 
  maxScore, 
  severity, 
  interpretation, 
  onClose 
}: ImprovedAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial AI greeting with results
    const initialMessage: Message = {
      role: 'assistant',
      content: `🎯 **Assessment Complete!**\n\n**${quizTitle}**\nScore: ${score}/${maxScore}\nSeverity: ${severity.toUpperCase()}\n\n${interpretation}\n\n👋 Hi! I'm your Marketing AI assistant. I can help with:\n\n• Business strategy and planning\n• SOPs and best practices\n• Lead management optimization\n• Marketing strategies\n• Technical support\n\nGot any questions? Ask me anything - I'll be here to help with your marketing and business needs!`,
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, [quizTitle, score, maxScore, severity, interpretation]);

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
      // Handle special commands
      if (userMessage.toLowerCase().includes('nose test embed code') || 
          userMessage.toLowerCase().includes('embed code')) {
        setTimeout(() => {
          const aiMessage: Message = {
            role: 'assistant',
            content: `Here's the embed code for the NOSE assessment:\n\n\`\`\`html\n<iframe src="${window.location.origin}/embed/quiz/nose" width="100%" height="600" frameborder="0" style="border-radius: 12px;"></iframe>\n\`\`\`\n\nYou can copy this code and paste it into your website to embed the assessment.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
          setLoading(false);
        }, 1000);
        return;
      }
      
      if (userMessage.toLowerCase().includes('analytics for facebook') || 
          userMessage.toLowerCase().includes('facebook analytics')) {
        setTimeout(() => {
          const aiMessage: Message = {
            role: 'assistant',
            content: `To track Facebook analytics for your assessments, I recommend:\n\n1. Add UTM parameters to your assessment links: \`?utm_source=facebook&utm_medium=social&utm_campaign=nose_assessment\`\n\n2. Set up Facebook Pixel on your website to track conversions\n\n3. Create custom conversion events for assessment completions\n\n4. Use the Analytics tab in your dashboard to monitor traffic from Facebook\n\nWould you like me to help you set up any of these tracking methods?`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
          setLoading(false);
        }, 1000);
        return;
      }

      // Default AI response
      const response = await fetch('/functions/v1/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: {
            quizTitle,
            score,
            maxScore,
            severity,
            interpretation
          },
          messages: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Assistant error:', error);
      toast.error('Sorry, I encountered an error. Please try again.');
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try asking your question again, or feel free to contact our team directly.',
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

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'severe': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'mild': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Marketing AI Assistant</h3>
                <p className="text-blue-100 text-sm">Strategy & Support</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="text-white hover:bg-white/20 p-1 h-8 w-8"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 p-1 h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={`${getSeverityColor(severity)} border text-xs font-medium`}>
              {severity.charAt(0).toUpperCase() + severity.slice(1)} Symptoms
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
              Score: {score}/{maxScore}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  }`}>
                    {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-3 rounded-2xl shadow-sm ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-md' 
                      : 'bg-white border border-gray-200 rounded-bl-md'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3 rounded-2xl rounded-bl-md bg-white border border-gray-200 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about strategy, SOPs, or get support..."
                disabled={loading}
                className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <Button 
                onClick={sendMessage} 
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-4"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              💬 Ask about marketing strategies, SOPs, or technical support!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}