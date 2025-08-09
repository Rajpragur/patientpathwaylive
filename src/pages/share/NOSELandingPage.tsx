import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { EmbeddedChatBot } from '@/components/quiz/EmbeddedChatBot';
import { useAuth } from '@/hooks/useAuth';
import { quizzes } from '@/data/quizzes';
import { supabase } from '@/integrations/supabase/client';
import { fetchGeneratedPageContent } from '../../lib/contentGenerator';
import { DoctorProfile, Location } from '@/types/doctor';
import { PageContent, Testimonial, TreatmentOption } from '../../types/content';

// Add default doctor profile
const defaultDoctor: DoctorProfile = {
  id: '',
  name: 'Dr. Smith',
  first_name: 'Dr.',
  last_name: 'Smith',
  credentials: 'MD',
  specialty: 'MD',
  location: [{
    city: 'Main Office',
    address: 'Please contact for address',
    phone: 'Please contact for phone'
  }],
  clinic_name: 'Main Office',
  phone: 'Please contact for phone',
  testimonials: [
    {
      text: 'Great experience with the treatment.',
      author: 'Patient',
      location: 'Local Area'
    }
  ],
  website: '',
  avatar_url: '/lovable-uploads/default-doctor-avatar.png',
};

// Add default page content
const defaultPageContent: PageContent = {
  headline: 'Advanced Nasal Treatment Solutions',
  intro: 'Discover personalized solutions for better breathing and improved quality of life.',
  whatIsNAO: 'Nasal Airway Obstruction (NAO) is a condition that affects breathing through your nose, impacting daily life and sleep quality.',
  symptoms: [
    'Difficulty breathing through nose',
    'Congestion or stuffiness',
    'Trouble sleeping or snoring',
    'Inability to get enough air during exercise',
    'Nasal blockage or obstruction',
    'Trouble breathing through one or both sides of nose',
    'Need to breathe through the mouth',
    'Fatigue due to poor sleep quality',
    'Reduced sense of smell'
  ],
  treatments: 'We offer a comprehensive range of treatments tailored to your specific needs.',
  treatmentOptions: [
    {
      name: 'Conservative Treatment',
      pros: 'Non-invasive, low risk',
      cons: 'May not address underlying cause',
      invasiveness: 'Minimal'
    },
    {
      name: 'VivAer Procedure',
      pros: 'Minimally invasive, quick recovery',
      cons: 'May not be suitable for all cases',
      invasiveness: 'Minimal'
    },
    {
      name: 'LATERA Implant',
      pros: 'Supports nasal wall, improved breathing',
      cons: 'Minor procedure required',
      invasiveness: 'Moderate'
    }
  ],
  vivAerOverview: 'VivAer is a non-invasive solution that uses temperature-controlled radiofrequency energy to reshape nasal tissues and improve airflow.',
  lateraOverview: 'LATERA is an absorbable nasal implant that supports upper and lower lateral cartilage, helping to prevent nasal wall collapse.',
  surgicalProcedures: 'When necessary, we offer advanced surgical solutions using the latest techniques and technology.',
  whyChoose: 'Board-certified expertise, comprehensive care approach, and proven patient satisfaction.',
  testimonials: [
    {
      text: 'Life-changing improvement in my breathing.',
      author: 'Patient',
      location: 'Local Area'
    },
    {
      text: 'Professional care with excellent results.',
      author: 'Patient',
      location: 'Local Area'
    }
  ],
  contact: 'Schedule your consultation today.',
  cta: 'Take our quick assessment to understand your nasal breathing concerns.',
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#0ea5e9'
  }
};

// ... (defaultDoctor, defaultPageContent, EditableSection, defaultChatbotColors remain the same)
interface ChatbotColors {
  primary: string;
  background: string;
  text: string;
  userBubble: string;
  botBubble: string;
  userText: string;
  botText: string;
}

// Add defaultChatbotColors constant
const defaultChatbotColors: ChatbotColors = {
  primary: '#2563eb',
  background: '#ffffff', 
  text: '#ffffff',
  userBubble: '#2563eb',
  botBubble: '#f1f5f9',
  userText: '#ffffff',
  botText: '#334155'
};

const safeList = (text: string, defaultItem: string): string[] => {
  if (!text || text.trim() === '') {
    return [defaultItem];
  }
  // Simple split by period followed by optional whitespace or newline
  return text.split(/(?<=\.)\s*|\n/).filter(item => item.trim() !== '');
};

const isTestimonial = (obj: any): obj is Testimonial => {
  return obj && 
    typeof obj === 'object' && 
    typeof obj.text === 'string' &&
    typeof obj.author === 'string' &&
    typeof obj.location === 'string';
};

const isTreatmentOption = (obj: any): obj is TreatmentOption => {
  return obj && 
    typeof obj === 'object' &&
    typeof obj.name === 'string' &&
    typeof obj.pros === 'string' &&
    typeof obj.cons === 'string' &&
    typeof obj.invasiveness === 'string';
};

// Update the getSafeContent function
const getSafeContent = (content: PageContent | null): PageContent => {
  if (!content) return defaultPageContent;

  return {
    ...defaultPageContent,
    ...content,
    symptoms: Array.isArray(content.symptoms) ? content.symptoms : defaultPageContent.symptoms,
    treatmentOptions: Array.isArray(content.treatmentOptions) 
      ? content.treatmentOptions.filter(isTreatmentOption)
      : defaultPageContent.treatmentOptions,
    testimonials: Array.isArray(content.testimonials)
      ? content.testimonials.filter(isTestimonial)
      : defaultPageContent.testimonials,
  };
};

const getAvatarUrl = (doctor: DoctorProfile): string => {
  return doctor.avatar_url || defaultDoctor.avatar_url || '/lovable-uploads/default-doctor-avatar.png';
};

const getDoctorName = (doctor: DoctorProfile): string => {
  if (doctor.name) return doctor.name;
  if (doctor.first_name || doctor.last_name) {
    return `${doctor.first_name || 'Dr.'} ${doctor.last_name || 'Smith'}`;
  }
  return 'Dr. Smith';
};

const getDoctorFirstName = (doctor: DoctorProfile): string => {
  if (doctor.first_name) return doctor.first_name;
  const fullName = getDoctorName(doctor);
  return fullName.split(' ')[0];
};

// Add EditableSection component if not already defined
interface EditableSectionProps {
  editable: boolean;
  children: React.ReactNode;
}

const EditableSection: React.FC<EditableSectionProps> = ({ editable, children }) => {
  if (!editable) return <>{children}</>;
  return (
    <div className="relative group">
      {children}
      <div className="absolute inset-0 border-2 border-dashed border-blue-400 opacity-0 group-hover:opacity-100 pointer-events-none rounded-lg"></div>
    </div>
  );
};
// Add WebsiteEditor component
const WebsiteEditor: React.FC<{ doctor: DoctorProfile }> = ({ doctor }) => {
  const [website, setWebsite] = useState(doctor.website || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('doctor_profiles')
        .update({ website })
        .eq('id', doctor.id);

      if (error) throw error;
      alert('Website URL saved successfully!');
    } catch (error) {
      console.error('Error saving website:', error);
      alert('Failed to save website URL');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mt-4">
      <h3 className="font-semibold mb-2">Edit Website URL</h3>
      <div className="flex gap-2">
        <input
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="Enter your website URL"
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
};

const NOSELandingPage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<DoctorProfile>(defaultDoctor);
  const [isEditable, setIsEditable] = useState(false);
  const [aiContent, setAIContent] = useState<PageContent>(defaultPageContent);
  const [loadingAI, setLoadingAI] = useState(true);
  const [showChatWidget, setShowChatWidget] = useState(true);
  const [showChatMessage, setShowChatMessage] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatbotColors, setChatbotColors] = useState<ChatbotColors>(defaultChatbotColors);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const generateAttempted = useRef(false);
  
  const validatePageContent = (content: any): PageContent => {
    // This function acts as a final client-side safeguard/default applicator
    // The primary validation happens on the backend.
    return {
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
  };

  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!doctorId) {
        setDoctor(defaultDoctor);
        return;
      }

      try {
        // Update the select to include website
        const { data, error } = await supabase
          .from('doctor_profiles')
          .select(`
            id,
            first_name,
            last_name,
            specialty,
            clinic_name,
            phone,
            location,
            avatar_url,
            website
          `)
          .eq('id', doctorId)
          .single();

        if (error) {
          console.error('Error fetching doctor profile:', error);
          setDoctor(defaultDoctor);
          return;
        }

        if (data) {
          const formattedDoctor: DoctorProfile = {
            id: data.id || '',
            name: `${data.first_name || 'Dr.'} ${data.last_name || 'Smith'}`,
            first_name: data.first_name,
            last_name: data.last_name,
            credentials: data.specialty || 'MD',
            specialty: data.specialty,
            location: formatLocations(data),
            clinic_name: data.clinic_name,
            phone: data.phone,
            testimonials: defaultDoctor.testimonials,
            website: data.website || '', // Add website handling
            avatar_url: data.avatar_url || defaultDoctor.avatar_url
          };

          console.log('Doctor website:', formattedDoctor.website); // Debug log
          setDoctor(formattedDoctor);
        } else {
          setDoctor(defaultDoctor);
        }
      } catch (error) {
        console.error('Error in fetchDoctorData:', error);
        setDoctor(defaultDoctor);
      }
    };

    // Helper function to format locations
    const formatLocations = (data: any): Location[] => {
      if (data.location || data.clinic_name || data.phone) {
        return [{
          city: data.location || 'Main Office',
          address: data.clinic_name || 'Please contact for address',
          phone: data.phone || 'Please contact for phone'
        }];
      }
      return defaultDoctor.location;
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
      if (!doctor?.id || !user?.id) return;
      try {
        const { data, error } = await supabase
          .from('ai_landing_pages')
          .select('chatbot_colors')
          .eq('user_id', user.id)
          .eq('doctor_id', doctor.id)
          .single();
      
        if (error) throw error;
      
        if (data?.chatbot_colors) {
          setChatbotColors(data.chatbot_colors as ChatbotColors);
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
// Add this function to save generated content to Supabase
const saveGeneratedContent = async (content: PageContent, doctorId: string, userId: string) => {
  try {
    // Save to ai_landing_pages table
    const { data, error } = await supabase
      .from('ai_landing_pages')
      .upsert({
        user_id: userId,
        doctor_id: doctorId,
        content: content,
        chatbot_colors: chatbotColors,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,doctor_id'
      });

    if (error) throw error;
    console.log('✅ Content saved to database');
    return data;
  } catch (error) {
    console.error('❌ Error saving content:', error);
    throw error;
  }
};

// Add this function to fetch existing content from database
const fetchExistingContent = async (doctorId: string, userId: string): Promise<PageContent | null> => {
  try {
    const { data, error } = await supabase
      .from('ai_landing_pages')
      .select('content, chatbot_colors, updated_at')
      .eq('user_id', userId)
      .eq('doctor_id', doctorId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No existing content found
        console.log('📝 No existing content found, will generate new');
        return null;
      }
      throw error;
    }

    if (data?.content) {
      console.log('✅ Found existing content from:', data.updated_at);
      
      // Update chatbot colors if available
      if (data.chatbot_colors) {
        setChatbotColors(data.chatbot_colors as ChatbotColors);
      }
      
      return data.content as PageContent;
    }

    return null;
  } catch (error) {
    console.error('❌ Error fetching existing content:', error);
    return null;
  }
};

// Modified loadAIContent function
const loadAIContent = async () => {
  if (!doctor?.id || !user?.id || generateAttempted.current) return;

  console.group('🏥 Doctor Website Content Loading');
  console.log('Doctor:', {
    name: doctor.name,
    website: doctor.website,
    specialty: doctor.specialty
  });

  setLoadingAI(true);
  setGenerationError(null);
  generateAttempted.current = true;

  try {
    // First, try to fetch existing content from database
    const existingContent = await fetchExistingContent(doctor.id, user.id);
    
    if (existingContent) {
      console.log('🎯 Using existing content from database');
      setAIContent(existingContent);
      setLoadingAI(false);
      console.groupEnd();
      return;
    }

    // No existing content, generate new
    console.log('🤖 Generating new content...');
    
    let websiteUrl = doctor.website || '';
    if (websiteUrl && !websiteUrl.startsWith('http')) {
      websiteUrl = `https://${websiteUrl}`;
    }

    console.log('🌐 Attempting to fetch content for website:', websiteUrl);

    const generatedContent = await fetchGeneratedPageContent(
      doctor.id,
      user.id,
      websiteUrl,
      doctor
    );

    if (!generatedContent) {
      throw new Error('No content generated');
    }

    console.group('🎯 Generated Content');
    console.log('Headlines:', generatedContent.headline);
    console.log('Intro:', generatedContent.intro);
    console.log('Treatment Options:', generatedContent.treatmentOptions);
    console.log('Theme Colors:', generatedContent.colors);
    console.groupEnd();

    // Save the generated content to database
    await saveGeneratedContent(generatedContent, doctor.id, user.id);

    setAIContent(generatedContent);
    
    if (generatedContent.colors) {
      const newChatbotColors: ChatbotColors = {
        primary: generatedContent.colors.primary,
        background: '#ffffff',
        text: '#ffffff',
        userBubble: generatedContent.colors.primary,
        botBubble: '#f1f5f9',
        userText: '#ffffff',
        botText: '#334155'
      };
      console.log('🤖 Chatbot Theme:', newChatbotColors);
      setChatbotColors(newChatbotColors);
    }

  } catch (error: any) {
    console.error('❌ Content Generation Error:', error);
    const errorMessage = error.message || 'Unknown error';
    setGenerationError(
      `Failed to generate content: ${errorMessage}. Using default content.`
    );
    // Use doctor-specific default content
    setAIContent({
      ...defaultPageContent,
      headline: `Advanced Nasal Treatment with ${doctor.name}`,
      intro: `Welcome to ${doctor.name}'s specialized nasal treatment center.`
    });
  } finally {
    setLoadingAI(false);
    console.groupEnd();
  }
};

// Optional: Add a regenerate content function
const regenerateContent = async () => {
  if (!doctor?.id || !user?.id) return;
  
  setLoadingAI(true);
  setGenerationError(null);
  
  try {
    let websiteUrl = doctor.website || '';
    if (websiteUrl && !websiteUrl.startsWith('http')) {
      websiteUrl = `https://${websiteUrl}`;
    }

    const generatedContent = await fetchGeneratedPageContent(
      doctor.id,
      user.id,
      websiteUrl,
      doctor
    );

    if (generatedContent) {
      await saveGeneratedContent(generatedContent, doctor.id, user.id);
      setAIContent(generatedContent);
      
      if (generatedContent.colors) {
        const newChatbotColors: ChatbotColors = {
          primary: generatedContent.colors.primary,
          background: '#ffffff',
          text: '#ffffff',
          userBubble: generatedContent.colors.primary,
          botBubble: '#f1f5f9',
          userText: '#ffffff',
          botText: '#334155'
        };
        setChatbotColors(newChatbotColors);
      }
    }
  } catch (error) {
    console.error('Error regenerating content:', error);
    setGenerationError('Failed to regenerate content');
  } finally {
    setLoadingAI(false);
  }
};
  useEffect(() => {
    const loadAIContent = async () => {
      if (!doctor?.id || !user?.id || generateAttempted.current) return;

      console.group('🏥 Doctor Website Content Generation');
      console.log('Doctor:', {
        name: doctor.name,
        website: doctor.website,
        specialty: doctor.specialty
      });

      setLoadingAI(true);
      setGenerationError(null);
      generateAttempted.current = true;

      try {
        // Add website validation
        let websiteUrl = doctor.website || '';
        if (websiteUrl && !websiteUrl.startsWith('http')) {
          websiteUrl = `https://${websiteUrl}`;
        }

        console.log('🌐 Attempting to fetch content for website:', websiteUrl);

        // Generate new content
        const generatedContent = await fetchGeneratedPageContent(
          doctor.id,
          user.id,
          websiteUrl,
          doctor
        );

        if (!generatedContent) {
          throw new Error('No content generated');
        }

        console.group('🎯 Generated Content');
        console.log('Headlines:', generatedContent.headline);
        console.log('Intro:', generatedContent.intro);
        console.log('Treatment Options:', generatedContent.treatmentOptions);
        console.log('Theme Colors:', generatedContent.colors);
        console.groupEnd();

        setAIContent(generatedContent);
        
        if (generatedContent.colors) {
          const newChatbotColors: ChatbotColors = {
            primary: generatedContent.colors.primary,
            background: '#ffffff',
            text: '#ffffff',
            userBubble: generatedContent.colors.primary,
            botBubble: '#f1f5f9',
            userText: '#ffffff',
            botText: '#334155'
          };
          console.log('🤖 Chatbot Theme:', newChatbotColors);
          setChatbotColors(newChatbotColors);
        }

      } catch (error: any) {
        console.error('❌ Content Generation Error:', error);
        const errorMessage = error.message || 'Unknown error';
        setGenerationError(
          `Failed to generate content: ${errorMessage}. Using default content.`
        );
        // Use doctor-specific default content
        setAIContent({
          ...defaultPageContent,
          headline: `Advanced Nasal Treatment with ${doctor.name}`,
          intro: `Welcome to ${doctor.name}'s specialized nasal treatment center.`
        });
      } finally {
        setLoadingAI(false);
        console.groupEnd();
      }
    };

    if (doctor && user) {
      loadAIContent();
    }
  }, [doctor, user]);

  const handleShowQuiz = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setShowChatModal(true);
  };

  const safeContent = getSafeContent(aiContent);
  const doctorAvatarUrl = getAvatarUrl(doctor);
  const doctorName = getDoctorName(doctor);
  const doctorFirstName = getDoctorFirstName(doctor);

  // Defensive fallback for aiContent arrays
  const symptomsList = Array.isArray(aiContent?.symptoms) ? aiContent.symptoms : [];
  const treatmentOptionsList = Array.isArray(aiContent?.treatmentOptions) ? aiContent.treatmentOptions : [];
  const testimonialsList = Array.isArray(aiContent?.testimonials) ? aiContent.testimonials : [];

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
    if (!showChatWidget || !aiContent) return null;

    return (
      <>
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative">
            {showChatMessage && (
              <div 
                className="absolute bottom-24 right-2 bg-white rounded-2xl shadow-2xl p-6 mb-2 border border-gray-100 animate-slideIn" 
                style={{ width: '340px', minWidth: '340px' }}
              >
                <div className="text-sm text-gray-700 mb-3 font-medium">
                  {aiContent.cta || 'Take our quick assessment'}
                </div>
                <div className="text-xs text-gray-500 flex items-center">
                  <span>Click to start the quiz</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
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
            style={{ overflow: 'hidden', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) { setShowChatModal(false); } }}
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl relative overflow-hidden transform transition-all duration-300 ease-out animate-slideIn" style={{ height: '90vh' }}>
              <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-6 flex justify-between items-center sticky top-0 z-10"
              style={{ backgroundColor: chatbotColors.primary, color: chatbotColors.text }}>
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
                  doctorId={doctor.id}
                  quizData={quizzes.NOSE}
                  doctorAvatarUrl={doctorAvatarUrl}
                  chatbotColors={chatbotColors}
                />
              </div>
            </div>
          </div>
        )}
        <style>
          {`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideIn { from { opacity: 0; transform: scale(0.95) translateY(-10px); } to { opacity: 1, transform: scale(1) translateY(0); } }
            .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
            .animate-slideIn { animation: slideIn 0.3s ease-out; }
          `}
        </style>
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
              <img src={doctorAvatarUrl} alt="Clinic's Logo" className="w-20 rounded-xl object-cover" />
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
                {symptomsList.map((symptom: string, i: number) => (
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
                Comprehensive Treatment Options at {doctorFirstName}'s Practice
              </h2>
              <p className="text-2xl text-slate-600 mb-16 max-w-5xl mx-auto leading-relaxed">
                {aiContent.treatments}
              </p>

              <div className="mb-16">
                <h3 className="text-3xl font-semibold text-slate-800 mb-12">Treatment Options: From Gentle to Surgical</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {treatmentOptionsList.map((option, i: number) => (
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
              <h2 className="text-5xl font-bold text-slate-900 mb-16">Why Choose {doctorFirstName}'s Practice</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {safeList(aiContent?.whyChoose, 'Board-Certified ENT Specialists').map((reason: string, i: number) => (
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
              {testimonialsList.map((testimonial: { text: string; author: string; location: string }, i: number) => (
                <div key={i} className="bg-white rounded-xl p-12 border border-slate-200 relative shadow-sm hover:shadow-md transition-shadow">
                  <div className="absolute top-8 left-8 text-8xl text-slate-300">"</div>
                  <p className="text-slate-700 mb-8 pt-12 text-xl leading-relaxed italic">
                    {testimonial.text}
                  </p>
                  <div className="flex items-center justify-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-slate-900 text-lg">{testimonial.author || 'Patient'}</div>
                      <div className="text-slate-500">{testimonial.location}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <ChatWidget />
      {isEditable && <WebsiteEditor doctor={doctor} />}
    </div>
  );
};

export default NOSELandingPage;