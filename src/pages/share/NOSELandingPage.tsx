import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { EmbeddedChatBot } from '@/components/quiz/EmbeddedChatBot';
import { useAuth } from '@/hooks/useAuth';
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

const sources = [
  { label: 'Mayo Clinic - Septoplasty', url: 'https://www.mayoclinic.org/tests-procedures/septoplasty' },
  { label: 'Exhale Sinus & Facial Pain Center', url: 'https://www.exhalesinus.com/' },
  { label: 'Aerin Medical (VivAer)', url: 'https://www.aerinmedical.com/vivaer/' },
  { label: 'Stryker (Latera)', url: 'https://ent.stryker.com/products/latera' },
  { label: 'Health.com – Nasal Obstruction Treatments', url: 'https://www.health.com/condition/nasal-obstruction' },
];

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

const NOSELandingPage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [isEditable, setIsEditable] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showAboveFoldQuiz, setShowAboveFoldQuiz] = useState(false);
  const aboveFoldQuizRef = useRef<HTMLDivElement>(null);
  const footerQuizRef = useRef<HTMLDivElement>(null);
  const [aiContent, setAIContent] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showChatWidget, setShowChatWidget] = useState(true);
  const [showChatMessage, setShowChatMessage] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

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
          setDoctor(defaultDoctor);
          return;
        }

        if (data) {
          setDoctor({
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
          });
        } else {
          setDoctor(defaultDoctor);
        }
      } catch (error) {
        console.error('Error in fetchDoctorData:', error);
        setDoctor(defaultDoctor);
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
    const fetchOrCreateAIContent = async () => {
      if (!doctor || !user) return;

      setLoadingAI(true);

      const { data, error } = await supabase
        .from('ai_landing_pages')
        .select('content')
        .eq('user_id', user.id)
        .eq('doctor_id', doctor.id)
        .single();

      if (data && data.content) {
        setAIContent(data.content);
        setLoadingAI(false);
        return;
      }

      try {
        const generated = await generatePageContent(doctor);
        setAIContent(generated);

        await supabase.from('ai_landing_pages').insert([
          {
            user_id: user.id,
            doctor_id: doctor.id,
            content: generated,
          },
        ]);
      } catch (e) {
        setAIContent({ error: e.message });
      } finally {
        setLoadingAI(false);
      }
    };

    fetchOrCreateAIContent();
  }, [doctor, user]);

  const handleShowQuiz = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setShowChatModal(true); // Open the modal instead of inline quiz
  };

  const quizIframeSrc = `${window.location.origin}/quiz/nose?source=website&utm_source=website&utm_medium=web&utm_campaign=quiz_share`;
  const doctorAvatarUrl = doctor?.avatar_url || '/lovable-uploads/6b38df79-5ad8-494b-83ed-7dba6c54d4b1.png';

  if (!doctor || loadingAI || !aiContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your personalized assessment...</p>
        </div>
      </div>
    );
  }

  if (aiContent.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto p-8 bg-red-50 border border-red-200 text-red-800 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">AI Content Error</h2>
          <div className="mb-4 text-center">{aiContent.error}</div>
          <pre className="overflow-x-auto text-xs bg-red-100 p-4 rounded-lg border">{aiContent.raw}</pre>
        </div>
      </div>
    );
  }

  const safeList = (arr: any, fallback: string) => Array.isArray(arr) && arr.length > 0 ? arr : [fallback];

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
              <div className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-2xl p-6 mb-2 border border-gray-100 animate-slideIn" style={{ width: '340px', minWidth: '340px' }}>
                <div className="text-sm text-gray-700 mb-3 font-medium">
                  {aiContent.cta || 'Take our quick assessment to see if you have nasal obstruction!'}
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
              className="relative bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center w-16 h-16"
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
              <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-6 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center space-x-4">
                  <img src={doctorAvatarUrl} alt="Doctor" className="w-12 h-12 rounded-full object-cover border-2 border-white/30" />
                  <div>
                    <h3 className="text-white font-bold text-lg">NOSE Assessment</h3>
                    <p className="text-white/90 text-sm">Quick breathing evaluation with {doctor.name}</p>
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
                  doctorId={doctorId || doctor?.id} 
                  quizData={quizzes.NOSE} 
                  doctorAvatarUrl={doctorAvatarUrl} 
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <div className="mb-8">
          <div className="w-24 h-full rounded-3xl flex items-center justify-center mx-auto mb-6">
            <img src={doctorAvatarUrl} alt="Practice Logo" className="w-16 h-16 rounded-2xl object-cover" />
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-6 leading-tight">
            {aiContent.headline || 'Struggling to Breathe Through Your Nose?'}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            {aiContent.intro || 'Take Our Quick "Nose Test" to See If You Have Nasal Airway Obstruction'}
          </p>
          <button
            onClick={handleShowQuiz}
            className="inline-flex items-center bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-bold py-5 px-10 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg text-lg group"
          >
            <span>Take the Nose Test Now</span>
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </section>

      {/* Content Sections */}
      <div className="max-w-4xl mx-auto px-6 space-y-16">
        {/* What is NAO */}
        <section className="text-center">
          <EditableSection editable={isEditable}>
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">What Is Nasal Airway Obstruction?</h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                {aiContent.whatIsNAO || 'Nasal Airway Obstruction (NAO) occurs when airflow through the nose is chronically limited.'}
              </p>
            </div>
          </EditableSection>
        </section>

        {/* Symptoms & Impact */}
        <section className="text-center">
          <EditableSection editable={isEditable}>
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-3xl shadow-lg p-8 border border-blue-100">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Symptoms & Impact</h2>
              <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {safeList(aiContent.symptoms, 'Chronic nasal congestion or stuffiness').map((symptom: string, i: number) => (
                  <div key={i} className="flex items-center bg-white rounded-xl p-4 shadow-sm">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">{symptom}</span>
                  </div>
                ))}
              </div>
            </div>
          </EditableSection>
        </section>

        {/* Treatment Options */}
        <section className="text-center">
          <EditableSection editable={isEditable}>
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Comprehensive Treatment Options at {doctor.name.split(' ')[0]}'s Practice
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                {aiContent.treatments || ''}
              </p>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Treatment Options: From Gentle to Surgical</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  {safeList(aiContent.treatmentOptions, 'Medical Management').map((option: string, i: number) => (
                    <div key={i} className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-4 border border-blue-100">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center mb-2 mx-auto">
                        <span className="text-white font-bold text-sm">{i + 1}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{option}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-2xl shadow-sm border border-gray-200">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-500 to-teal-500 text-white">
                      <th className="py-4 px-6 text-left font-semibold">Treatment</th>
                      <th className="py-4 px-6 text-left font-semibold">Pros</th>
                      <th className="py-4 px-6 text-left font-semibold">Cons</th>
                      <th className="py-4 px-6 text-left font-semibold">Invasiveness</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(aiContent.comparisonTable) ? aiContent.comparisonTable : []).map((row: string[], i: number) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        {(Array.isArray(row) ? row : []).map((cell: string, j: number) => (
                          <td key={`${i}-${j}`} className="py-4 px-6 text-gray-700 text-sm">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </EditableSection>
        </section>

        {/* VivAer & Latera */}
        <section className="text-center">
          <EditableSection editable={isEditable}>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">VivAer Overview</h2>
                <p className="text-gray-600 leading-relaxed">{aiContent.vivAerOverview || ''}</p>
              </div>
              <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Latera Overview</h2>
                <p className="text-gray-600 leading-relaxed">{aiContent.lateraOverview || ''}</p>
              </div>
            </div>
          </EditableSection>
        </section>

        {/* Surgical Procedures */}
        <section className="text-center">
          <EditableSection editable={isEditable}>
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-3xl shadow-lg p-8 border border-blue-100">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Surgical Procedures</h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                {aiContent.surgicalProcedures || ''}
              </p>
            </div>
          </EditableSection>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <EditableSection editable={isEditable}>
            <div className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-3xl shadow-lg p-12 text-white">
              <h2 className="text-4xl font-bold mb-6">Take the Next Step</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                {aiContent.cta || ''}
              </p>
              <button
                onClick={handleShowQuiz}
                className="inline-flex items-center bg-white text-blue-600 font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg text-lg group hover:shadow-xl"
              >
                <span>Take the Nose Test</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </EditableSection>
        </section>

        {/* Why Choose */}
        <section className="text-center">
          <EditableSection editable={isEditable}>
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Why Choose {doctor.name.split(' ')[0]}'s Practice</h2>
              <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {safeList(aiContent.whyChoose, 'Board-Certified ENT Specialists').map((reason: string, i: number) => (
                  <div key={i} className="flex items-start bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-4 text-left">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </EditableSection>
        </section>

        {/* Testimonials */}
        <section className="text-center pb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Patient Testimonials</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {(Array.isArray(aiContent.testimonials) ? aiContent.testimonials : []).map((testimonial: { text: string; author: string; location: string }, i: number) => (
              <div key={i} className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100 relative">
                <div className="absolute top-4 left-4 text-6xl text-blue-200">"</div>
                <p className="text-gray-700 mb-6 pt-8 leading-relaxed italic">{testimonial.text || ''}</p>
                <div className="flex items-center justify-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-800">{testimonial.author || 'Patient'}</div>
                    <div className="text-sm text-gray-500">{testimonial.location || ''}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      
      <ChatWidget />
    </div>
  );
};

export default NOSELandingPage;