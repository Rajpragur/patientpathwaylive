import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { quizzes } from '@/data/quizzes';
import { QuizType } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { calculateQuizScore } from '@/utils/quizScoring';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ChevronRight, Loader2, Mail, Phone, User } from 'lucide-react';

interface QuizAnswer {
  questionIndex: number;
  answerIndex: number;
  answer: string;
}

interface DoctorProfile {
  id: string;
  clinic_name: string;
  doctor_name: string;
  logo_url?: string;
  avatar_url?: string;
  first_name?: string;
  last_name?: string;
}

export function CardQuiz() {
  const { quizId } = useParams<{ quizId: string }>();
  const [searchParams] = useSearchParams();
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submittingLead, setSubmittingLead] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);
  
  // Lead capture form
  const [leadData, setLeadData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const doctorId = searchParams.get('doctor');
  const quizType = quizId?.toUpperCase() as QuizType;
  const quiz = quizType ? quizzes[quizType] : null;

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (doctorId) {
        try {
          const { data, error } = await supabase
            .from('doctor_profiles')
            .select('*')
            .eq('id', doctorId)
            .single();

          if (error) throw error;
          setDoctorProfile(data);
        } catch (error) {
          console.error('Error fetching doctor profile:', error);
        }
      }
      setLoading(false);
    };

    fetchDoctorProfile();
  }, [doctorId]);


  const handleAnswer = (answerIndex: number, answer: string) => {
    setSelectedOption(answerIndex);
    
    // Delay to show the selection before moving to next question
    setTimeout(() => {
      const newAnswer: QuizAnswer = {
        questionIndex: currentQuestion,
        answerIndex,
        answer
      };

      setAnswers(prev => [...prev, newAnswer]);

      // Move to next question or complete quiz
      if (currentQuestion < (quiz?.questions.length || 0) - 1) {
        setDirection(1);
        setTimeout(() => {
          setCurrentQuestion(prev => prev + 1);
          setSelectedOption(null);
        }, 150);
      } else {
        // Calculate quiz result
        const allAnswers = [...answers, newAnswer];
        const result = calculateQuizScore(quizType, allAnswers);
        setQuizResult(result);
        setQuizCompleted(true);
        setShowResults(true);
      }
    }, 200);
  };

  const proceedToLeadCapture = () => {
    setShowResults(false);
    setShowLeadCapture(true);
  };

  const handleLeadSubmit = async () => {
    if (!leadData.name || !leadData.email || !leadData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmittingLead(true);
    try {
      // Submit lead data to quiz_leads table (same as EnhancedChatBot)
      const leadDataToSubmit = {
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        quiz_type: quizType,
        score: quizResult.score,
        answers: answers,
        lead_source: searchParams.get('utm_source') || 'quiz_card',
        lead_status: 'NEW',
        doctor_id: doctorId,
        share_key: null,
      };

      const { error } = await supabase
        .from('quiz_leads')
        .insert(leadDataToSubmit);

      if (error) {
        throw error;
      }
      
      toast.success('Thank you! Your detailed report has been submitted successfully.');
      
      // Reset form and show success state
      setLeadData({ name: '', email: '', phone: '' });
      setShowLeadCapture(false);
      setQuizCompleted(true);
      
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast.error('Failed to submit information. Please try again.');
    } finally {
      setSubmittingLead(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative w-16 h-16 mx-auto mb-4">
            <motion.div 
              className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-800"
              initial={{ opacity: 0.2 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
            />
            <motion.div 
              className="absolute inset-0 rounded-full border-t-4 border-blue-600 dark:border-blue-400"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <p className="text-gray-600 dark:text-gray-300">Loading assessment...</p>
        </motion.div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 flex items-center justify-center">
        <motion.div 
          className="text-center p-8 bg-white dark:bg-gray-900 rounded-xl shadow-xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quiz Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">The requested quiz could not be found.</p>
        </motion.div>
      </div>
    );
  }

  const progress = ((currentQuestion + (quizCompleted ? 1 : 0)) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 flex flex-col items-center justify-center p-4 overflow-hidden">
      <motion.div 
        className="w-full max-w-4xl space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        
        {/* Doctor Header */}
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {doctorProfile ? (
            <>
              {/* Doctor Avatar */}
              <div className="flex flex-col items-center space-y-3">
                {doctorProfile.avatar_url ? (
                  <motion.img 
                    src={doctorProfile.avatar_url} 
                    alt={doctorProfile.doctor_name}
                    className="h-24 w-24 mx-auto object-cover rounded-full border-4 border-white shadow-lg"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  />
                ) : (
                  <motion.div 
                    className="h-24 w-24 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <span className="text-white text-2xl font-bold">
                      {doctorProfile.doctor_name?.charAt(0) || 'Dr'}
                    </span>
                  </motion.div>
                )}
                
                {/* Doctor Name and Clinic */}
                <div className="text-center">
                  <motion.h1 
                    className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    Dr. {doctorProfile.first_name} {doctorProfile.last_name}
                  </motion.h1>
                  <motion.p 
                    className="text-sm md:text-lg text-gray-600 dark:text-gray-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    {doctorProfile.clinic_name}
                  </motion.p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center space-y-2">
              <motion.div 
                className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <span className="text-white text-2xl font-bold">Dr</span>
              </motion.div>
              <motion.h1 
                className="text-lg md:text-xl font-bold text-gray-900 dark:text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                Medical Assessment
              </motion.h1>
              {doctorId && (
                <motion.p 
                  className="text-xs md:text-sm text-gray-500 dark:text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  Doctor ID: {doctorId}
                </motion.p>
              )}
            </div>
          )}
        </motion.div>

        {/* Quiz Card */}
        <Card className="w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-hidden">
          <CardContent className="p-8 md:p-12 w-full">
            <AnimatePresence mode="wait">
              {!quizCompleted ? (
                <motion.div 
                  key="question"
                  className="space-y-8"
                  initial={{ opacity: 0, x: direction * 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Quiz Title */}
                  <div className="text-center">
                    <h2 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{quiz.title}</h2>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">{quiz.description}</p>
                  </div>

                  {/* Question */}
                  <div className="text-center space-y-8">
                    <h3 className="text-lg md:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100 leading-relaxed max-w-3xl mx-auto">
                      {quiz.questions[currentQuestion]?.text}
                    </h3>
                    
                    {/* Options */}
                    <div className="space-y-4 max-w-2xl mx-auto">
                      {quiz.questions[currentQuestion]?.options.map((option, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <Button
                            onClick={() => handleAnswer(index, option)}
                            className={`w-full py-4 md:py-6 px-6 md:px-8 text-sm md:text-lg font-medium rounded-xl transition-all duration-300 flex items-center justify-between ${
                              selectedOption === index 
                                ? 'bg-blue-600 text-white border-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/30' 
                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                            }`}
                            disabled={selectedOption !== null}
                          >
                            <span>{option}</span>
                            {selectedOption === index && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                <CheckCircle className="ml-2 h-5 w-5" />
                              </motion.div>
                            )}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : showResults ? (
                <motion.div 
                  key="results"
                  className="text-center space-y-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="text-6xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1, type: "spring" }}
                  >
                    🎉
                  </motion.div>
                  <h2 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">Assessment Complete!</h2>
                  
                  {/* Results Display */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Your Results</h3>
                    <div className="text-center space-y-3">
                      <div className="text-2xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
                        {quizResult?.score}/{quiz?.maxScore || 100}
                      </div>
                      <div className={`text-sm md:text-lg font-medium px-3 md:px-4 py-2 rounded-full inline-block ${
                        quizResult?.severity === 'severe' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                        quizResult?.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        quizResult?.severity === 'mild' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                        {quizResult?.severity?.charAt(0).toUpperCase() + quizResult?.severity?.slice(1)} Symptoms
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm leading-relaxed">
                        {quizResult?.interpretation}
                      </p>
                    </div>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={proceedToLeadCapture}
                      className="w-full py-3 md:py-4 text-sm md:text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 rounded-xl transition-all duration-300"
                    >
                      Submit Your Results <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div 
                  key="completed"
                  className="text-center space-y-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-4xl md:text-6xl">✅</div>
                  <h2 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">Thank You!</h2>
                  <p className="text-sm md:text-lg text-gray-600 dark:text-gray-300">
                    Your information has been submitted successfully. We'll be in touch soon!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Progress Bar */}
        <motion.div 
          className="w-full space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="relative h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
            <motion.div 
              className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ["0%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </p>
        </motion.div>

        {/* Lead Capture Form */}
        <AnimatePresence>
          {showLeadCapture && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
                <CardContent className="p-6 md:p-8">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white mb-2">Submit your results</h3>
                      <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">Provide your details for proceeding ahead</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200">
                          <User size={18} />
                        </div>
                        <Input
                          type="text"
                          placeholder="Full Name *"
                          value={leadData.name}
                          onChange={(e) => setLeadData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full py-2 md:py-3 pl-10 pr-4 text-sm md:text-lg border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition-all duration-200"
                        />
                      </div>
                      
                      <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200">
                          <Mail size={18} />
                        </div>
                        <Input
                          type="email"
                          placeholder="Email Address *"
                          value={leadData.email}
                          onChange={(e) => setLeadData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full py-2 md:py-3 pl-10 pr-4 text-sm md:text-lg border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition-all duration-200"
                        />
                      </div>
                      
                      <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200">
                          <Phone size={18} />
                        </div>
                        <Input
                          type="tel"
                          placeholder="Phone Number *"
                          value={leadData.phone}
                          onChange={(e) => setLeadData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full py-2 md:py-3 pl-10 pr-4 text-sm md:text-lg border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition-all duration-200"
                        />
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={handleLeadSubmit}
                        disabled={submittingLead}
                        className="w-full py-3 md:py-4 text-sm md:text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 rounded-xl transition-all duration-300 relative overflow-hidden"
                      >
                        <span className={`transition-opacity duration-200 ${submittingLead ? 'opacity-0' : 'opacity-100'} flex items-center justify-center`}>
                          Submit & Get Report <ChevronRight className="ml-2 h-5 w-5" />
                        </span>
                        
                        {submittingLead && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        )}
                        
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          initial={{ x: "-100%" }}
                          animate={{ x: "100%" }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function QuizPage() {
  return <CardQuiz />;
}
