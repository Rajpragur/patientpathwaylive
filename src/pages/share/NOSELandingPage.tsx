
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { EmbeddedChatBot } from '@/components/quiz/EmbeddedChatBot';
import { useAuth } from '@/hooks/useAuth';
import { quizzes } from '@/data/quizzes';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface DoctorProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  specialty?: string;
  clinic_name?: string;
  location?: string;
  phone?: string;
  avatar_url?: string;
  website?: string;
}

interface LandingPageSection {
  id: string;
  type: 'hero' | 'content' | 'testimonial' | 'treatment' | 'contact';
  title: string;
  content: string;
  image_url?: string;
  order: number;
}

interface LandingPageData {
  id: string;
  doctor_id: string;
  title: string;
  subtitle: string;
  sections: LandingPageSection[];
  chatbot_enabled: boolean;
  quiz_embedded: boolean;
}

const defaultSections: LandingPageSection[] = [
  {
    id: '1',
    type: 'content',
    title: 'What Is Nasal Airway Obstruction?',
    content: 'Nasal Airway Obstruction (NAO) occurs when airflow through the nose is chronically limited—most commonly by structural causes—and can significantly degrade sleep, energy, exercise capacity, and quality of life.',
    order: 1
  },
  {
    id: '2',
    type: 'treatment',
    title: 'Treatment Options',
    content: 'We offer comprehensive treatment options from gentle medical management to advanced in-office procedures like VivAer and Latera.',
    order: 2
  },
  {
    id: '3',
    type: 'testimonial',
    title: 'Patient Success Stories',
    content: 'Our patients report significant improvement in breathing and quality of life after treatment.',
    order: 3
  }
];

const NOSELandingPage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [landingPageData, setLandingPageData] = useState<LandingPageData | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [loading, setLoading] = useState(true);
  const quizRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
    
    // Show chatbot after 30 seconds
    const timer = setTimeout(() => setShowChatbot(true), 30000);
    return () => clearTimeout(timer);
  }, [doctorId]);

  const fetchData = async () => {
    try {
      // Fetch doctor profile
      if (doctorId && doctorId !== 'demo') {
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctor_profiles')
          .select('*')
          .eq('id', doctorId)
          .single();

        if (doctorError) {
          console.error('Error fetching doctor profile:', doctorError);
        } else {
          setDoctor(doctorData);
        }
      }

      // Fetch landing page data
      const { data: landingData, error: landingError } = await supabase
        .from('nose_landing_pages')
        .select('*')
        .eq('doctor_id', doctorId || 'demo')
        .single();

      if (landingError && landingError.code !== 'PGRST116') {
        console.error('Error fetching landing page data:', landingError);
      }

      if (landingData) {
        setLandingPageData(landingData);
      } else {
        // Set default landing page data
        setLandingPageData({
          id: 'default',
          doctor_id: doctorId || 'demo',
          title: 'Struggling to Breathe Through Your Nose?',
          subtitle: 'Take Our Quick "Nose Test" to See If You Have Nasal Airway Obstruction',
          sections: defaultSections,
          chatbot_enabled: true,
          quiz_embedded: true
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeQuiz = () => {
    if (quizRef.current) {
      quizRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const quizIframeSrc = `${window.location.origin}/quiz/nose?doctor=${doctorId || 'demo'}&source=landing_page`;
  const doctorName = doctor ? `${doctor.first_name || ''} ${doctor.last_name || ''}`.trim() : 'Our Practice';
  const practiceInfo = doctor?.clinic_name || 'Medical Center';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 py-12 text-center">
        {/* Practice Logo/Avatar */}
        {doctor?.avatar_url && (
          <div className="w-20 h-20 mx-auto mb-6">
            <img 
              src={doctor.avatar_url} 
              alt={`${doctorName} Logo`}
              className="w-full h-full object-cover rounded-full shadow-lg"
            />
          </div>
        )}
        
        <h1 className="text-4xl md:text-5xl font-bold text-[#0E7C9D] mb-4">
          {landingPageData?.title}
        </h1>
        <p className="text-xl text-gray-700 mb-6">
          {landingPageData?.subtitle}
        </p>
        
        {/* Doctor Info */}
        <div className="mb-8 text-gray-600">
          <p className="text-lg font-semibold">{doctorName}</p>
          <p>{doctor?.specialty || 'ENT Specialist'}</p>
          <p className="font-medium">{practiceInfo}</p>
          {doctor?.location && <p>{doctor.location}</p>}
          {doctor?.phone && (
            <p>
              <a href={`tel:${doctor.phone}`} className="text-blue-600 hover:underline">
                {doctor.phone}
              </a>
            </p>
          )}
        </div>
        
        <Button
          onClick={handleTakeQuiz}
          className="bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] text-white font-bold py-4 px-8 rounded-2xl hover:scale-105 transition-all shadow-lg text-lg"
        >
          Take the Nose Test Now »
        </Button>
      </section>

      {/* Quiz Section */}
      <section ref={quizRef} className="max-w-4xl mx-auto px-4 py-8">
        <Card className="shadow-lg">
          <CardHeader>
            <h2 className="text-2xl font-bold text-center">NOSE Assessment</h2>
          </CardHeader>
          <CardContent>
            <iframe
              src={quizIframeSrc}
              width="100%"
              height="600px"
              frameBorder="0"
              className="rounded-lg"
              title="NOSE Assessment Quiz"
            />
          </CardContent>
        </Card>
      </section>

      {/* Dynamic Content Sections */}
      {landingPageData?.sections?.map((section, index) => (
        <section key={section.id} className="max-w-4xl mx-auto px-4 py-8">
          <Card className="shadow-lg">
            <CardHeader>
              <h2 className="text-2xl font-bold text-blue-900">{section.title}</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
                {section.image_url && (
                  <div>
                    <img
                      src={section.image_url}
                      alt={section.title}
                      className="w-full h-64 object-cover rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      ))}

      {/* Contact Section */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <Card className="shadow-lg bg-blue-50">
          <CardHeader>
            <h2 className="text-2xl font-bold text-blue-900 text-center">Contact {doctorName}</h2>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-2 mb-6">
              <p className="text-lg font-semibold">{practiceInfo}</p>
              {doctor?.location && <p className="text-gray-600">{doctor.location}</p>}
              {doctor?.phone && (
                <p>
                  <a 
                    href={`tel:${doctor.phone}`} 
                    className="text-blue-600 hover:underline font-semibold text-lg"
                  >
                    {doctor.phone}
                  </a>
                </p>
              )}
            </div>
            
            <Button
              onClick={handleTakeQuiz}
              className="bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] text-white font-bold py-3 px-6 rounded-2xl hover:scale-105 transition-all shadow-lg"
            >
              Schedule Consultation
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Chatbot Widget */}
      {showChatbot && landingPageData?.chatbot_enabled && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative">
            <Button
              className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] text-white shadow-lg hover:scale-110 transition-all"
              onClick={handleTakeQuiz}
            >
              💬
            </Button>
            <div className="absolute bottom-20 right-0 bg-white rounded-lg shadow-lg p-4 max-w-xs">
              <p className="text-sm text-gray-700">
                Hi! I'm here to help you assess your nasal breathing. Click to take our quick NOSE test!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NOSELandingPage;
