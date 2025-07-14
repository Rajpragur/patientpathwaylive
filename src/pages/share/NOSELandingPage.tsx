import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { EmbeddedChatBot } from '@/components/quiz/EmbeddedChatBot';
import { useAuth } from '@/hooks/useAuth';
import { quizzes } from '@/data/quizzes';
import { supabase } from '@/integrations/supabase/client';
import { generatePageContent, DoctorProfile } from '../../lib/openrouter';
// import { fetchDoctorById } from '../../api/doctor'; // Placeholder for doctor data fetch
// import { NOSEQuizEmbed } from '../../components/quiz/NOSEQuizEmbed'; // Placeholder for quiz embed
// import ChatbotWidget from '../../components/share/ChatbotWidget'; // Placeholder for chatbot

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
      <button className="absolute top-2 right-2 z-10 bg-gray-200 text-xs px-2 py-1 rounded opacity-70 group-hover:opacity-100" onClick={onEdit}>
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
  const [isEditable, setIsEditable] = useState(false); // TODO: Set true if user is doctor/admin
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
          setDoctor(defaultDoctor); // Fallback to default doctor
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
            testimonials: defaultDoctor.testimonials, // Keep default testimonials for now
            website: data.website || defaultDoctor.website,
            avatar_url: data.avatar_url
          });
        } else {
          setDoctor(defaultDoctor); // Fallback to default doctor
        }
      } catch (error) {
        console.error('Error in fetchDoctorData:', error);
        setDoctor(defaultDoctor); // Fallback to default doctor
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

      // 1. Try to fetch from DB
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

      // 2. If not found, generate and save
      try {
        const generated = await generatePageContent(doctor);
        setAIContent(generated);

        // Save to DB
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
    setShowAboveFoldQuiz(true);
  };

  // Dynamically generate the quiz iframe src
  const quizIframeSrc = `${window.location.origin}/quiz/nose?source=website&utm_source=website&utm_medium=web&utm_campaign=quiz_share`;
  // Use the doctor's avatar or a default logo
  const doctorAvatarUrl = doctor?.avatar_url || '/lovable-uploads/6b38df79-5ad8-494b-83ed-7dba6c54d4b1.png';

  if (!doctor || loadingAI || !aiContent) return <div>Loading...</div>;
  if (aiContent.error) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-red-50 text-red-800 rounded-xl mt-8">
        <h2 className="text-xl font-bold mb-2">AI Content Error</h2>
        <div className="mb-2">{aiContent.error}</div>
        <pre className="overflow-x-auto text-xs bg-red-100 p-2 rounded">{aiContent.raw}</pre>
      </div>
    );
  }

  // Helper to safely render lists
  const safeList = (arr: any, fallback: string) => Array.isArray(arr) && arr.length > 0 ? arr : [fallback];

  const ChatWidget = () => {
    if (!showChatWidget) return null;
  
    return (
      <>
        {/* Chat Widget Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative">
            {/* Pulsing animation */}
            {showChatMessage && (<div className="absolute inset-0 bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] rounded-full animate-pulse"></div>)}
            
            {/* Chat bubble with message */}
            {showChatMessage && (<div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg p-3 max-w-sm mb-2 border border-gray-200">
              <div className="text-sm text-gray-800 mb-6">
              {aiContent.cta || 'Take our quick assessment to see if you have nasal obstruction!'}
              </div>
              <div className="text-xs text-gray-500">Click to start the quiz →</div>
              {/* Speech bubble tail */}
              <div className="absolute bottom-0 right-4 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white transform translate-y-full"></div>
              
              <button
                onClick={() => setShowChatWidget(false)}
                className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>)}
            
            {/* Main chat button */}
            <button
              onClick={() => setShowChatModal(true)}
              className="relative bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] hover:from-[#0E7C9D]/90 hover:to-[#FD904B]/90 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center w-16 h-16"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </div>
        </div>
  
        {/* Modal Overlay */}
        {showChatModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn"
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] relative overflow-hidden transform transition-all duration-300 ease-out animate-slideIn">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] p-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center space-x-3">
                  <img src={doctorAvatarUrl} alt="Doctor" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h3 className="text-white font-semibold">NOSE Assessment</h3>
                    <p className="text-white/80 text-sm">Quick breathing evaluation with {doctor.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChatModal(false)}
                  className="text-white hover:text-gray-200 transition-colors p-1 hover:bg-white/10 rounded-full"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Modal Content - Scrollable */}
              <div className="h-full overflow-y-auto overflow-x-hidden" style={{ height: '100%' }}>
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
        
        {/* Add CSS for animations */}
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      {/* Above the Fold */}
      <section className="max-w-4xl mx-auto px-4 text-center mb-12">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <img src={doctorAvatarUrl} alt="Practice Logo" className="w-12 h-12 object-contain" />
        </div>
        <h1 className="text-5xl font-bold text-[#0E7C9D] mb-4">{aiContent.headline || 'Struggling to Breathe Through Your Nose?'}</h1>
        <p className="text-xl text-gray-700 mb-6">{aiContent.intro || 'Take Our Quick "Nose Test" to See If You Have Nasal Airway Obstruction'}</p>
        <button
          onClick={handleShowQuiz}
          className="inline-block bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] hover:from-[#0E7C9D]/90 hover:to-[#FD904B]/90 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg text-lg mb-4"
        >
          Take the Nose Test Now »
        </button>
        {/* Embed NOSE Quiz Above the Fold (hidden until button click) */}
        <div id="nose-quiz" className="my-8" ref={aboveFoldQuizRef}>
          {showAboveFoldQuiz && (
            <iframe
              src={quizIframeSrc}
              width="100%"
              height="500px"
              frameBorder="0"
              style={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
              title="NOSE Assessment Quiz"
              allow="clipboard-write"
            />
          )}
        </div>
      </section>

      {/* What is NAO */}
      <section className="max-w-3xl mx-auto mb-12">
        <EditableSection editable={isEditable}>
          <h2 className="text-3xl font-semibold text-[#0E7C9D] mb-4">What Is Nasal Airway Obstruction?</h2>
          <p className="text-lg text-gray-700 mb-4">{aiContent.whatIsNAO || 'Nasal Airway Obstruction (NAO) occurs when airflow through the nose is chronically limited.'}</p>
        </EditableSection>
      </section>

      {/* Symptoms & Impact */}
      <section className="max-w-3xl mx-auto mb-12">
        <EditableSection editable={isEditable}>
          <h2 className="text-2xl font-semibold text-[#0E7C9D] mb-2">Symptoms & Impact</h2>
          <ul className="list-disc list-inside text-gray-700 text-lg mb-4">
            {safeList(aiContent.symptoms, 'Chronic nasal congestion or stuffiness').map((s: string, i: number) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </EditableSection>
      </section>

      {/* Treatment Options */}
      <section className="max-w-4xl mx-auto mb-12">
        <EditableSection editable={isEditable}>
          <h2 className="text-2xl font-semibold text-[#0E7C9D] mb-4">Comprehensive Treatment Options at {doctor.name.split(' ')[0]}'s Practice</h2>
          <p className="text-gray-700 mb-4">{aiContent.treatments || ''}</p>
          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-2">Treatment Options: From Gentle to Surgical</h3>
            <ul className="list-disc list-inside text-gray-700 mb-2">
              {safeList(aiContent.treatmentOptions, 'Medical Management').map((option: string, i: number) => (
                <li key={i}>{option}</li>
              ))}
            </ul>
          </div>
        </EditableSection>
        {/* Comparison Table */}
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full bg-white rounded-xl shadow text-sm">
            <thead>
              <tr className="bg-blue-100">
                <th className="py-2 px-4">Treatment</th>
                <th className="py-2 px-4">Pros</th>
                <th className="py-2 px-4">Cons</th>
                <th className="py-2 px-4">Invasiveness</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(aiContent.comparisonTable) ? aiContent.comparisonTable : []).map((row: string[], i: number) => (
                <tr key={i}>
                  {(Array.isArray(row) ? row : []).map((cell: string, j: number) => (
                    <td key={`${i}-${j}`} className="py-2 px-4">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mid-page Quiz Embed */}
      </section>

      {/* VivAer & Latera Overviews */}
      <section className="max-w-3xl mx-auto mb-12">
        <EditableSection editable={isEditable}>
          <h2 className="text-2xl font-semibold text-[#0E7C9D] mb-2">VivAer Overview</h2>
          <p className="text-gray-700 mb-4">{aiContent.vivAerOverview || ''}</p>
          <h2 className="text-2xl font-semibold text-[#0E7C9D] mb-2">Latera Overview</h2>
          <p className="text-gray-700 mb-4">{aiContent.lateraOverview || ''}</p>
        </EditableSection>
      </section>

      {/* Surgical Procedures */}
      <section className="max-w-3xl mx-auto mb-12">
        <EditableSection editable={isEditable}>
          <h2 className="text-2xl font-semibold text-[#0E7C9D] mb-2">Surgical Procedures</h2>
          <p className="text-gray-700 mb-4">{aiContent.surgicalProcedures || ''}</p>
        </EditableSection>
      </section>

      {/* Call to Action */}
      <section className="max-w-3xl mx-auto mb-12 text-center">
        <EditableSection editable={isEditable}>
          <h2 className="text-2xl font-semibold text-[#0E7C9D] mb-2">Take the Next Step</h2>
          <p className="text-gray-700 mb-4">{aiContent.cta || ''}</p>
          <button
            onClick={handleShowQuiz}
            className="inline-block bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] hover:from-[#0E7C9D]/90 hover:to-[#FD904B]/90 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg text-lg"
          >
            Take the Nose Test »
          </button>
        </EditableSection>
      </section>

      {/* Why Choose This Practice */}
      <section className="max-w-3xl mx-auto mb-12">
        <EditableSection editable={isEditable}>
          <h2 className="text-2xl font-semibold text-[#0E7C9D] mb-2">Why Choose {doctor.name.split(' ')[0]}'s Practice</h2>
          <ul className="list-disc list-inside text-gray-700 text-lg mb-4">
            {safeList(aiContent.whyChoose, 'Board-Certified ENT Specialists').map((reason: string, i: number) => (
              <li key={i}>{reason}</li>
            ))}
          </ul>
        </EditableSection>
      </section>

      {/* Testimonials */}
      <section className="max-w-3xl mx-auto mb-12">
        <h2 className="text-2xl font-semibold text-[#0E7C9D] mb-4">Patient Testimonials</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {(Array.isArray(aiContent.testimonials) ? aiContent.testimonials : []).map((t: { text: string; author: string; location: string }, i: number) => (
            <div key={i} className="bg-white rounded-xl shadow p-6 text-gray-700">
              <p className="mb-2">"{t.text || ''}"</p>
              <div className="text-sm text-gray-500">— {t.author || 'Patient'}, {t.location || ''}</div>
            </div>
          ))}
        </div>
      </section>
      <ChatWidget />
    </div>
  );
};

export default NOSELandingPage; 