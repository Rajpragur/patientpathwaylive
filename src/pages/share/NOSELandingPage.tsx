import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { EmbeddedChatBot } from '@/components/quiz/EmbeddedChatBot';
import { useAuth } from '@/hooks/useAuth';
import { quizzes } from '@/data/quizzes';
import { supabase } from '@/integrations/supabase/client';
// import { fetchDoctorById } from '../../api/doctor'; // Placeholder for doctor data fetch
// import { NOSEQuizEmbed } from '../../components/quiz/NOSEQuizEmbed'; // Placeholder for quiz embed
// import ChatbotWidget from '../../components/share/ChatbotWidget'; // Placeholder for chatbot

interface DoctorProfile {
  id: string;
  name: string;
  credentials: string;
  locations: { city: string; address: string; phone: string }[];
  testimonials: { text: string; author: string; location: string }[];
  website: string;
  avatar_url?: string;
  // ...other fields
}

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
    const timer = setTimeout(() => setShowChatbot(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  const handleShowQuiz = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setShowAboveFoldQuiz(true);
    setTimeout(() => {
      footerQuizRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Dynamically generate the quiz iframe src
  const quizIframeSrc = `${window.location.origin}/quiz/nose?source=website&utm_source=website&utm_medium=web&utm_campaign=quiz_share`;
  // Use the doctor's avatar or a default logo
  const doctorAvatarUrl = doctor?.avatar_url || '/lovable-uploads/6b38df79-5ad8-494b-83ed-7dba6c54d4b1.png';

  if (!doctor) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      {/* Above the Fold */}
      <section className="max-w-4xl mx-auto px-4 text-center mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-[#0E7C9D] to-[#FD904B] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
          <img src={doctorAvatarUrl} alt="Practice Logo" className="w-12 h-12 object-contain" />
        </div>
        <h1 className="text-5xl font-bold text-[#0E7C9D] mb-4">Struggling to Breathe Through Your Nose?</h1>
        <p className="text-xl text-gray-700 mb-6">Take Our Quick "Nose Test" to See If You Have Nasal Airway Obstruction</p>
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
          <p className="text-lg text-gray-700 mb-4">Nasal Airway Obstruction (NAO) occurs when airflow through the nose is chronically limited—most commonly by structural causes—and can significantly degrade sleep, energy, exercise capacity, and quality of life.</p>
        </EditableSection>
      </section>

      {/* Symptoms & Impact */}
      <section className="max-w-3xl mx-auto mb-12">
        <EditableSection editable={isEditable}>
          <h2 className="text-2xl font-semibold text-[#0E7C9D] mb-2">Symptoms & Impact</h2>
          <ul className="list-disc list-inside text-gray-700 text-lg mb-4">
            <li>Chronic nasal congestion or stuffiness</li>
            <li>Difficulty breathing through the nose</li>
            <li>Snoring or disturbed sleep</li>
            <li>Reduced sense of smell</li>
            <li>Impaired exercise tolerance</li>
            <li>Daytime fatigue</li>
          </ul>
        </EditableSection>
      </section>

      {/* Treatment Options */}
      <section className="max-w-4xl mx-auto mb-12">
        <EditableSection editable={isEditable}>
          <h2 className="text-2xl font-semibold text-[#0E7C9D] mb-4">Comprehensive Treatment Options at {doctor.name.split(' ')[0]}'s Practice</h2>
          <p className="text-gray-700 mb-4">Our board-certified ENT specialists—{doctor.name}, {doctor.credentials}—use advanced diagnostic tools and personalized treatment plans tailored to your unique nasal anatomy. We proudly serve patients at our convenient locations.</p>
          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-2">Treatment Options: From Gentle to Surgical</h3>
            <ul className="list-disc list-inside text-gray-700 mb-2">
              <li><b>Medical Management:</b> Decongestants, nasal corticosteroids, antihistamines. Non-invasive, first-line, but may not address structural issues.</li>
              <li><b>VivAer (RF Remodeling):</b> In-office, incisionless, 15-minute radiofrequency reshaping of nasal valve cartilage/tissue. Immediate, long-term relief, minimal recovery.</li>
              <li><b>Latera Absorbable Implant:</b> Minimally invasive, supports collapsing nasal valve cartilage, dissolves over time, minimal downtime.</li>
              <li><b>Septoplasty:</b> Surgical correction of deviated septum, under anesthesia, 1–2 week recovery.</li>
              <li><b>Turbinate Reduction:</b> Outpatient, reduces swollen turbinates, improves airflow, preserves function.</li>
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
              <tr>
                <td className="py-2 px-4">Medical Management</td>
                <td className="py-2 px-4">Non-invasive, easy, first-line</td>
                <td className="py-2 px-4">Does not fix structural issues</td>
                <td className="py-2 px-4">None</td>
              </tr>
              <tr>
                <td className="py-2 px-4">VivAer</td>
                <td className="py-2 px-4">Incisionless, quick, lasting relief</td>
                <td className="py-2 px-4">Not for all causes</td>
                <td className="py-2 px-4">Minimally invasive</td>
              </tr>
              <tr>
                <td className="py-2 px-4">Latera</td>
                <td className="py-2 px-4">Supports cartilage, office-based</td>
                <td className="py-2 px-4">Implant, rare side effects</td>
                <td className="py-2 px-4">Minimally invasive</td>
              </tr>
              <tr>
                <td className="py-2 px-4">Septoplasty</td>
                <td className="py-2 px-4">Definitive for septal deviation</td>
                <td className="py-2 px-4">Surgical, recovery time</td>
                <td className="py-2 px-4">Surgical</td>
              </tr>
              <tr>
                <td className="py-2 px-4">Turbinate Reduction</td>
                <td className="py-2 px-4">Improves airflow, outpatient</td>
                <td className="py-2 px-4">May need repeat, rare side effects</td>
                <td className="py-2 px-4">Minimally invasive</td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Mid-page Quiz Embed */}
        <div className="my-8">
          <EmbeddedChatBot quizType="NOSE" doctorId={doctorId || doctor.id} quizData={quizzes.NOSE} doctorAvatarUrl={doctorAvatarUrl} />
        </div>
      </section>

      {/* VivAer & Latera Overviews */}
      <section className="max-w-3xl mx-auto mb-12">
        <EditableSection editable={isEditable}>
          <h2 className="text-2xl font-semibold text-[#0E7C9D] mb-2">VivAer Overview</h2>
          <p className="text-gray-700 mb-4">VivAer uses a small stylus and temperature-controlled radiofrequency to gently remodel tissue in the nasal valve area. Designed to treat nasal valve collapse without incisions or tissue removal. Quick, local anesthesia, lasting results. Over 90% of patients report improved breathing.</p>
          <h2 className="text-2xl font-semibold text-[#0E7C9D] mb-2">Latera Overview</h2>
          <p className="text-gray-700 mb-4">Latera is a bioabsorbable implant placed under local anesthesia that supports nasal sidewalls, maintaining an open airway by reinforcing cartilage. Absorbs over 18 months, allowing natural tissue support to take over.</p>
        </EditableSection>
      </section>

      {/* Surgical Procedures */}
      <section className="max-w-3xl mx-auto mb-12">
        <EditableSection editable={isEditable}>
          <h2 className="text-2xl font-semibold text-[#0E7C9D] mb-2">Surgical Procedures</h2>
          <p className="text-gray-700 mb-4">Septoplasty corrects a deviated septum by realigning or reshaping nasal cartilage and bone, often combined with other procedures for maximum relief. Turbinate reduction uses minimally invasive tools to reduce swollen turbinates. Recovery is typically within days.</p>
        </EditableSection>
      </section>

      {/* Call to Action */}
      <section className="max-w-3xl mx-auto mb-12 text-center">
        <EditableSection editable={isEditable}>
          <h2 className="text-2xl font-semibold text-[#0E7C9D] mb-2">Take the Next Step</h2>
          <p className="text-gray-700 mb-4">Not sure which treatment is appropriate? Start with our brief Nose Test. This tool helps determine if nasal obstruction may be the cause of your symptoms and what options might suit your condition.</p>
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
            <li>Board-Certified ENT Specialists</li>
            <li>Minimally Invasive, Office-Based Treatment Options</li>
            <li>Thousands of Satisfied Patients</li>
            <li>Multiple Convenient Locations</li>
            <li>Insurance Accepted, No Referral Needed</li>
          </ul>
        </EditableSection>
      </section>

      {/* Testimonials */}
      <section className="max-w-3xl mx-auto mb-12">
        <h2 className="text-2xl font-semibold text-[#0E7C9D] mb-4">Patient Testimonials</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {doctor.testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-6 text-gray-700">
              <p className="mb-2">"{t.text}"</p>
              <div className="text-sm text-gray-500">— {t.author}, {t.location}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Info */}
      <section className="max-w-3xl mx-auto mb-12">
        <h2 className="text-2xl font-semibold text-[#0E7C9D] mb-4">Contact Us</h2>
        <div className="mb-4">
          <button
            onClick={handleShowQuiz}
            className="inline-block bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] hover:from-[#0E7C9D]/90 hover:to-[#FD904B]/90 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg text-lg mb-2"
          >
            Take the Nose Test Now »
          </button>
        </div>
        <div className="mb-4">
          {doctor.locations.map((loc, i) => (
            <div key={i} className="mb-2">
              <span className="font-semibold">{loc.city}:</span> <a href={`tel:${loc.phone.replace(/[^\d]/g, '')}`} className="text-blue-700 underline">{loc.phone}</a> | {loc.address}
            </div>
          ))}
        </div>
        <div className="mb-4">
          <a href={doctor.website} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">Visit Practice Website</a>
        </div>
      </section>

      {/* Footer Quiz Embed */}
      <section id="nose-quiz-footer" className="max-w-3xl mx-auto mb-12" ref={footerQuizRef}>
        <EmbeddedChatBot quizType="NOSE" doctorId={doctorId || doctor.id} quizData={quizzes.NOSE} doctorAvatarUrl={doctorAvatarUrl} />
      </section>

      {/* Sources */}
      <footer className="max-w-3xl mx-auto mb-8 text-xs text-gray-500">
        <h3 className="font-semibold mb-2">Sources</h3>
        <ul className="list-disc list-inside">
          {sources.map((s, i) => (
            <li key={i}><a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">{s.label}</a></li>
          ))}
        </ul>
      </footer>

      {/* Chatbot Widget (pops up after 30s) */}
      {showChatbot && (
        // <ChatbotWidget doctorId={doctor.id} />
        <div className="fixed bottom-6 right-6 z-50">
          <div className="w-20 h-20 bg-gradient-to-br from-[#0E7C9D] to-[#FD904B] rounded-full flex items-center justify-center shadow-xl cursor-pointer">
            <span className="text-white text-3xl">💬</span>
          </div>
          <div className="mt-2 bg-white rounded-xl shadow-lg p-4 text-gray-700 max-w-xs">[Chatbot pops up here after 30s]</div>
        </div>
      )}
    </div>
  );
};

export default NOSELandingPage; 