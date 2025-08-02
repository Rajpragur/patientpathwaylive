import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { EmbeddedChatBot } from '@/components/quiz/EmbeddedChatBot';
import { useAuth } from '@/hooks/useAuth';
import { quizzes } from '@/data/quizzes';
import { supabase } from '@/integrations/supabase/client';
import { PageContent, DoctorProfile, fetchGeneratedPageContent } from '../../lib/contentGenerator'; // Updated import

const safeList = (text: string, defaultItem: string): string[] => {
  if (!text || text.trim() === '') {
    return [defaultItem];
  }
  // This is a simple split. For more robust parsing, consider
  // a markdown parser or specific delimiters.
  return text.split(/(?<=\.)\s*|\n/).filter(item => item.trim() !== '');
};


const defaultDoctor: DoctorProfile = {
  id: 'demo',
  name: 'Dr. Jane Smith',
  credentials: 'MD, Board-Certified ENT',
  locations: [
    { city: 'Fort Worth', address: '6801 Oakmont Blvd., Fort Worth, TX 76132', phone: '(817) 332-8848' },
    { city: 'Southlake', address: '1545 E. Southlake Blvd., Ste. 140, Southlake, TX 76092', phone: '(817) 420-9393' },
  ],
  testimonials: [
    { text: 'The VivAer procedure significantly improved my breathing. I returned to work the same day.', author: 'Patient', location: 'Fort Worth' },
    { text: 'The Latera implant helped reduce my chronic congestion without surgery.', author: 'Patient', location: 'Southlake' },
  ],
  website: 'https://www.exhalesinus.com/',
};

const defaultPageContent: PageContent = {
  headline: 'Struggling to Breathe Through Your Nose?',
  intro: 'Take our quick assessment to discover if nasal airway obstruction is affecting your quality of life.',
  whatIsNAO: 'Nasal Airway Obstruction (NAO) occurs when airflow through the nose is chronically limited, affecting your ability to breathe comfortably.',
  symptoms: [
    'Difficulty breathing through nose',
    'Frequent mouth breathing',
    'Snoring or sleep disruption',
    'Reduced sense of smell',
    'Chronic nasal congestion',
    'Facial pressure or pain',
    'Recurring sinus infections',
    'Poor sleep quality',
    'Daytime fatigue'
  ],
  treatments: 'We offer comprehensive treatment options ranging from minimally invasive procedures to surgical solutions.',
  treatmentOptions: [
    {
      name: 'VivAer Nasal Airway Remodeling',
      pros: 'Minimally invasive, performed in office, quick recovery',
      cons: 'May require multiple sessions for optimal results',
      invasiveness: 'Low - radiofrequency treatment with minimal discomfort'
    },
    {
      name: 'Latera Nasal Implant',
      pros: 'Supports lateral nasal wall, bioabsorbable, quick procedure',
      cons: 'Limited to lateral wall collapse issues',
      invasiveness: 'Low - simple implant placement'
    },
    {
      name: 'Septoplasty',
      pros: 'Addresses deviated septum, long-lasting results',
      cons: 'Requires anesthesia, longer recovery period',
      invasiveness: 'Moderate - surgical procedure'
    }
  ],
  vivAerOverview: 'VivAer is a minimally invasive radiofrequency treatment that remodels nasal airway tissue to improve breathing without surgery.',
  lateraOverview: 'Latera is an FDA-approved bioabsorbable nasal implant that supports the lateral nasal wall to reduce obstruction.',
  surgicalProcedures: 'For severe cases, surgical options including septoplasty and turbinate reduction provide comprehensive structural correction.',
  whyChoose: 'Our practice combines cutting-edge technology with personalized care to provide the most effective treatment for your nasal breathing issues.',
  testimonials: [
    {
      text: 'The VivAer procedure completely changed my ability to breathe. I wish I had done this sooner!',
      author: 'Sarah M.',
      location: 'Fort Worth'
    },
    {
      text: 'Dr. Smith explained all my options clearly and the treatment was quick and effective.',
      author: 'Michael R.',
      location: 'Southlake'
    }
  ],
  contact: 'Contact our office today to schedule your consultation and start breathing better.',
  cta: 'Take our quick 2-minute assessment to discover if you\'re a candidate for nasal airway treatments!',
  colors: {
    primary: '#2563eb',
    secondary: '#1e40af',
    accent: '#3b82f6'
  }
};

const EditableSection = ({ children, editable, onEdit }: { children: React.ReactNode; editable: boolean; onEdit?: () => void }) => (
  <div className="relative group">
    {editable && (
      <button className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white text-xs px-3 py-1 rounded-full shadow-md opacity-70 group-hover:opacity-100 transition-all duration-200" onClick={onEdit}>
        Edit
      </button>
    )}
    {children}
  </div>
);

const defaultChatbotColors = {
  primary: '#2563eb',
  background: '#ffffff',
  text: '#ffffff',
  userBubble: '#2563eb',
  botBubble: '#f1f5f9',
  userText: '#ffffff',
  botText: '#334155'
};

const NOSELandingPage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [isEditable, setIsEditable] = useState(false); // Consider removing or implementing editing
  const [aiContent, setAIContent] = useState<PageContent | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showChatWidget, setShowChatWidget] = useState(true);
  const [showChatMessage, setShowChatMessage] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatbotColors, setChatbotColors] = useState(defaultChatbotColors);
  const [generationError, setGenerationError] = useState<string | null>(null);
  // generateAttempted is still useful for preventing multiple requests on initial load
  const generateAttempted = useRef(false);

  // Validation function to ensure content structure is correct - now primarily for client-side default fallback
  const validatePageContent = (content: any): PageContent => {
    // This validation function is more for ensuring we have *something* coherent
    // if the AI returns partial data or for initial defaults.
    // The backend should ideally return fully validated content.
    const validated: PageContent = {
      headline: content?.headline || defaultPageContent.headline,
      intro: content?.intro || defaultPageContent.intro,
      whatIsNAO: content?.whatIsNAO || defaultPageContent.whatIsNAO,
      symptoms: Array.isArray(content?.symptoms) && content.symptoms.length >= 9
        ? content.symptoms.slice(0, 9)
        : defaultPageContent.symptoms,
      treatments: content?.treatments || defaultPageContent.treatments,
      treatmentOptions: Array.isArray(content?.treatmentOptions) && content.treatmentOptions.length > 0
        ? content.treatmentOptions.map((option: any) => ({
            name: option?.name || 'Treatment Option',
            pros: option?.pros || 'Benefits available',
            cons: option?.cons || 'Some limitations may apply',
            invasiveness: option?.invasiveness || 'Varies by procedure'
          }))
        : defaultPageContent.treatmentOptions,
      vivAerOverview: content?.vivAerOverview || defaultPageContent.vivAerOverview,
      lateraOverview: content?.lateraOverview || defaultPageContent.lateraOverview,
      surgicalProcedures: content?.surgicalProcedures || defaultPageContent.surgicalProcedures,
      whyChoose: content?.whyChoose || defaultPageContent.whyChoose,
      testimonials: Array.isArray(content?.testimonials) && content.testimonials.length > 0
        ? content.testimonials.map((testimonial: any) => ({
            text: testimonial?.text || 'Great experience with the treatment.',
            author: testimonial?.author || 'Patient',
            location: testimonial?.location || 'Local'
          }))
        : defaultPageContent.testimonials,
      contact: content?.contact || defaultPageContent.contact,
      cta: content?.cta || defaultPageContent.cta,
      colors: {
        primary: content?.colors?.primary || defaultPageContent.colors.primary,
        secondary: content?.colors?.secondary || defaultPageContent.colors.secondary,
        accent: content?.colors?.accent || defaultPageContent.colors.accent
      }
    };
    return validated;
  };

  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!doctorId) return;

      try {
        const { data, error } = await supabase
          .from('doctor_profiles')
          .select('*')
          .eq('id', doctorId)
          .single();

        if (error) {
          console.error('Error fetching doctor profile:', error);
          setDoctor(defaultDoctor); // Fallback to default
          return;
        }

        if (data) {
          setDoctor({
            id: data.id,
            name: `${data.first_name || 'Dr.'} ${data.last_name || 'Smith'}`,
            credentials: data.specialty || 'MD',
            // Ensure locations array is always valid
            locations: data.location || data.clinic_name || data.phone ?
              [{
                city: data.location || 'Main Office',
                address: data.clinic_name || 'Please contact for address',
                phone: data.phone || 'Please contact for phone'
              }] : defaultDoctor.locations, // Fallback if no specific data
            testimonials: defaultDoctor.testimonials, // Or fetch from data if available
            website: data.website || defaultDoctor.website,
            avatar_url: data.avatar_url
          });
        } else {
          setDoctor(defaultDoctor); // Fallback if no data found
        }
      } catch (error) {
        console.error('Error in fetchDoctorData:', error);
        setDoctor(defaultDoctor); // Fallback on error
      }
    };

    fetchDoctorData();
  }, [doctorId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowChatMessage(true);
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchChatbotColors = async () => {
      if (!doctor || !user) return;

      try {
        const { data, error } = await supabase
          .from('ai_landing_pages')
          .select('chatbot_colors')
          .eq('user_id', user.id)
          .eq('doctor_id', doctor.id)
          .single();

        if (data && data.chatbot_colors) {
          setChatbotColors(data.chatbot_colors);
        } else {
          setChatbotColors(defaultChatbotColors);
        }
      } catch (error) {
        console.error('Error fetching chatbot colors:', error);
        setChatbotColors(defaultChatbotColors);
      }
    };

    fetchChatbotColors();
  }, [doctor, user]);

  useEffect(() => {
    const loadAIContent = async () => {
      // Only proceed if doctor and user are loaded and we haven't attempted generation yet
      if (!doctor || !user || generateAttempted.current) return;

      setLoadingAI(true);
      setGenerationError(null);
      generateAttempted.current = true; // Mark as attempted

      try {
        // First, try to fetch existing content from Supabase
        const { data: existingData, error: fetchError } = await supabase
          .from('ai_landing_pages')
          .select('content, chatbot_colors')
          .eq('user_id', user.id)
          .eq('doctor_id', doctor.id)
          .single();

        if (existingData && existingData.content) {
          console.log('Found existing content, validating and using it.');
          const validatedContent = validatePageContent(existingData.content);
          setAIContent(validatedContent);
          if (existingData.chatbot_colors) {
            setChatbotColors(existingData.chatbot_colors);
          }
          setLoadingAI(false);
          return; // Exit if content found
        }

        console.log('No existing content found, initiating backend generation...');

        // If no existing content, trigger backend generation
        const generatedContent = await fetchGeneratedPageContent(doctor.id, user.id, doctor.website);

        setAIContent(generatedContent);
        // Set chatbot colors from the generated content's colors if available, otherwise default
        if (generatedContent.colors) {
          setChatbotColors({
            primary: generatedContent.colors.primary,
            background: '#ffffff',
            text: '#ffffff', // Assuming white text on primary background
            userBubble: generatedContent.colors.primary,
            botBubble: '#f1f5f9',
            userText: '#ffffff',
            botText: '#334155'
          });
        }

        // Save generated content to database (this should ideally be handled by the backend after generation)
        // However, if the frontend is responsible for saving after receiving, keep this.
        // It's generally better for the backend to save after successful generation.
        const { error: insertError } = await supabase
          .from('ai_landing_pages')
          .upsert([
            {
              user_id: user.id,
              doctor_id: doctor.id,
              content: generatedContent,
              chatbot_colors: generatedContent.colors ? {
                primary: generatedContent.colors.primary,
                background: '#ffffff',
                text: '#ffffff',
                userBubble: generatedContent.colors.primary,
                botBubble: '#f1f5f9',
                userText: '#ffffff',
                botText: '#334155'
              } : defaultChatbotColors,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ], { onConflict: 'user_id,doctor_id' });

        if (insertError) {
          console.error('Error saving generated content to Supabase:', insertError);
          setGenerationError('Content generated but failed to save to database.');
        } else {
          console.log('Generated content saved to Supabase successfully.');
        }

      } catch (error: any) {
        console.error('Error in loadAIContent:', error);
        setGenerationError(`Failed to load or generate content: ${error.message || 'Unknown error'}. Falling back to default.`);
        // Fallback to default content and doctor info if generation fails
        setAIContent({
          ...defaultPageContent,
          headline: `Advanced Nasal Treatments with ${doctor.name}`,
          whyChoose: `Choose ${doctor.name} for expert nasal care.`,
          contact: `Contact ${doctor.name} to schedule your consultation.`
        });
      } finally {
        setLoadingAI(false);
      }
    };

    // Trigger content loading only when doctor and user are available
    if (doctor && user) {
      loadAIContent();
    }
  }, [doctor, user]); // Depend on doctor and user objects

  const handleShowQuiz = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setShowChatModal(true);
  };

  const doctorAvatarUrl = doctor?.avatar_url || '/lovable-uploads/6b38df79-5ad8-494b-83ed-7dba6c54d4b1.png';

  // Loading state
  if (!doctor || loadingAI || !aiContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your personalized assessment...</p>
          {generationError && (
            <p className="text-orange-600 text-sm mt-2">{generationError}</p>
          )}
        </div>
      </div>
    );
  }

  const ChatWidget = () => {
    if (!showChatWidget) return null;

    return (
      <>
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative">
            {showChatMessage && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full animate-pulse"></div>
            )}

            {showChatMessage && (
              <div className="absolute bottom-24 right-2 bg-white rounded-2xl shadow-2xl p-6 mb-2 border border-gray-100 animate-slideIn" style={{ width: '340px', minWidth: '340px' }}>
                <div className="text-sm text-gray-700 mb-3 font-medium">
                  {aiContent.cta}
                </div>
                <div className="text-xs text-gray-500 flex items-center">
                  <span>Click to start the quiz</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
                <div className="absolute bottom-0 right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white transform translate-y-full"></div>

                <button
                  onClick={() => setShowChatMessage(false)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <button
              onClick={() => setShowChatModal(true)}
              className="relative text-white bg-blue-600 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center w-20 h-20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </div>
        </div>

        {showChatModal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
            style={{
              overflow: 'hidden',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowChatModal(false);
              }
            }}
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl relative overflow-hidden transform transition-all duration-300 ease-out animate-slideIn" style={{ height: '90vh' }}>
              <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-6 flex justify-between items-center sticky top-0 z-10"
              style={{
                backgroundColor: chatbotColors.primary,
                color: chatbotColors.text
              }}>
                <div className="flex items-center space-x-4">
                  <img src={doctorAvatarUrl} alt="Doctor" className="w-12 h-12 rounded-full object-cover border-2 border-white/30" />
                  <div>
                    <h3 className="font-bold text-lg">NOSE Assessment</h3>
                    <p className="text-sm">Quick breathing evaluation with {doctor.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChatModal(false)}
                  className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/10 rounded-full"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="overflow-y-auto overflow-x-hidden" style={{ height: 'calc(90vh - 96px)' }}>
                <EmbeddedChatBot
                  quizType="NOSE"
                  doctorId={doctor.id} // Already guaranteed to be available here
                  quizData={quizzes.NOSE}
                  doctorAvatarUrl={doctorAvatarUrl}
                  chatbotColors={chatbotColors}
                />
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(-10px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }

          .animate-slideIn {
            animation: slideIn 0.3s ease-out;
          }
        `}</style>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {generationError && (
        <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-4">
          <p className="text-sm">{generationError}</p>
        </div>
      )}

      {/* Hero Section */}
      <section className="w-full bg-white border-b border-slate-200 py-20">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <div className="mb-12">
            <div className="w-20 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <img src={doctorAvatarUrl} alt="Practice Logo" className="w-20 rounded-xl object-cover" />
            </div>
            <h1 className="text-5xl font-bold text-slate-900 mb-8 leading-tight max-w-6xl mx-auto">
              {aiContent.headline}
            </h1>
            <p className="text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              {aiContent.intro}
            </p>
            <button
              onClick={handleShowQuiz}
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-12 rounded-xl transition-all duration-300 hover:scale-105 shadow-xl text-xl group"
            >
              <span>Take the Nose Test Now</span>
              <svg className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="w-full space-y-0">
        {/* What is NAO */}
        <section className="w-full bg-slate-100 py-24">
          <div className="max-w-7xl mx-auto px-8 text-center">
            <EditableSection editable={isEditable}>
              <h2 className="text-5xl font-bold text-slate-900 mb-8">What Is Nasal Airway Obstruction?</h2>
              <p className="text-2xl text-slate-600 leading-relaxed max-w-5xl mx-auto">
                {aiContent.whatIsNAO}
              </p>
            </EditableSection>
          </div>
        </section>

        {/* Symptoms & Impact */}
        <section className="w-full bg-white py-24">
          <div className="max-w-7xl mx-auto px-8 text-center">
            <EditableSection editable={isEditable}>
              <h2 className="text-5xl font-bold text-slate-900 mb-12">Symptoms & Impact</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {aiContent.symptoms.map((symptom: string, i: number) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="w-4 h-4 bg-blue-600 rounded-full mb-4 mx-auto"></div>
                    <span className="text-slate-700 text-lg">{symptom}</span>
                  </div>
                ))}
              </div>
            </EditableSection>
          </div>
        </section>

        {/* Treatment Options */}
        <section className="w-full bg-slate-100 py-24">
          <div className="max-w-7xl mx-auto px-8 text-center">
            <EditableSection editable={isEditable}>
              <h2 className="text-5xl font-bold text-slate-900 mb-8">
                Comprehensive Treatment Options at {doctor.name.split(' ')[0]}'s Practice
              </h2>
              <p className="text-2xl text-slate-600 mb-16 max-w-5xl mx-auto leading-relaxed">
                {aiContent.treatments}
              </p>

              <div className="mb-16">
                <h3 className="text-3xl font-semibold text-slate-800 mb-12">Treatment Options: From Gentle to Surgical</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {aiContent.treatmentOptions.map((option, i: number) => (
                    <div key={i} className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                        <span className="text-white font-bold text-lg">{i + 1}</span>
                      </div>
                      <h4 className="text-slate-900 font-semibold text-xl mb-4">{option.name}</h4>
                      <div className="text-left space-y-2 text-sm">
                        <div><span className="font-semibold text-green-600">Pros:</span> {option.pros}</div>
                        <div><span className="font-semibold text-orange-600">Cons:</span> {option.cons}</div>
                        <div><span className="font-semibold text-blue-600">Invasiveness:</span> {option.invasiveness}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </EditableSection>
          </div>
        </section>

        {/* VivAer & Latera */}
        <section className="w-full bg-white py-24">
          <div className="max-w-7xl mx-auto px-8">
            <EditableSection editable={isEditable}>
              <div className="grid md:grid-cols-2 gap-16">
                <div className="text-center bg-slate-50 rounded-xl p-12 border border-slate-200">
                  <h2 className="text-4xl font-bold text-slate-900 mb-8">VivAer Overview</h2>
                  <p className="text-slate-600 text-lg leading-relaxed">{aiContent.vivAerOverview}</p>
                </div>
                <div className="text-center bg-slate-50 rounded-xl p-12 border border-slate-200">
                  <h2 className="text-4xl font-bold text-slate-900 mb-8">Latera Overview</h2>
                  <p className="text-slate-600 text-lg leading-relaxed">{aiContent.lateraOverview}</p>
                </div>
              </div>
            </EditableSection>
          </div>
        </section>

        {/* Surgical Procedures */}
        <section className="w-full bg-slate-100 py-24">
          <div className="max-w-7xl mx-auto px-8 text-center">
            <EditableSection editable={isEditable}>
              <h2 className="text-5xl font-bold text-slate-900 mb-12">Surgical Procedures</h2>
              <p className="text-2xl text-slate-600 leading-relaxed max-w-5xl mx-auto">
                {aiContent.surgicalProcedures || ''}
              </p>
            </EditableSection>
          </div>
        </section>

        {/* Call to Action */}
        <section className="w-full bg-blue-600 py-24">
          <div className="max-w-7xl mx-auto px-8 text-center">
            <EditableSection editable={isEditable}>
              <h2 className="text-5xl font-bold text-white mb-12">Take the Next Step</h2>
              <p className="text-2xl text-blue-100 mb-16 max-w-4xl mx-auto leading-relaxed">
                {aiContent.cta || ''}
              </p>
              <button
                onClick={handleShowQuiz}
                className="inline-flex items-center bg-white text-blue-600 font-bold py-6 px-12 rounded-xl transition-all duration-300 hover:scale-105 shadow-xl text-xl group hover:shadow-2xl"
              >
                <span>Take the Nose Test</span>
                <svg className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </EditableSection>
          </div>
        </section>

        {/* Why Choose */}
        <section className="w-full bg-white py-24">
          <div className="max-w-7xl mx-auto px-8 text-center">
            <EditableSection editable={isEditable}>
              <h2 className="text-5xl font-bold text-slate-900 mb-16">Why Choose {doctor.name.split(' ')[0]}'s Practice</h2>
              {/* Assuming whyChoose is a string, split it into paragraphs for display */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {safeList(aiContent.whyChoose, 'Board-Certified ENT Specialists').map((reason: string, i: number) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-8 text-left border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mb-6">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-slate-700 text-lg leading-relaxed">{reason}</span>
                  </div>
                ))}
              </div>
            </EditableSection>
          </div>
        </section>

        {/* Testimonials */}
        <section className="w-full bg-slate-100 py-24">
          <div className="max-w-7xl mx-auto px-8 text-center">
            <h2 className="text-5xl font-bold text-slate-900 mb-16">Patient Testimonials</h2>
            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {(Array.isArray(aiContent.testimonials) ? aiContent.testimonials : []).map((testimonial: { text: string; author: string; location: string }, i: number) => (
                <div key={i} className="bg-white rounded-xl p-12 border border-slate-200 relative shadow-sm hover:shadow-md transition-shadow">
                  <div className="absolute top-8 left-8 text-8xl text-slate-300">"</div>
                  <p className="text-slate-700 mb-8 pt-12 text-xl leading-relaxed italic">{testimonial.text || ''}</p>
                  <div className="flex items-center justify-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-slate-900 text-lg">{testimonial.author || 'Patient'}</div>
                      <div className="text-slate-500">{testimonial.location || ''}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <ChatWidget />
    </div>
  );
};

export default NOSELandingPage;