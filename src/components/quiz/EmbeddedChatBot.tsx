
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface EmbeddedChatBotProps {
  quizType?: string;
  onQuizStart?: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function EmbeddedChatBot({ 
  quizType = 'general', 
  onQuizStart,
  isOpen = false,
  onToggle 
}: EmbeddedChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello! I'm here to help you with your ${quizType} assessment. Feel free to ask me any questions about the process or your symptoms.`,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Medical Assessment Assistant'
        },
        body: JSON.stringify({
          model: 'google/gemma-2-9b-it:free',
          messages: [
            {
              role: 'system',
              content: `You are a helpful medical assessment assistant for ${quizType} evaluations. Provide supportive, informative responses about symptoms and the assessment process. Keep responses concise and empathetic. Always remind users that this is not a substitute for professional medical advice.`
            },
            ...messages.filter(m => m.sender === 'user').slice(-3).map(m => ({
              role: 'user' as const,
              content: m.content
            })),
            {
              role: 'user',
              content: newMessage
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const botResponse = data.choices?.[0]?.message?.content || 'I apologize, but I\'m having trouble responding right now. Please try again.';

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I\'m experiencing technical difficulties. Please try again later.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={onToggle}
          className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Card className={`w-80 shadow-xl border-0 ${isMinimized ? 'h-14' : 'h-96'} transition-all duration-300`}>
        <CardHeader className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <CardTitle className="text-sm font-medium">Medical Assistant</CardTitle>
              <Badge variant="secondary" className="text-xs bg-blue-500 text-white">
                Online
              </Badge>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0 text-white hover:bg-blue-500"
              >
                {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="h-6 w-6 p-0 text-white hover:bg-blue-500"
              >
                ✕
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="p-0 flex flex-col h-80">
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-2 text-sm ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.sender === 'bot' && <Bot className="w-4 h-4 mt-0.5 text-blue-600" />}
                          {message.sender === 'user' && <User className="w-4 h-4 mt-0.5" />}
                          <span>{message.content}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-blue-600" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="p-3 border-t">
                  <div className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about your assessment..."
                      className="flex-1 min-h-[38px] max-h-20 resize-none text-sm"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isLoading}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
