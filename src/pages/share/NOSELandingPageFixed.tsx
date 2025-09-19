import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { EmbeddedChatBot } from '@/components/quiz/EmbeddedChatBot';
import { quizzes } from '@/data/quizzes';
import { supabase } from '@/integrations/supabase/client';
import { generatePageContent, DoctorProfile } from '../../lib/openrouter';

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
  const [utmSource, setUtmSource] = useState<string | null>(null);
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [aiContent, setAIContent] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showChatWidget, setShowChatWidget] = useState(true);
  const [showChatMessage, setShowChatMessage] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatbotColors, setChatbotColors] = useState(defaultChatbotColors);
  const [contentError, setContentError] = useState<string | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);
  
  // Refs to prevent infinite loops
  const lastProcessedDoctorId = useRef<string | null>(null);
  const isInitialized = useRef(false);
  const isProcessingContent = useRef(false);

  // Memoized functions to prevent unnecessary re-renders
  const fetchDoctorData = useCallback(async (actualDoctorId: string) => {
    try {
      console.log('Fetching doctor profile for ID:', actualDoctorId);
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('id', actualDoctorId)
        .single();

      if (error) {
        console.error('Error fetching doctor profile:', error);
        setDoctor(defaultDoctor);
        return;
      }

      if (data && data.first_name && data.last_name) {
        const doctorProfile = {
          id: data.id,
          name: `${data.first_name} ${data.last_name}`,
          credentials: data.specialty || 'MD',
          locations: [
            {
              city: data.location || 'Main Office',
              address: data.clinic_name || 'Please contact for address',
              phone: data.phone || 'Please contact for phone'
            }
          ],
          testimonials: defaultDoctor.testimonials,
          website: data.website || defaultDoctor.website,
          avatar_url: data.avatar_url
        };
        console.log('Successfully fetched doctor profile:', doctorProfile);
        setDoctor(doctorProfile);
      } else {
        console.warn('Doctor data incomplete, using default doctor');
        setDoctor(defaultDoctor);
      }
    } catch (error) {
      console.error('Error in fetchDoctorData:', error);
      setDoctor(defaultDoctor);
    }
  }, []);

  // Initialize doctor data - only run once
  useEffect(() => {
    if (isInitialized.current) return;
    
    const searchParams = new URLSearchParams(window.location.search);
    const source = searchParams.get('utm_source');
    if (source) {
      setUtmSource(source);
    }
    
    console.log('NOSELandingPage - doctorId from URL:', doctorId);
    console.log('NOSELandingPage - URL search params:', Object.fromEntries(searchParams));
    
    const doctorIdFromRoute = doctorId;
    const doctorIdFromQuery = searchParams.get('doctor');
    const actualDoctorId = doctorIdFromQuery || doctorIdFromRoute;
    
    if (!actualDoctorId) {
      console.error('No doctorId found in URL parameters or route');
      setDoctor(defaultDoctor);
      isInitialized.current = true;
      return;
    }

    fetchDoctorData(actualDoctorId);
    isInitialized.current = true;
  }, [doctorId, fetchDoctorData]);

  // Chat message timer - only run once
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowChatMessage(true);
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch chatbot colors - only when doctor changes
  useEffect(() => {
    if (!doctor?.id) return;
    
    const fetchChatbotColors = async () => {
      try {
        const { data, error } = await supabase
          .from('ai_landing_pages')
          .select('chatbot_colors')
          .eq('doctor_id', doctor.id)
          .eq('quiz_type', 'NOSE')
          .maybeSingle();
          
        if (data && data.chatbot_colors) {
          setChatbotColors(data.chatbot_colors);
        } else {
          setChatbotColors(defaultChatbotColors);
        }
      } catch (error) {
        console.warn('Could not fetch chatbot colors, using defaults:', error);
        setChatbotColors(defaultChatbotColors);
      }
    };
    
    fetchChatbotColors();
  }, [doctor?.id]); // Only depend on doctor.id, not the entire doctor object

  // Fetch AI content - prevent multiple calls and infinite loops
  useEffect(() => {
    if (!doctor?.id || isProcessingContent.current) return;
    
    // Prevent multiple calls for the same doctor ID
    if (doctor.id === lastProcessedDoctorId.current) {
      console.log('Skipping content generation - already processed this doctor ID:', doctor.id);
      return;
    }
    
    console.log('Starting content generation for doctor ID:', doctor.id);
    lastProcessedDoctorId.current = doctor.id;
    isProcessingContent.current = true;

    const fetchOrCreateAIContent = async () => {
      setLoadingAI(true);
      setContentError(null);

      try {
        // First, try to get existing content from database
        const { data: queryResult, error } = await supabase
          .from('ai_landing_pages')
          .select('*')
          .eq('doctor_id', doctor.id)
          .eq('quiz_type', 'NOSE');
          
        let data: any = null;
        if (queryResult && Array.isArray(queryResult) && queryResult.length > 0) {
          // Sort by updated_at descending and take the first one
          data = queryResult.sort((a, b) => 
            new Date(b.updated_at || b.created_at).getTime() - 
            new Date(a.updated_at || a.created_at).getTime()
          )[0];
        }

        if (data && data.content && !data.content.error) {
          // Parse content if it's a string
          let parsedContent = data.content;
          if (typeof data.content === 'string') {
            try {
              parsedContent = JSON.parse(data.content);
            } catch (parseError) {
              console.warn('Could not parse content from database:', parseError);
              parsedContent = data.content;
            }
          }
          
          console.log('Using existing content from database');
          setAIContent(parsedContent);
          setLoadingAI(false);
        } else {
          // Generate new content
          console.log('Generating new content...');
          const generated = await generatePageContent(doctor, 'NOSE');
          
          if (generated.error) {
            setContentError(generated.error);
            setAIContent(generated);
          } else {
            setAIContent(generated);
            
            // Save to database
            try {
              const { data: existingRecord } = await supabase
                .from('ai_landing_pages')
                .select('id')
                .eq('doctor_id', doctor.id)
                .eq('quiz_type', 'NOSE')
                .maybeSingle();

              if (existingRecord) {
                await supabase
                  .from('ai_landing_pages')
                  .update({
                    content: generated,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', existingRecord.id);
              } else {
                await supabase
                  .from('ai_landing_pages')
                  .insert({
                    doctor_id: doctor.id,
                    quiz_type: 'NOSE',
                    content: generated,
                    chatbot_colors: {},
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  });
              }
              console.log('Successfully saved content to database');
            } catch (saveError) {
              console.error('Database save failed:', saveError);
            }
          }
        }
      } catch (error) {
        console.error('Error in fetchOrCreateAIContent:', error);
        setContentError('Failed to generate content. Please try again.');
        setAIContent({ error: error.message });
      } finally {
        setLoadingAI(false);
        isProcessingContent.current = false;
      }
    };

    fetchOrCreateAIContent();
  }, [doctor?.id, retryAttempts]); // Only depend on doctor.id and retryAttempts

  const handleShowQuiz = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setShowChatModal(true);
  };

  const handleRetryContent = () => {
    setRetryAttempts(prev => prev + 1);
  };

  // Utility functions
  const safeArray = (arr: any, fallback: string[] = []) => {
    if (Array.isArray(arr) && arr.length > 0) {
      return arr.filter(item => typeof item === 'string' && item.trim().length > 0);
    }
    return fallback;
  };

  const safeText = (text: any, fallback: string = '') => {
    return (typeof text === 'string' && text.trim()) ? text.trim() : fallback;
  };

  const doctorAvatarUrl = doctor?.avatar_url || '/lovable-uploads/6b38df79-5ad8-494b-83ed-7dba6c54d4b1.png';

  if (!doctor || loadingAI) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Generating Your Personalized Assessment</h3>
          <p className="text-gray-600">Creating comprehensive content tailored to your needs...</p>
          <div className="mt-4 text-sm text-gray-500">This may take a few moments</div>
        </div>
      </div>
    );
  }

  if (aiContent?.error || contentError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto p-8 bg-red-50 border border-red-200 text-red-800 rounded-2xl shadow-lg">
          <div className="text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-2xl font-bold mb-4">Content Generation Failed</h2>
            <p className="mb-6">{contentError || aiContent?.error || 'An unexpected error occurred while generating your personalized content.'}</p>
            <button
              onClick={handleRetryContent}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Rest of the component JSX would go here...
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Your existing JSX content */}
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          {safeText(aiContent?.heroTitle, 'Nasal Airway Obstruction Assessment')}
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          {safeText(aiContent?.heroSubtitle, 'Take our comprehensive assessment to understand your nasal breathing issues')}
        </p>
        
        <button
          onClick={handleShowQuiz}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg"
        >
          Start Assessment
        </button>
      </div>

      {/* Chat Widget */}
      {showChatWidget && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={handleShowQuiz}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors"
          >
            💬
          </button>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-96">
            <EmbeddedChatBot
              quizType="NOSE"
              shareKey=""
              doctorId={doctor.id}
              customQuiz={null}
              quizData={quizzes.NOSE}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NOSELandingPage;
