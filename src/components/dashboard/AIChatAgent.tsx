import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Minimize2, Maximize2, Lightbulb, HeadphonesIcon, Bot, User, CheckCircle2 } from 'lucide-react';
import { TextShimmerWave } from '@/components/ui/text-shimmer-wave';
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from '@/components/ui/expandable-chat';
import { ChatInput } from '@/components/ui/chat-input.tsx';
import { AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function AIChatAgent() {
  const { user } = useAuth();
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
      const { data: conversationHistory, error: conversationError } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('doctor_id', user?.id)
        .order('created_at', { ascending: true });

      if (conversationError) {
        console.error('Error fetching conversation history:', conversationError);
      }

      const messagesForAI = conversationHistory
        ? conversationHistory.map(item => item.message)
        : [];

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

      // Handle quiz link requests
      if (newMessage.toLowerCase().includes('i want a') && newMessage.toLowerCase().includes('quiz share link') && !newMessage.toLowerCase().includes('symptom checker')) {
        const quizName = newMessage.toLowerCase().split('i want a ')[1].split(' quiz share link')[0].trim();
        const assessmentLink = `${window.location.origin}/quiz/${quizName}`;

        setTimeout(() => {
          const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            content: `Here's the share link for the ${quizName} assessment: ${assessmentLink}`,
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botResponse]);
          setIsLoading(false);
        }, 1000);
        return;
      } else if (newMessage.toLowerCase().includes('i want a') && newMessage.toLowerCase().includes('symptom checker quiz share link')) {
        setTimeout(() => {
          const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            content: `Here's the share link for the Symptom Checker assessment: ${window.location.origin}/quiz/symptom-checker`,
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

If asked about embed codes, social media, or analytics, provide specific, practical advice for medical practices.
Also Avoid answering questions unrelated to medical practice marketing or strategy.
Also Please avoid returning a response with ** ** etc. type of formatting.`,
            },
            ...messagesForAI,
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
      const botResponse = data.choices?.[0]?.message?.content || 'I apologize, but I\'m having trouble responding right now. Please try again later.';

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

      // Store the conversation in Supabase
      await supabase
        .from('ai_conversations')
        .insert([
          {
            doctor_id: user?.id,
            message: { role: 'user', content: newMessage }
          },
          {
            doctor_id: user?.id,
            message: { role: 'assistant', content: botResponse }
          }
        ]);

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

  

  return (
    <ExpandableChat position="bottom-right">
      <ExpandableChatHeader className="bg-gradient-to-r from-blue-400 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bot className="w-6 h-6" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white"></div>
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">
                Medical AI Assistant
              </CardTitle>
              <p className="text-xs text-blue-100">
                Strategy • Support • Growth
              </p>
            </div>
            <Badge
              variant="secondary"
              className="text-xs bg-white/20 text-white border-white/30"
            >
              <Lightbulb className="w-3 h-3 mr-1" />
              Online - Talk to the AI
            </Badge>
          </div>
        </div>
      </ExpandableChatHeader>
      <ExpandableChatBody>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-sm ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-purple-400 to-indigo-400 text-white shadow-md'
                    : 'bg-gray-50 text-gray-800 shadow-md border border-gray-200 rounded-2xl'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.sender === 'bot' && (
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {message.sender === 'user' && (
                    <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                    <div
                      className={`text-xs mt-1 opacity-70 ${
                        message.sender === 'user'
                          ? 'text-purple-100'
                          : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl p-4 text-sm shadow-sm border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <TextShimmerWave className="w-24 text-gray-500">
                    Thinking...
                  </TextShimmerWave>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ExpandableChatBody>
      <ExpandableChatFooter className="bg-gray-50">
        <div className="flex gap-2">
          <ChatInput
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about strategy, marketing, or get support..."
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isLoading}
            size="sm"
            className="bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500 h-11 px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          <HeadphonesIcon className="w-3 h-3" />
          <span>Marketing Strategy & Support</span>
        </div>
      </ExpandableChatFooter>
    </ExpandableChat>
  );
}