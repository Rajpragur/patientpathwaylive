import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { MessageSquare, ArrowRight, Stethoscope, Award, Clock, MapPin, CheckCircle } from 'lucide-react';

const treatments = [
  {
    name: 'Medical Management',
    pros: 'Non-invasive, easily accessible',
    cons: 'Temporary relief, no structural correction',
    invasiveness: 'Low',
    icon: <Stethoscope className="h-5 w-5 text-blue-500" />,
  },
  {
    name: 'VivAer®',
    pros: 'Minimally invasive, in-office, quick recovery',
    cons: 'Limited to specific structural issues',
    invasiveness: 'Low to Moderate',
    icon: <Stethoscope className="h-5 w-5 text-blue-500" />,
  },
  {
    name: 'Latera®',
    pros: 'Support for nasal valve collapse, dissolvable implant',
    cons: 'Implant-based, mild discomfort',
    invasiveness: 'Low',
    icon: <Stethoscope className="h-5 w-5 text-blue-500" />,
  },
  {
    name: 'Septoplasty',
    pros: 'Corrects deviated septum',
    cons: 'Requires anesthesia and downtime',
    invasiveness: 'High',
    icon: <Stethoscope className="h-5 w-5 text-blue-500" />,
  },
  {
    name: 'Turbinate Reduction',
    pros: 'Improves airflow, outpatient procedure',
    cons: 'Minor recovery time',
    invasiveness: 'Moderate',
    icon: <Stethoscope className="h-5 w-5 text-blue-500" />,
  },
];

const testimonials = [
  {
    quote: "The VivAer procedure improved my breathing dramatically. I was back at work the same day with no downtime.",
    name: "Michael R.",
    location: "Dallas, TX"
  },
  {
    quote: "Latera helped reduce my congestion without needing surgery. I can finally sleep through the night.",
    name: "Sarah T.",
    location: "Chicago, IL"
  },
  {
    quote: "After years of breathing problems, the NOSE test identified my issue and the treatment changed my life.",
    name: "David L.",
    location: "Phoenix, AZ"
  }
];

export default function NoseLandingPage() {
  const [showChat, setShowChat] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowChat(true), 30000);
    return () => clearTimeout(timer);
  }, []);
  const handleTakeQuizClick = () => {
    setShowQuiz(true);
    setTimeout(() => {
      quizRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100); // slight delay ensures DOM is updated
  };
  
  const quizIframeSrc = `${window.location.origin}/quiz/nose?source=website&utm_source=website&utm_medium=web&utm_campaign=quiz_share`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 dark:from-blue-950 dark:via-blue-900 dark:to-blue-950">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-blue-950 dark:text-blue-100">
              Struggling to Breathe Through Your Nose?
            </h1>
            <p className="text-lg md:text-xl mb-8 text-blue-800 dark:text-blue-200">
              Take Our Quick "Nose Test" to See If You Have Nasal Airway Obstruction
            </p>
            <Button
              onClick={handleTakeQuizClick}
              size="lg"
              className="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            >
              <span className="relative z-10 flex items-center">
                Take the Nose Test Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </Button>

          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent"></div>
      </header>

      {/* What Is NAO Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center">What Is Nasal Airway Obstruction?</h2>
          <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-background p-6 md:p-8 rounded-xl shadow-sm">
            <p className="text-lg leading-relaxed">
              Nasal Airway Obstruction (NAO) occurs when airflow through the nose is restricted, often due to structural issues. Symptoms can include congestion, poor sleep, reduced energy, and compromised quality of life.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                <p>Difficulty breathing through your nose</p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                <p>Congestion or stuffiness</p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                <p>Trouble sleeping or snoring</p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                <p>Reduced ability to exercise</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Treatment Options */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/20 dark:to-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">Treatment Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {treatments.map((t, i) => (
              <Card key={i} className="overflow-hidden transition-all duration-300 hover:shadow-md border-t-4 border-t-blue-500">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    {t.icon}
                  </div>
                  <h3 className="font-semibold text-lg">{t.name}</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Pros:</span>
                      <p className="text-sm mt-1">{t.pros}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-rose-600 dark:text-rose-400">Cons:</span>
                      <p className="text-sm mt-1">{t.cons}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Invasiveness:</span>
                      <p className="text-sm mt-1">{t.invasiveness}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* VivAer & Latera Overview */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">VivAer & Latera Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="overflow-hidden bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-background border-none shadow-md">
              <CardHeader className="pb-2">
                <h3 className="font-semibold text-xl text-blue-700 dark:text-blue-300">VivAer®</h3>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed">
                  Uses radiofrequency to gently reshape nasal tissue. Minimally invasive, local anesthesia, fast recovery.
                </p>
                <div className="mt-4 flex items-center text-sm text-blue-600 dark:text-blue-400">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>15-30 minute procedure</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-background border-none shadow-md">
              <CardHeader className="pb-2">
                <h3 className="font-semibold text-xl text-blue-700 dark:text-blue-300">Latera®</h3>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed">
                  A dissolvable implant that supports nasal cartilage. Office-based and gradually absorbed over time.
                </p>
                <div className="mt-4 flex items-center text-sm text-blue-600 dark:text-blue-400">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Quick in-office procedure</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">Why Patients Choose Our Practice</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-white/10 rounded-lg backdrop-blur-sm">
              <Award className="h-10 w-10 mb-4 text-blue-200" />
              <h3 className="font-medium text-lg mb-2">Board-Certified ENT Specialists</h3>
              <p className="text-blue-100">Our doctors are experts in nasal airway treatments</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white/10 rounded-lg backdrop-blur-sm">
              <Clock className="h-10 w-10 mb-4 text-blue-200" />
              <h3 className="font-medium text-lg mb-2">Minimally Invasive Procedures</h3>
              <p className="text-blue-100">Most treatments performed in-office with minimal recovery</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white/10 rounded-lg backdrop-blur-sm">
              <MapPin className="h-10 w-10 mb-4 text-blue-200" />
              <h3 className="font-medium text-lg mb-2">Convenient Locations</h3>
              <p className="text-blue-100">Multiple offices to serve you better</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">Patient Testimonials</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/10 dark:to-background border-none shadow-md">
              <CardContent className="pt-6">
                <div className="mb-4">
                  <div className="flex space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="italic text-gray-700 dark:text-gray-300">"{testimonial.quote}"</p>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">Ready to Breathe Better?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">Take our quick assessment to see if you might have Nasal Airway Obstruction and learn about treatment options.</p>
          {!showQuiz ? (
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg"
              onClick={() => setShowQuiz(true)}
            >
              Take the Nose Test Now »
            </Button>
          ) : (
            <div className="mt-8">
              <iframe
                src={quizIframeSrc}
                width="100%"
                height="900px"
                frameBorder="0"
                className="rounded-xl shadow-md"
              ></iframe>
            </div>
          )}

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-white">Contact Us</h3>
              <p className="mb-2">[Insert Practice Name]</p>
              <p className="mb-2">123 Medical Center Drive</p>
              <p className="mb-2">City, State 12345</p>
              <p className="mb-2">Phone: (555) 123-4567</p>
              <p>Email: info@practice.com</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-white">Resources</h3>
              <ul className="space-y-2">
                <li><a href="https://www.mayoclinic.org/tests-procedures/septoplasty" className="hover:text-white transition-colors">Mayo Clinic – Septoplasty</a></li>
                <li><a href="https://www.exhalesinus.com/" className="hover:text-white transition-colors">Exhale Sinus</a></li>
                <li><a href="https://www.aerinmedical.com/vivaer/" className="hover:text-white transition-colors">Aerin Medical – VivAer</a></li>
                <li><a href="https://ent.stryker.com/products/latera" className="hover:text-white transition-colors">Stryker – Latera</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>© {new Date().getFullYear()} [Practice Name]. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating Chat Button */}
      {showChat && !showQuiz && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            className="group h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:shadow-xl"
            onClick={() => setShowQuiz(true)}
          >
            <MessageSquare className="h-6 w-6" />
            <span className="absolute right-16 bg-white text-blue-700 px-3 py-2 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Take the Nose Test
            </span>
          </Button>
        </div>
      )}
      {/* Background grid pattern - hidden element for styling */}
      <div className="hidden">
        <div className="bg-grid-pattern"></div>
        <style>{`
          .bg-grid-pattern {
            background-image: linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px);
            background-size: 24px 24px;
          }
        `}</style>
      </div>
    </div>
  );
} 