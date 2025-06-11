import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, RotateCcw, CheckCircle, AlertCircle, Loader2, Bot, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer?: number
}

interface ChatMessage {
  id: string
  type: 'question' | 'answer' | 'system'
  content: string
  timestamp: Date
  questionId?: string
  selectedOption?: number
  isCorrect?: boolean
}

interface QuizChatbotProps {
  questions?: QuizQuestion[]
  onQuizComplete?: (score: number, totalQuestions: number) => void
  showCorrectAnswers?: boolean
  allowRetry?: boolean
}

const defaultQuestions: QuizQuestion[] = [
  {
    id: '1',
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: 2
  },
  {
    id: '2',
    question: 'Which programming language is known for its use in web development?',
    options: ['Python', 'JavaScript', 'C++', 'Java'],
    correctAnswer: 1
  },
  {
    id: '3',
    question: 'What is the largest planet in our solar system?',
    options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 2
  },
  {
    id: '4',
    question: 'Who painted the Mona Lisa?',
    options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Michelangelo'],
    correctAnswer: 2
  }
]

const QuizChatbot: React.FC<QuizChatbotProps> = ({
  questions = defaultQuestions,
  onQuizComplete,
  showCorrectAnswers = true,
  allowRetry = true
}) => {
  // Set up color theme to match EmbeddedChatBot
  const orange = '#f97316'
  const teal = '#0f766e'
  const lightBg = '#fef7f0'
  const cardBg = '#ffffff'

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const initializeChat = async () => {
      setIsLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          type: 'system',
          content: `Welcome to the Quiz! I'll ask you ${questions.length} questions. Let's get started!`,
          timestamp: new Date()
        }
        
        setMessages([welcomeMessage])
        
        setTimeout(() => {
          askQuestion(0)
        }, 1500)
        
        setIsLoading(false)
      } catch (err) {
        setError('Failed to initialize quiz. Please try again.')
        setIsLoading(false)
      }
    }

    initializeChat()
  }, [questions])

  const askQuestion = (questionIndex: number) => {
    if (questionIndex >= questions.length) {
      completeQuiz()
      return
    }

    setIsTyping(true)
    
    setTimeout(() => {
      const question = questions[questionIndex]
      const questionMessage: ChatMessage = {
        id: `question-${question.id}`,
        type: 'question',
        content: question.question,
        timestamp: new Date(),
        questionId: question.id
      }
      
      setMessages(prev => [...prev, questionMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleAnswerSelect = (optionIndex: number) => {
    const currentQuestion = questions[currentQuestionIndex]
    const isCorrect = showCorrectAnswers ? optionIndex === currentQuestion.correctAnswer : undefined
    
    if (isCorrect) {
      setScore(prev => prev + 1)
    }

    const answerMessage: ChatMessage = {
      id: `answer-${currentQuestion.id}-${optionIndex}`,
      type: 'answer',
      content: currentQuestion.options[optionIndex],
      timestamp: new Date(),
      questionId: currentQuestion.id,
      selectedOption: optionIndex,
      isCorrect
    }

    setMessages(prev => [...prev, answerMessage])

    if (showCorrectAnswers && isCorrect !== undefined) {
      setTimeout(() => {
        const feedbackMessage: ChatMessage = {
          id: `feedback-${currentQuestion.id}`,
          type: 'system',
          content: isCorrect 
            ? 'Correct! Well done!' 
            : `Incorrect. The correct answer was: ${currentQuestion.options[currentQuestion.correctAnswer!]}`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, feedbackMessage])
        
        setTimeout(() => {
          setCurrentQuestionIndex(prev => prev + 1)
          askQuestion(currentQuestionIndex + 1)
        }, 2000)
      }, 1000)
    } else {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1)
        askQuestion(currentQuestionIndex + 1)
      }, 1500)
    }
  }

  const completeQuiz = () => {
    setQuizCompleted(true)
    const completionMessage: ChatMessage = {
      id: 'completion',
      type: 'system',
      content: `Quiz completed! You scored ${score} out of ${questions.length} questions.`,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, completionMessage])
    onQuizComplete?.(score, questions.length)
  }

  const resetQuiz = () => {
    setMessages([])
    setCurrentQuestionIndex(0)
    setScore(0)
    setQuizCompleted(false)
    setError(null)
    
    const welcomeMessage: ChatMessage = {
      id: 'welcome-retry',
      type: 'system',
      content: 'Let\'s try again! Ready for the quiz?',
      timestamp: new Date()
    }
    
    setMessages([welcomeMessage])
    
    setTimeout(() => {
      askQuestion(0)
    }, 1500)
  }

  const getCurrentQuestion = () => {
    return questions[currentQuestionIndex]
  }

  const getProgressPercentage = () => {
    return (currentQuestionIndex / questions.length) * 100
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: lightBg }}>
        <Card className="p-8 max-w-md mx-auto text-center rounded-xl shadow-lg border border-gray-200">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: orange }} />
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="rounded-xl shadow-md transition-all duration-200"
            style={{ backgroundColor: teal, borderColor: teal }}
          >
            Try Again
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: lightBg }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-10 rounded-t-2xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                <Bot className="w-5 h-5" style={{ color: teal }} />
              </div>
              <div>
                <h1 className="font-bold text-xl" style={{ color: teal }}>Quiz Bot</h1>
                <p className="text-sm text-gray-500">
                  {quizCompleted 
                    ? 'Quiz Completed' 
                    : `Question ${currentQuestionIndex + 1} of ${questions.length}`
                  }
                </p>
              </div>
            </div>
            
            {!quizCompleted && !isLoading && (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-sm text-gray-500">Progress:</span>
                  <div className="w-32">
                    <Progress 
                      value={getProgressPercentage()} 
                      className="h-2 bg-gray-100"
                      style={{ 
                        '--tw-progress-bar-background': orange 
                      } as React.CSSProperties}
                    />
                  </div>
                </div>
                <Badge 
                  className="bg-white border border-gray-200 text-gray-700 shadow-sm px-3 py-1"
                >
                  Score: {score}/{questions.length}
                </Badge>
              </div>
            )}
          </div>
          
          {!quizCompleted && !isLoading && (
            <div className="mt-3 sm:hidden">
              <Progress 
                value={getProgressPercentage()} 
                className="h-2 bg-gray-100"
                style={{ 
                  '--tw-progress-bar-background': orange 
                } as React.CSSProperties}
              />
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: teal }} />
                <p className="text-gray-500">Initializing quiz...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No messages yet...</p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className={`flex ${message.type === 'answer' ? 'justify-end' : 'justify-start'}`}
                >
                  <ChatMessageComponent 
                    message={message} 
                    teal={teal}
                    orange={orange}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="flex justify-start"
              >
                <div className="flex items-end gap-2">
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex-shrink-0">
                    <Bot className="w-7 h-7 bg-white rounded-full border border-gray-200 shadow p-1" style={{ color: teal }} />
                  </motion.div>
                  <div className="rounded-2xl px-5 py-3 max-w-[80%] shadow-md bg-white border border-gray-200 text-gray-700 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce mr-1" style={{ animationDelay: '0ms' }}></span>
                    <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce mr-1" style={{ animationDelay: '120ms' }}></span>
                    <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce mr-1" style={{ animationDelay: '240ms' }}></span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Answer Options */}
      {!isLoading && !isTyping && !quizCompleted && getCurrentQuestion() && (
        <div className="border-t border-gray-200 bg-white/90 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <p className="text-sm text-gray-500 mb-4">Choose your answer:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {getCurrentQuestion().options.map((option, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left h-auto p-4 rounded-xl border border-gray-200 bg-white text-gray-700 transition-all duration-150 min-h-[60px] hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 shadow-sm"
                      style={{ borderColor: `${teal}40` }}
                      onClick={() => handleAnswerSelect(index)}
                    >
                      <span className="mr-3 font-medium text-gray-400 text-lg">{String.fromCharCode(65 + index)}.</span>
                      <span className="text-left flex-1 font-medium">{option}</span>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Quiz Completion */}
      {quizCompleted && allowRetry && (
        <div className="border-t border-gray-200 bg-white/90 backdrop-blur-sm rounded-b-2xl">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <Card className="rounded-2xl mt-6 border p-6 shadow-lg" style={{ borderColor: teal }}>
                <div className="mb-4">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2" style={{ color: orange }} />
                  <h3 className="text-xl font-bold" style={{ color: teal }}>Quiz Completed!</h3>
                  <p className="text-gray-600 mt-2">
                    Final Score: {score} out of {questions.length} ({Math.round((score / questions.length) * 100)}%)
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                  <div className="text-center p-4 rounded-lg bg-gray-50">
                    <p className="text-sm" style={{ color: teal }}>Your Score</p>
                    <p className="text-2xl font-bold" style={{ color: orange }}>{score}/{questions.length}</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-orange-50 border border-orange-200">
                    <p className="text-sm" style={{ color: teal }}>Percentage</p>
                    <p className="text-2xl font-bold" style={{ color: orange }}>{Math.round((score / questions.length) * 100)}%</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gray-50">
                    <p className="text-sm" style={{ color: teal }}>Questions</p>
                    <p className="text-2xl font-bold" style={{ color: teal }}>{questions.length}</p>
                  </div>
                </div>
                <Button 
                  onClick={resetQuiz} 
                  className="gap-2 rounded-xl text-white shadow-md hover:shadow-lg transition-all duration-200 px-6 py-2"
                  style={{ backgroundColor: orange, borderColor: orange }}
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  )
}

interface ChatMessageProps {
  message: ChatMessage;
  teal: string;
  orange: string;
}

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message, teal, orange }) => {
  return (
    <div className="flex items-end gap-2 max-w-4xl">
      {message.type !== 'answer' && (
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex-shrink-0">
          <Bot className="w-7 h-7 bg-white rounded-full border border-gray-200 shadow p-1" style={{ color: teal }} />
        </motion.div>
      )}
      <div className={`rounded-2xl px-5 py-3 max-w-[85%] sm:max-w-[70%] shadow-md transition-all duration-200 ${
        message.type === 'answer'
          ? 'text-gray-900'
          : message.type === 'system'
          ? 'bg-gray-50 border border-gray-200 text-gray-700'
          : 'bg-white border border-gray-200 text-gray-700'
      }`}
      style={message.type === 'answer' ? { backgroundColor: `${orange}20`, borderColor: orange } : {}}>
        <div className="flex-1">
          <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
          {message.isCorrect !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {message.isCorrect ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-xs font-medium">
                {message.isCorrect ? 'Correct' : 'Incorrect'}
              </span>
            </div>
          )}
        </div>
      </div>
      {message.type === 'answer' && (
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex-shrink-0">
          <UserCircle className="w-7 h-7 bg-white rounded-full border border-gray-200 shadow p-1" style={{ color: orange }} />
        </motion.div>
      )}
    </div>
  );
};

export default function QuizChatbotDemo() {
  return (
    <QuizChatbot
      onQuizComplete={(score, total) => {
        console.log(`Quiz completed with score: ${score}/${total}`)
      }}
    />
  )
}
