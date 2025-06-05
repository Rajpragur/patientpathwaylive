import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Stethoscope, 
  Microscope, 
  Wind, 
  Headphones, 
  Moon, 
  RotateCcw, 
  Bed, 
  Droplet,
  Zap,
  Target,
  Rocket,
  ChevronDown
} from 'lucide-react';

const quizzes = [
  {
    title: 'SNOT-22 Assessment',
    description: 'A comprehensive evaluation tool for chronic rhinosinusitis symptoms. This 22-question assessment measures the impact of nasal and sinus symptoms on your quality of life, including nasal blockage, facial pain, sleep disturbances, and emotional impact. Used by ENT specialists worldwide to track treatment progress and symptom severity.',
    questions: 22,
    maxScore: 110,
    icon: <Stethoscope className="w-12 h-12 text-blue-600" />,
  },
  {
    title: 'SNOT-12 Assessment',
    description: 'A streamlined version of the SNOT-22, focusing on the most critical symptoms of chronic rhinosinusitis. This 12-question assessment provides a quick yet accurate evaluation of nasal and sinus symptoms, making it ideal for routine check-ups and treatment monitoring. Perfect for patients who need regular symptom tracking.',
    questions: 12,
    maxScore: 60,
    icon: <Microscope className="w-12 h-12 text-blue-600" />,
  },
  {
    title: 'NOSE Scale Assessment',
    description: 'The Nasal Obstruction Symptom Evaluation (NOSE) scale is a validated tool for assessing nasal breathing difficulties. This 5-question assessment helps quantify the severity of nasal obstruction and its impact on daily activities, sleep, and exercise. Essential for evaluating treatment effectiveness and surgical outcomes.',
    questions: 5,
    maxScore: 100,
    icon: <Wind className="w-12 h-12 text-blue-600" />,
  },
  {
    title: 'HHIA',
    description: 'The Hearing Handicap Inventory for Adults (HHIA) is a comprehensive 25-question assessment that evaluates the psychosocial impact of hearing loss. It measures emotional and social consequences, helping healthcare providers understand how hearing difficulties affect daily life, relationships, and emotional well-being.',
    questions: 25,
    maxScore: 100,
    icon: <Headphones className="w-12 h-12 text-blue-600" />,
  },
  {
    title: 'Epworth Sleepiness Scale',
    description: 'A widely used 8-question assessment that measures daytime sleepiness and helps identify potential sleep disorders. This scale evaluates your likelihood of falling asleep in various situations, providing valuable insights for diagnosing conditions like sleep apnea, narcolepsy, and other sleep-related disorders.',
    questions: 8,
    maxScore: 24,
    icon: <Moon className="w-12 h-12 text-blue-600" />,
  },
  {
    title: 'DHI',
    description: 'The Dizziness Handicap Inventory (DHI) is a 25-question assessment that evaluates the impact of dizziness and balance problems on daily life. It measures physical, emotional, and functional aspects of dizziness, helping healthcare providers develop targeted treatment plans and track recovery progress.',
    questions: 25,
    maxScore: 100,
    icon: <RotateCcw className="w-12 h-12 text-blue-600" />,
  },
  {
    title: 'STOP-Bang',
    description: 'A concise 8-question screening tool for obstructive sleep apnea (OSA). This assessment evaluates key risk factors including snoring, tiredness, observed apneas, blood pressure, BMI, age, neck circumference, and gender. Essential for early detection and management of sleep-related breathing disorders.',
    questions: 8,
    maxScore: 8,
    icon: <Bed className="w-12 h-12 text-blue-600" />,
  },
  {
    title: 'TNSS',
    description: 'The Total Nasal Symptom Score (TNSS) is a focused 4-question assessment that evaluates the severity of nasal symptoms including congestion, rhinorrhea, sneezing, and nasal itching. This tool helps track symptom changes over time and assess the effectiveness of treatments for allergic and non-allergic rhinitis.',
    questions: 4,
    maxScore: 12,
    icon: <Droplet className="w-12 h-12 text-blue-600" />,
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 150) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  const handleLogin = () => {
    navigate('/auth?mode=login');
  };

  const handleSignup = () => {
    navigate('/auth?mode=signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-auto">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 bg-white/50 backdrop-blur-md border-b border-gray-100 transition-all duration-300 ${
          isScrolled ? 'shadow-lg' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-2 py-4 flex justify-between items-center">
          <div className="flex-1" />
          <div className="flex flex-col items-center">
            <img 
              src="/patient-pathway-logo.jpeg" 
              alt="Patient Pathway" 
              className="h-20 w-auto object-contain rounded-sm shadow-lg mb-2" 
            />
            <span className="text-xl font-semibold bg-gradient-to-r from-[#f7904f] to-[#04748f] bg-clip-text text-transparent">
              Patient Pathway
            </span>
          </div>
          <div className="flex-1 flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  className="bg-gradient-to-r from-[#f7904f] to-[#04748f] hover:from-[#e67f3e] hover:to-[#03657a] text-white px-6 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  Login / Signup
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={handleLogin}
                  className="cursor-pointer focus:bg-[#f7904f]/10 focus:text-[#f7904f]"
                >
                  Login
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleSignup}
                  className="cursor-pointer focus:bg-[#04748f]/10 focus:text-[#04748f]"
                >
                  Sign Up
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-bg.jpg" 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-white/50" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight"
          >
            Qualify the Right Patients
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Patient-friendly and medically accurate quizzes for every ENT condition — made to engage, educate, and empower.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button 
              className="bg-gradient-to-r from-[#f7904f] to-[#04748f] hover:from-[#e67f3e] hover:to-[#03657a] text-white text-lg px-8 py-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={handleLogin}
            >
              Get Started
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features section with better spacing */}
      <section className="py-16 px-6 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-[#f7904f] to-[#04748f] bg-clip-text text-transparent"
          >
            Explore Our Medical Quizzes
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {quizzes.map((quiz, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group relative bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div className="p-8">
                  <div className="flex justify-center mb-6">
                    {React.cloneElement(quiz.icon, { className: "w-12 h-12 text-[#04748f]" })}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">{quiz.title}</h3>
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed">{quiz.description}</p>
                  <div className="flex items-center justify-center space-x-3 text-sm">
                    <span className="bg-[#f7904f]/10 text-[#f7904f] px-4 py-2 rounded-full">
                      {quiz.questions} Questions
                    </span>
                    <span className="bg-[#04748f]/10 text-[#04748f] px-4 py-2 rounded-full">
                      Max Score: {quiz.maxScore}
                    </span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#f7904f]/0 to-[#04748f]/0 group-hover:from-[#f7904f]/5 group-hover:to-[#04748f]/10 transition-all duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quiz selection with better layout */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-[#f7904f] to-[#04748f] bg-clip-text text-transparent"
          >
            Explore Our Medical Quizzes
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {quizzes.map((quiz, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group relative bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div className="p-8">
                  <div className="flex justify-center mb-6">
                    {React.cloneElement(quiz.icon, { className: "w-12 h-12 text-[#04748f]" })}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">{quiz.title}</h3>
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed">{quiz.description}</p>
                  <div className="flex items-center justify-center space-x-3 text-sm">
                    <span className="bg-[#f7904f]/10 text-[#f7904f] px-4 py-2 rounded-full">
                      {quiz.questions} Questions
                    </span>
                    <span className="bg-[#04748f]/10 text-[#04748f] px-4 py-2 rounded-full">
                      Max Score: {quiz.maxScore}
                    </span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#f7904f]/0 to-[#04748f]/0 group-hover:from-[#f7904f]/5 group-hover:to-[#04748f]/10 transition-all duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Quiz Builder Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-[#f7904f] to-[#04748f] rounded-3xl p-12 md:p-16 text-white shadow-2xl"
          >
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-8">Build Your Own Quiz</h2>
              <p className="text-xl text-white/90 mb-12 leading-relaxed">
                Don't see a quiz you need? No problem. Patient Pathway offers a Custom Quiz Builder where you can drag, drop, and define your own questions.
                Whether you want to automate pre-consult screenings or build follow-up forms, it's fast, smart, and deeply integrated with AI assistance.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex justify-center mb-4">
                    <Zap className="w-12 h-12 text-white/90" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-center">Save Time</h3>
                  <p className="text-white/90 text-center">Automate your workflow and reduce manual data entry</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex justify-center mb-4">
                    <Target className="w-12 h-12 text-white/90" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-center">Reduce Errors</h3>
                  <p className="text-white/90 text-center">AI-powered validation ensures accurate data collection</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex justify-center mb-4">
                    <Rocket className="w-12 h-12 text-white/90" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-center">Smart Experience</h3>
                  <p className="text-white/90 text-center">Build engaging, interactive patient experiences</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 py-8 px-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center">
            <div className="flex-1 flex justify-center">
              <img 
                src="/patient-pathway-logo.jpeg" 
                alt="Patient Pathway" 
                className="h-20 w-auto object-contain rounded-sm shadow-lg mb-2" 
              />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-semibold bg-gradient-to-r from-[#f7904f] to-[#04748f] bg-clip-text text-transparent">
                Patient Pathway
              </span>
              <p className="text-gray-600 text-sm mt-2">© 2023 Patient Pathway. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
