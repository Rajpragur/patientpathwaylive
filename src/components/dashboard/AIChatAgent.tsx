import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Minimize2, Maximize2, Lightbulb, HeadphonesIcon, Bot, User, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function AIChatAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hi! I\'m your AI strategy assistant. I can help you with:\n\n• Business strategy and planning\n• SOPs and best practices\n• Lead management optimization\n• Marketing strategies\n• Technical support\n\nHow can I assist you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      // Handle special commands
      if (newMessage.toLowerCase().includes('nose test embed code') || 
          newMessage.toLowerCase().includes('embed code')) {
        setTimeout(() => {
          const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            content: `Here's the embed code for the NOSE assessment:\n\n\`\`\`html\n<iframe src="${window.location.origin}/embed/quiz/nose" width="100%" height="600" frameborder="0" style="border-radius: 12px;"></iframe>\n\`\`\`\n\nYou can copy this code and paste it into your website to embed the assessment.`,
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botResponse]);
          setIsLoading(false);
        }, 1000);
        return;
      }
      
      if (newMessage.toLowerCase().includes('analytics for facebook') || 
          newMessage.toLowerCase().includes('facebook analytics')) {
        setTimeout(() => {
          const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            content: `To track Facebook analytics for your assessments, I recommend:\n\n1. Add UTM parameters to your assessment links: \`?utm_source=facebook&utm_medium=social&utm_campaign=nose_assessment\`\n\n2. Set up Facebook Pixel on your website to track conversions\n\n3. Create custom conversion events for assessment completions\n\n4. Use the Analytics tab in your dashboard to monitor traffic from Facebook\n\nWould you like me to help you set up any of these tracking methods?`,
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botResponse]);
          setIsLoading(false);
        }, 1000);
        return;
      }

      // Default AI response
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Medical Practice Marketing AI Assistant'
        },
        body: JSON.stringify({
          model: 'google/gemma-2-9b-it:free',
          messages: [
            {
              role: 'system',
              content: `You are an expert AI assistant for medical practices specializing in marketing strategy, SOPs, lead management, and business optimization. Help doctors and medical professionals with:

1. Business strategy and growth planning
2. Standard Operating Procedures (SOPs) development
3. Lead management and patient acquisition strategies
4. Marketing and patient engagement tactics
5. Practice management best practices
6. Technical support for their systems

Provide actionable, professional advice tailored to medical practices. Be concise but thorough. Always consider compliance with healthcare regulations like HIPAA when relevant.

If asked about embed codes, social media, or analytics, provide specific, practical advice for medical practices.`
            },
            ...messages.slice(-5).map(m => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.content
            })),
            {
              role: 'user',
              content: newMessage
            }
          ],
          max_tokens: 500,
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
          onClick={() => setIsOpen(true)}
          className="rounded-full w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-white"
        >
          <div className="flex flex-col items-center">
            <Bot className="w-6 h-6 text-white mb-0.5" />
            <span className="text-xs text-white font-medium">AI</span>
          </div>
        </Button>
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
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
      <Card className={`w-96 shadow-2xl border-0 ${isMinimized ? 'h-16' : 'h-[500px]'} transition-all duration-300 overflow-hidden`}>
        <CardHeader className="p-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bot className="w-6 h-6" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white"></div>
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Marketing AI Assistant</CardTitle>
                <p className="text-xs text-purple-100">Strategy • Support • Growth</p>
              </div>
              <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                <Lightbulb className="w-3 h-3 mr-1" />
                Online
              </Badge>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-7 w-7 p-0 text-white hover:bg-white/20 rounded-full"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 p-0 text-white hover:bg-white/20 rounded-full"
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
              className="flex flex-col h-[436px]"
            >
              <CardContent className="p-0 flex flex-col h-full bg-gradient-to-b from-gray-50 to-white">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl p-3 text-sm shadow-sm ${
                          message.sender === 'user'
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                            : 'bg-white text-gray-800 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.sender === 'bot' && (
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                              <Bot className="w-3 h-3 text-white" />
                            </div>
                          )}
                          {message.sender === 'user' && (
                            <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                              <User className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                            <div className={`text-xs mt-1 opacity-70 ${message.sender === 'user' ? 'text-purple-100' : 'text-gray-500'}`}>
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white rounded-xl p-3 text-sm shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                            <Bot className="w-3 h-3 text-white" />
                          </div>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about strategy, marketing, or get support..."
                      className="flex-1 min-h-[44px] max-h-24 resize-none text-sm border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isLoading}
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 h-11 px-4"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <HeadphonesIcon className="w-3 h-3" />
                    <span>Marketing Strategy & Support</span>
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