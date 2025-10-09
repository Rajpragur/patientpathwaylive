import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { EmbeddedChatBot } from '@/components/quiz/EmbeddedChatBot';
import { quizzes } from '@/data/quizzes';
import { supabase } from '@/integrations/supabase/client';
import { DoctorProfile } from '../../lib/openrouter';

const defaultDoctor: DoctorProfile = {
  id: 'demo',
  name: 'Dr. Jane Smith',
  first_name: 'Jane',
  last_name: 'Smith',
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
  const [loading, setLoading] = useState(true);
  const [chatbotColors, setChatbotColors] = useState(defaultChatbotColors);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  
  const isInitialized = useRef(false);

  const toggleAccordion = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "Is my congestion allergies, sinus infections, or structural?",
      answer: "It can be one—or a combination. We use the NOSE test, endoscopy, targeted maneuvers, and (when needed) imaging to confirm the true cause and personalize treatment."
    },
    {
      question: "Do yellow/green nasal secretions mean I need antibiotics?",
      answer: "Color alone doesn't prove a bacterial infection. We look at duration, severity, fever, facial pain, and exam findings before recommending antibiotics."
    },
    {
      question: "Do non-surgical options actually last?",
      answer: "For the right anatomy, procedures like VivAer or LATERA can provide durable relief. The key is accurate diagnosis and patient selection."
    },
    {
      question: "When is septoplasty necessary?",
      answer: "When a deviated septum is the primary driver of obstruction. We may combine it with valve or turbinate procedures for a comprehensive result."
    },
    {
      question: "How long is recovery?",
      answer: "In-office procedures typically involve minimal downtime; septoplasty/turbinate surgery generally requires about 1–2 weeks of recovery."
    }
  ];

  const fetchDoctorData = useCallback(async (actualDoctorId: string) => {
    try {
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
            first_name: data.first_name,
            last_name: data.last_name,
            clinic_name: data.clinic_name,
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
          console.log('Doctor profile with clinic name:', doctorProfile);
          setDoctor(doctorProfile);
        } else {
          setDoctor(defaultDoctor);
        }
      } catch (error) {
        console.error('Error in fetchDoctorData:', error);
        setDoctor(defaultDoctor);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isInitialized.current) return;
    
    const searchParams = new URLSearchParams(window.location.search);
    const source = searchParams.get('utm_source');
    if (source) {
      setUtmSource(source);
    }
    
    const doctorIdFromRoute = doctorId;
    const doctorIdFromQuery = searchParams.get('doctor');
    const actualDoctorId = doctorIdFromQuery || doctorIdFromRoute;
    
    if (!actualDoctorId) {
      setDoctor(defaultDoctor);
      setLoading(false);
      isInitialized.current = true;
        return;
      }
      
    fetchDoctorData(actualDoctorId);
    isInitialized.current = true;
  }, [doctorId, fetchDoctorData]);


  useEffect(() => {
    if (!doctor?.id) return;
    
    const fetchChatbotColors = async () => {
      try {
        const { data } = await supabase
              .from('ai_landing_pages')
            .select('chatbot_colors')
              .eq('doctor_id', doctor.id)
              .eq('quiz_type', 'NOSE')
              .maybeSingle();

        if (data && data.chatbot_colors) {
          setChatbotColors(data.chatbot_colors);
        }
      } catch (error) {
        console.warn('Could not fetch chatbot colors');
      }
    };
    
    fetchChatbotColors();
  }, [doctor?.id]);

  const handleShowQuiz = () => {
    // Scroll to quiz section instead of showing popup
    const quizSection = document.getElementById('nose-quiz-section');
    if (quizSection) {
      quizSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const doctorAvatarUrl = doctor?.avatar_url || '/src/assets/doctor.png';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading...</h3>
        </div>
      </div>
    );
  }


    return (
    <div className="antialiased bg-white font-sans text-gray-900">
      <main className="w-full">
        {/* Hero Section with Embedded Quiz */}
        <div className="bg-gray-100">
          <section className="cover relative bg-gradient-to-r from-blue-600 to-teal-500 px-4 sm:px-8 lg:px-16 xl:px-40 2xl:px-64 overflow-hidden py-16 lg:py-32">
            <div className="h-full absolute top-0 left-0 right-0 z-0">
              <img 
                src="/hero-bg.jpg" 
                alt="" 
                className="w-full h-full object-cover opacity-20 hidden lg:block"
              />
            </div>

            <div className="relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left Side - Hero Content */}
                <div className="text-center lg:text-left">
                  <h1 className="text-white text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6">
                    Breathing easier starts here.
                  </h1>

                  <p className="text-blue-100 text-lg md:text-xl lg:text-2xl leading-snug">
                    If you're dealing with nasal congestion, poor sleep, or
                    shortness of breath with activity, it could be nasal
                    obstruction. You're 5 clicks away from your clinically validated
                    NOSE score (0–100). {doctor ? `Dr. ${doctor.last_name} will` : "We'll"} review your results personally and
                    discuss next steps to help you breathe—and sleep—better.
                  </p>
                </div>
                {/* Right Side - Quiz Section */}
                <div id="nose-quiz-section" className="flex justify-center lg:justify-end">
                  <div className="bg-white rounded-lg shadow-lg p-2 lg:p-3 w-full max-w-sm" style={{ maxHeight: '500px' }}>
                    <div className="text-center mb-2">
                      <h2 className="text-sm lg:text-base font-bold text-gray-900 mb-1">
                        NOSE Score 
                      </h2>
                      <p className="text-gray-600 text-xs">
                        Quick Nasal Obstruction Evaluation
                      </p>
                    </div>
                    <div className="w-full" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                      <EmbeddedChatBot
                        quizType="NOSE"
                        doctorId={doctorId || doctor?.id}
                        quizData={quizzes.NOSE}
                        doctorAvatarUrl={doctorAvatarUrl}
                        chatbotColors={chatbotColors}
                        utm_source={utmSource}
                        compact={true}
                      />
                    </div>
                  </div>
                </div>
                </div>
                </div>
          </section>
        </div>

        {/* Doctor Note Section */}
        <section className="relative px-4 py-16 sm:px-8 lg:px-16 xl:px-40 2xl:px-64 lg:py-32 bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Doctor Image - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:block">
              <img 
                src={doctorAvatarUrl || '/placeholder.svg'} 
                alt="Doctor" 
                className="w-full h-80 md:h-96 object-cover rounded-2xl shadow-md"
              />
              </div>

            <div>
              <h2 className="text-3xl font-bold mb-4">A note from Dr. {doctor?.last_name || 'Vaughn'}</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you're always fighting a blocked nose, waking with a dry mouth,
                or struggling to exercise because of poor airflow, there's a good
                chance you have nasal airway obstruction (NAO).
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                The quickest way to understand how severe it is—and what to do
                next—is the NOSE test. Complete it now, and I'll review your score
                and follow up with a free phone consultation to discuss options,
                from medical therapy to minimally invasive in-office procedures.
            </p>
            <button
              onClick={handleShowQuiz}
                className="px-8 py-4 bg-teal-500 text-white rounded inline-block mt-5 font-semibold hover:bg-teal-600 transition"
            >
                Take the NOSE Test
            </button>
          </div>
        </div>
        </section>

        {/* What is NAO Section */}
        <section className="relative px-4 py-16 sm:px-8 lg:px-16 xl:px-40 2xl:px-64 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-12">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">
                What is Nasal Airway Obstruction (NAO)?
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Nasal Airway Obstruction (NAO) means airflow through your nasal
                passages is restricted. It can be caused by structural issues
                (deviated septum, nasal valve collapse) and/or inflammation
                (rhinitis, turbinate swelling, polyps). Many patients don't
                realize NAO is treatable.
              </p>
              <h3 className="text-xl font-semibold text-gray-900">
                Quality-of-life impact
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Untreated obstruction can disturb sleep, increase daytime fatigue,
                and worsen mood and focus. Chronic mouth breathing may also affect
                dental/oral health. The good news: when we correct the cause,
                patients consistently report better sleep and more daytime energy.
              </p>
              <h3 className="text-xl font-semibold text-gray-900">
                Common signs and symptoms
              </h3>
              <ul className="space-y-3">
                {[
                  "Difficulty breathing through one or both nostrils",
                  "Persistent congestion (with or without allergies)",
                  "Mouth breathing and snoring; dry mouth on waking",
                  "Facial pressure or frequent \"sinus infections\"",
                  "Fatigue, brain fog, and reduced exercise tolerance"
                ].map((symptom, i) => (
                  <li key={i} className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                    <span className="text-gray-700">{symptom}</span>
                  </li>
                ))}
              </ul>
              </div>
              
            {/* Image hidden on mobile for cleaner design */}
            <div className="hidden lg:flex justify-center">
              <img 
                src="/woman-sneezing.jpg" 
                alt="Nasal Airway" 
                className="w-full object-cover rounded-2xl shadow-lg"
                />
              </div>
            </div>
      </section>

        {/* How NOSE Test Works */}
        <section className="relative bg-gray-900 py-20">
          {/* Background image hidden on mobile for cleaner design */}
          <div className="absolute inset-0 hidden lg:block">
            <img 
              src="/woman-tissue.jpg" 
              alt="Background" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-60"></div>
              </div>

          <div className="relative max-w-3xl mx-auto px-6 text-center text-white">
            <h2 className="text-3xl font-bold mb-6">How the NOSE Test Works</h2>
            <p className="leading-relaxed mb-8 text-lg">
              The Nasal Obstruction Symptom Evaluation (NOSE) is a validated
              five-question survey. Each item is scored 0–4, then summed (commonly
              scaled to 0–100). Higher scores indicate more severe obstruction. We
              use it at baseline and to track improvement after treatment. After
              you submit, we explain your score in plain language and offer the
              most appropriate next step for you.
            </p>

            <button
              onClick={handleShowQuiz}
              className="inline-block bg-teal-500 text-white font-semibold px-8 py-4 rounded-lg shadow-lg transition hover:bg-teal-600"
            >
              Take the NOSE Test
            </button>
          </div>
        </section>

        {/* Symptom Guide Table */}
        <section className="relative px-4 py-16 sm:px-8 lg:px-16 xl:px-40 2xl:px-64 lg:py-32">
          <div className="mb-8 lg:mb-0">
            <h2 className="text-3xl font-bold mb-6">
              Why symptoms overlap—and how we narrow the cause
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              Many patients have both inflammation and structure at play. That's
              why sprays might help but never fully solve the problem—or why
              surgery alone may not relieve congestion if nasal valve collapse or
              turbinate swelling remains. Our exam identifies all contributors so
              we can treat the full picture.
            </p>

            <div className="overflow-x-auto">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center lg:text-left">
                Symptom guide at a glance
              </h3>
              <table className="w-full border border-gray-200 text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-900 font-semibold">
                  <tr>
                    <th className="px-4 py-3 border border-gray-200">Symptom/Feature</th>
                    <th className="px-4 py-3 border border-gray-200">Allergic/Non-Allergic Rhinitis</th>
                    <th className="px-4 py-3 border border-gray-200">Sinusitis (acute/chronic)</th>
                    <th className="px-4 py-3 border border-gray-200">Deviated Septum</th>
                    <th className="px-4 py-3 border border-gray-200">Nasal Valve Collapse</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-3 border border-gray-200 font-medium">Congestion</td>
                    <td className="px-4 py-3 border border-gray-200">Common</td>
                    <td className="px-4 py-3 border border-gray-200">Common</td>
                    <td className="px-4 py-3 border border-gray-200">Common</td>
                    <td className="px-4 py-3 border border-gray-200">Common</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-4 py-3 border border-gray-200 font-medium">Itchy/sneezy, clear runny nose</td>
                    <td className="px-4 py-3 border border-gray-200">Typical (esp. allergic)</td>
                    <td className="px-4 py-3 border border-gray-200">Uncommon</td>
                    <td className="px-4 py-3 border border-gray-200">No</td>
                    <td className="px-4 py-3 border border-gray-200">No</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 border border-gray-200 font-medium">Facial pressure, thick discharge</td>
                    <td className="px-4 py-3 border border-gray-200">Less typical</td>
                    <td className="px-4 py-3 border border-gray-200">Common</td>
                    <td className="px-4 py-3 border border-gray-200">No</td>
                    <td className="px-4 py-3 border border-gray-200">No</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-4 py-3 border border-gray-200 font-medium">Always blocked on one side</td>
                    <td className="px-4 py-3 border border-gray-200">Sometimes</td>
                    <td className="px-4 py-3 border border-gray-200">Sometimes</td>
                    <td className="px-4 py-3 border border-gray-200">Typical</td>
                    <td className="px-4 py-3 border border-gray-200">Possible</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 border border-gray-200 font-medium">Worse with deep breath/exercise</td>
                    <td className="px-4 py-3 border border-gray-200">No</td>
                    <td className="px-4 py-3 border border-gray-200">No</td>
                    <td className="px-4 py-3 border border-gray-200">No</td>
                    <td className="px-4 py-3 border border-gray-200">Typical</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-4 py-3 border border-gray-200 font-medium">Loss of smell (long-standing)</td>
                    <td className="px-4 py-3 border border-gray-200">Possible</td>
                    <td className="px-4 py-3 border border-gray-200">Common</td>
                    <td className="px-4 py-3 border border-gray-200">Possible</td>
                    <td className="px-4 py-3 border border-gray-200">Possible</td>
                  </tr>
                </tbody>
              </table>
          </div>

            <h2 className="text-3xl font-bold text-gray-900 my-8">
              How we confirm the cause
            </h2>
            <ul className="text-gray-700 text-lg leading-relaxed list-disc list-inside space-y-3 text-left">
              <li>
                <span className="font-semibold">Nasal endoscopy</span> — quick,
                in-office visualization of the septum, turbinates, and valves.
              </li>
              <li>
                <span className="font-semibold">Cottle/modified Cottle</span> — simple
                maneuvers to screen for nasal valve collapse during the exam.
              </li>
              <li>
                <span className="font-semibold">CT imaging</span> — ordered when sinus
                disease is suspected or for surgical planning.
              </li>
            </ul>
        </div>
      </section>

        {/* Treatment Options Cards */}
        <section className="relative px-4 py-16 sm:px-8 lg:px-16 xl:px-40 2xl:px-64 bg-gray-50">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Your personalized plan: treatment options
              </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                First-line medical care
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Saline nasal irrigation</li>
                <li>Nasal steroid sprays</li>
                <li>Antihistamines</li>
              </ul>
              <p className="mt-4 text-sm text-gray-600">
                Best for mild obstruction or persistent rhinitis.
                <span className="font-medium"> Note:</span> these do not correct
                structural narrowing.
              </p>
          </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                In-office minimally invasive options
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>VivAer® nasal airway remodeling (no incisions)</li>
                <li>Turbinate reduction (RF or microdebrider)</li>
              </ul>
                  </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Surgical correction
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Septoplasty for deviated septum</li>
              </ul>
              </div>
          </div>
        </section>

        {/* Mainline Treatment Options */}
        <section className="relative px-4 py-16 sm:px-8 lg:px-16 xl:px-40 2xl:px-64 bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Mainline Treatment Options (6)
              </h2>
              <ul className="space-y-6 text-gray-700">
                <li>
                  <span className="font-semibold">Medications:</span> Saline,
                  steroid/antihistamine sprays, and allergy-directed therapy to
                  reduce mucosal inflammation and congestion.
                </li>
                <li>
                  <span className="font-semibold">Septoplasty:</span> Surgical
                  straightening of a deviated septum to restore central airflow.
                </li>
                <li>
                  <span className="font-semibold">Turbinate Reduction:</span> Office
                  or OR procedure (e.g., radiofrequency or microdebrider) to
                  shrink enlarged turbinates.
                </li>
                <li>
                  <span className="font-semibold">Functional Rhinoplasty:</span>
                  Structural reconstruction (often with cartilage grafting) to
                  correct complex valve and framework issues.
                </li>
                <li>
                  <span className="font-semibold">Endoscopic procedures:</span> For
                  polyps/CRS as indicated.
                </li>
                <li>
                  <span className="font-semibold">J-flap Procedure:</span> Advanced
                  nasal valve reconstruction (repositioning the lateral/alar
                  cartilage) for severe/complex valve collapse; may be considered
                  when TMJ-related dysfunction coexists.
                </li>
              </ul>
              </div>

            {/* Image hidden on mobile for cleaner design */}
            <div className="hidden lg:flex justify-center lg:justify-end">
              <img 
                src='/mainline-treatment.jpg'
                alt="Nasal treatment illustration" 
                className="rounded-2xl shadow-lg object-cover w-full"
              />
                      </div>
                    </div>
        </section>

        {/* Treatment Comparison Table */}
        <section className="relative px-4 py-16 sm:px-8 lg:px-16 xl:px-40 2xl:px-64 bg-white">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Treatment Comparison
          </h3>
          <div className="overflow-x-auto mb-8">
            <table className="w-full border border-gray-300 text-sm text-left text-gray-700">
              <thead className="bg-gray-100 text-gray-900">
                <tr>
                  <th className="border border-gray-300 px-4 py-3 font-semibold">Treatment</th>
                  <th className="border border-gray-300 px-4 py-3 font-semibold">What it does</th>
                  <th className="border border-gray-300 px-4 py-3 font-semibold">Setting & Typical Recovery</th>
                  <th className="border border-gray-300 px-4 py-3 font-semibold">Best for</th>
                  <th className="border border-gray-300 px-4 py-3 font-semibold">Advantages</th>
                  <th className="border border-gray-300 px-4 py-3 font-semibold">Considerations</th>
                    </tr>
                  </thead>
                  <tbody>
                <tr className="bg-white">
                  <td className="border border-gray-300 px-4 py-3 font-medium">Medications</td>
                  <td className="border border-gray-300 px-4 py-3">
                    Reduces mucosal swelling and allergy burden; improves airflow without structural changes.
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    Home. No downtime. Benefits accrue over days–weeks with consistent use.
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    Mild nasal obstruction or rhinitis; first-line therapy and ongoing maintenance.
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    Non-invasive, low risk, inexpensive; can clarify how much symptoms are inflammatory vs structural.
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    Does not correct structural narrowing; adherence-dependent; possible side effects (e.g., epistaxis with steroids).
                  </td>
                      </tr>

                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium">Septoplasty</td>
                  <td className="border border-gray-300 px-4 py-3">
                    Straightens a deviated septum to restore central nasal airflow.
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    Outpatient surgery under anesthesia. Typical downtime 3–7 days; return to normal activity ~1–2 weeks.
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    Documented septal deviation correlating with obstruction signs/symptoms.
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    Definitive anatomic correction; can be combined with turbinate reduction.
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    Surgical risks (bleeding, infection, septal perforation); anesthesia required; does not address valve collapse by itself.
                  </td>
                </tr>

                <tr className="bg-white">
                  <td className="border border-gray-300 px-4 py-3 font-medium">Turbinate Reduction</td>
                  <td className="border border-gray-300 px-4 py-3">
                    Shrinks enlarged turbinates to increase nasal airflow and reduce congestion.
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    In-office (RF) or outpatient (microdebrider). Recovery often few days to 1 week; transient crusting/congestion.
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    Turbinate hypertrophy (allergy/inflammation related) refractory to medical therapy.
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    Quick recovery; improves airflow; often combined with septoplasty for comprehensive relief.
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    Over-reduction risk if overtreated; may need ongoing allergy control; transient dryness/crusting.
                  </td>
                </tr>

                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium">Functional Rhinoplasty</td>
                  <td className="border border-gray-300 px-4 py-3">
                    Reconstructs nasal framework and valves (grafts, tip support) to correct complex obstruction.
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    Operating room procedure. Social downtime ~1–2 weeks; edema resolves over weeks–months.
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    Multifactor obstruction needing structural grafting.
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    Comprehensive, durable correction when simpler options are insufficient; addresses aesthetics when appropriate.
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    Higher cost; longer recovery; graft harvesting needed; surgeon expertise critical.
                  </td>
                </tr>

                <tr className="bg-white">
                  <td className="border border-gray-300 px-4 py-3 font-medium">J-flap Procedure</td>
                  <td className="border border-gray-300 px-4 py-3">
                    Repositions lateral/alar cartilage to open the external nasal valve and improve airflow.
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    Specialized OR procedure. Recovery 1–2 weeks; ongoing refinement over months.
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    Severe or complex nasal valve collapse, often with TMJ-related dysfunction.
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    Targeted reconstruction; can yield meaningful symptom improvements in selected patients.
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    Candidacy and surgeon expertise critical; higher cost; requires detailed consultation.
                  </td>
                </tr>
                  </tbody>
                </table>
              </div>
          <button 
            onClick={handleShowQuiz}
            className="inline-block bg-teal-500 text-white font-semibold px-8 py-4 rounded-lg shadow-lg transition hover:bg-teal-600"
          >
            Take the NOSE Test
          </button>
        </section>

        {/* Expanded Treatment Details */}
        <section className="relative px-4 py-16 sm:px-8 lg:px-16 xl:px-40 2xl:px-64 bg-gray-50">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Expanded Treatment Details & Recovery
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Medications</h3>
              <p className="mb-4">
                <span className="font-semibold">Overview:</span> Medical therapy
                includes saline rinses, topical steroid and antihistamine sprays,
                and, when appropriate, allergy immunotherapy. These reduce mucosal
                inflammation and congestion, clarifying whether symptoms stem from
                swelling versus structural narrowing.
              </p>
              <p>
                <span className="font-semibold">Recovery & Expectations:</span> No
                downtime. Expect incremental improvement over days to weeks with
                consistent use. Side effects are generally mild (dryness,
                occasional nosebleeds with steroids).
                  </p>
                </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Septoplasty</h3>
              <p className="mb-4">
                <span className="font-semibold">Overview:</span> Septoplasty corrects
                a deviated septum by removing or reshaping cartilage/bone to
                restore a midline airway. It can be combined with turbinate
                reduction when indicated.
              </p>
              <p>
                <span className="font-semibold">Recovery & Expectations:</span>
                Most patients resume routine activities within 1–2 weeks;
                congestion/crusting can persist temporarily. Risks include
                bleeding, infection, and rare septal perforation.
                  </p>
                </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Turbinate Reduction</h3>
              <p className="mb-4">
                <span className="font-semibold">Overview:</span> Reduces the size of
                hypertrophied turbinates using radiofrequency ablation (often
                in-office) or microdebrider techniques (often in the OR).
              </p>
              <p>
                <span className="font-semibold">Recovery & Expectations:</span>
                Typically 2–7 days of mild congestion and crusting. Saline rinses
                aid healing. Over‑reduction is avoided via conservative technique;
                ongoing allergy management may still be needed.
              </p>
              </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Nasal Valve Implants (LATERA®)
              </h3>
              <p className="mb-4">
                <span className="font-semibold">Overview:</span> An absorbable implant
                placed via a small cannula along the lateral nasal wall to support
                the internal valve against collapse. The implant gradually resorbs
                while encouraging fibrosis that maintains support.
              </p>
              <p>
                <span className="font-semibold">Recovery & Expectations:</span>
                Most patients return to normal activity within a few days.
                Temporary awareness of the implant or mild tenderness is possible.
                Not intended to fix septal deviation or significant turbinate bulk.
              </p>
          </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Functional Rhinoplasty</h3>
              <p className="mb-4">
                <span className="font-semibold">Overview:</span> Addresses
                internal/external valve compromise and structural deformities with
                cartilage grafts (e.g., spreader, alar batten) and framework
                adjustments. Can be paired with septoplasty.
              </p>
              <p>
                <span className="font-semibold">Recovery & Expectations:</span>
                Plan for 1–2 weeks of social downtime and gradual resolution of
                swelling over weeks to months. Outcomes depend on surgeon
                expertise and patient anatomy.
              </p>
          </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">J-flap Procedure</h3>
              <p className="mb-4">
                <span className="font-semibold">Overview:</span> The lateral crural
                'J-flap' repositions and reinforces the alar cartilage to enlarge
                the external nasal valve. It is considered when simpler valve
                support or implants are unlikely to suffice.
              </p>
              <p>
                <span className="font-semibold">Recovery & Expectations:</span>
                Recovery parallels functional rhinoplasty. In carefully selected
                patients, meaningful improvements in NOSE scores have been
                reported. Candidacy and surgeon experience are key to outcomes.
                For patients with TMJ symptoms, improving nasal airflow may
                indirectly help reduce mouth-breathing and related muscle strain.
              </p>
            </div>
          </div>
        </section>

        {/* Treatment comparison table (simpler) */}
        <section className="relative px-4 py-16 sm:px-8 lg:px-16 xl:px-40 2xl:px-64">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Treatment comparison
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Treatment</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">What it does</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Setting</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Best for</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Advantages</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Considerations</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 border">Medical therapy (saline, steroid sprays, antihistamines)</td>
                  <td className="px-4 py-3 border">Reduces mucosal swelling/allergy burden</td>
                  <td className="px-4 py-3 border">Home</td>
                  <td className="px-4 py-3 border">Mild NAO or rhinitis</td>
                  <td className="px-4 py-3 border">Non-invasive, easy to start</td>
                  <td className="px-4 py-3 border">Doesn't fix structural narrowing</td>
                </tr>

                <tr>
                  <td className="px-4 py-3 border">VivAer® (radiofrequency remodeling)</td>
                  <td className="px-4 py-3 border">Widens the nasal valve internally</td>
                  <td className="px-4 py-3 border">In-office</td>
                  <td className="px-4 py-3 border">Valve narrowing</td>
                  <td className="px-4 py-3 border">No cutting, fast recovery, durable relief (selected patients)</td>
                  <td className="px-4 py-3 border">Not for significant septal deviation</td>
                </tr>

                <tr>
                  <td className="px-4 py-3 border">Turbinate reduction (RF/microdebrider)</td>
                  <td className="px-4 py-3 border">Shrinks enlarged turbinates</td>
                  <td className="px-4 py-3 border">In-office/outpatient</td>
                  <td className="px-4 py-3 border">Turbinate hypertrophy</td>
                  <td className="px-4 py-3 border">Quick recovery, improves airflow</td>
                  <td className="px-4 py-3 border">Over-reduction risk if over-treated</td>
                </tr>

                <tr>
                  <td className="px-4 py-3 border">Septoplasty</td>
                  <td className="px-4 py-3 border">Straightens the deviated septum</td>
                  <td className="px-4 py-3 border">Outpatient surgery</td>
                  <td className="px-4 py-3 border">Septal deviation</td>
                  <td className="px-4 py-3 border">Definitive anatomic correction</td>
                  <td className="px-4 py-3 border">1–2 weeks recovery; anesthesia required</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-sm">
              <button
                onClick={handleShowQuiz}
              className="inline-block bg-teal-500 text-white font-semibold px-8 py-4 rounded-lg shadow-lg transition hover:bg-teal-600"
              >
              Take the NOSE Test
              </button>
          </p>
        </section>

        {/* What Happens After Test */}
        <section className="relative px-4 py-16 sm:px-8 lg:px-16 xl:px-40 2xl:px-64 bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Image hidden on mobile for cleaner design */}
            <div className="hidden lg:block">
              <img 
                src="/woman-sitting.jpg" 
                alt="Patient consultation illustration" 
                className="w-full rounded-lg shadow-md object-cover"
              />
                    </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                What happens after you take the test?
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2 font-semibold text-blue-600">1.</span>
                  You get your score immediately.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-semibold text-blue-600">2.</span>
                  {doctor ? `Dr. ${doctor.last_name} reviews` : 'We review'} your results and any notes you include.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-semibold text-blue-600">3.</span>
                  We recommend the next best step for you.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-semibold text-blue-600">4.</span>
                  Free phone consultation to answer questions and map your plan.
                </li>
              </ul>

              <div className="mt-6 flex flex-col xl:flex-row sm:justify-start gap-3">
                <button 
                  onClick={handleShowQuiz}
                  className="bg-teal-500 text-white font-semibold px-8 py-4 rounded-lg shadow-lg transition hover:bg-teal-600 w-full sm:w-auto text-center"
                >
                  Take the NOSE Test
                </button>
                <button 
                  onClick={handleShowQuiz}
                  className="bg-teal-500 text-white font-semibold px-8 py-4 rounded-lg shadow-lg transition hover:bg-teal-600 w-full sm:w-auto text-center"
                >
                  Schedule a Free Phone Consultation
                </button>
                  </div>
              </div>
          </div>
        </section>
        {/* Why Choose Section */}
        <section className="relative px-4 py-16 sm:px-8 lg:px-16 xl:px-40 2xl:px-64 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose {doctor?.clinic_name || 'Exhale Sinus'} (from Dr. {doctor?.last_name || 'Vaughn'})
              </h2>

              <ul className="space-y-4 text-gray-700 mb-8">
                <li className="flex items-start">
                  <span className="mr-3 text-blue-600 font-bold">●</span>
                  Fellowship-trained ENT care with in-office, minimally invasive solutions
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-blue-600 font-bold">●</span>
                  Thousands of patients helped across <span className="font-semibold">{doctor?.locations[0]?.city || 'Chicagoland'} area</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-blue-600 font-bold">●</span>
                  Insurance accepted; no referral required
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-blue-600 font-bold">●</span>
                  Comprehensive diagnostics that match treatment to your anatomy
                </li>
              </ul>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="md:col-span-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Doctor Bio</h3>
                  <a 
                    href={doctor?.website || 'https://www.exhalesinus.com/ryan-c-vaughn-md'} 
                    target="_blank" 
                    className="text-blue-600 hover:underline"
                    rel="noreferrer"
                  >
                    {doctor?.name || 'Dr. Ryan C. Vaughn, MD'}
                  </a>
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Contact & Locations</h3>
                  <p className="font-medium text-gray-800">
                    Practice Website:{' '}
                    <a 
                      href={doctor?.website || 'https://www.exhalesinus.com/'} 
                      target="_blank" 
                      className="text-blue-600 hover:underline"
                      rel="noreferrer"
                    >
                      {doctor?.website || 'www.exhalesinus.com'}
                    </a>
                  </p>
                    </div>
                      </div>
                      </div>

            {/* Image hidden on mobile for cleaner design */}
            <div className="hidden lg:block">
              <img 
                src='/woman-breathing.jpg'
                alt="Woman Breathing" 
                className="rounded-xl shadow-lg w-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="relative px-4 py-16 sm:px-8 lg:px-16 xl:px-40 2xl:px-64 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Frequently Asked Questions
              </h2>
              {faqs.map((faq, index) => (
                <div key={index} className="border-b">
                  <button
                    className="w-full flex justify-between items-center py-4 text-left text-lg font-medium text-gray-900 focus:outline-none"
                    onClick={() => toggleAccordion(index)}
                  >
                    <span>{faq.question}</span>
                    <svg
                      className={`w-5 h-5 transition-transform duration-300 ${
                        openFaqIndex === index ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                      </svg>
                  </button>
                  {openFaqIndex === index && (
                    <div className="pb-4 text-gray-700">{faq.answer}</div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
                References
              </h2>

              <div className="bg-white rounded-xl shadow-md p-6">
                <ul className="list-decimal list-inside space-y-4 text-gray-700">
                  <li>
                    <b>Exhale Sinus & Facial Pain Center —</b> practice
                    information and treatment offerings:{' '}
                    <a 
                      href="https://www.exhalesinus.com/" 
                target="_blank" 
                      className="text-blue-600 hover:underline"
                      rel="noreferrer"
                    >
                      https://www.exhalesinus.com/
                    </a>
                  </li>
                  <li>
                    <b>Mayo Clinic —</b> Deviated septum & septoplasty overview:{' '}
                    <a 
                      href="https://www.mayoclinic.org/tests-procedures/septoplasty" 
                      target="_blank" 
                      className="text-blue-600 hover:underline"
                      rel="noreferrer"
                    >
                      https://www.mayoclinic.org/tests-procedures/septoplasty
                    </a>
                  </li>
                  <li>
                    <b>Aerin Medical —</b> VivAer information:{' '}
                    <a 
                      href="https://www.aerinmedical.com/vivaer/" 
                      target="_blank" 
                      className="text-blue-600 hover:underline"
                      rel="noreferrer"
                    >
                      https://www.aerinmedical.com/vivaer/
                    </a>
                  </li>
                  <li>
                    <b>Stryker ENT —</b> LATERA absorbable implant:{' '}
                    <a 
                      href="https://ent.stryker.com/products/latera" 
                      target="_blank" 
                      className="text-blue-600 hover:underline"
                      rel="noreferrer"
                    >
                      https://ent.stryker.com/products/latera
                    </a>
                  </li>
                  <li>
                    <b>American Academy of Otolaryngology —</b> Patient education
                    on nasal obstruction/valves:{' '}
                    <a 
                      href="https://www.enthealth.org" 
                      target="_blank" 
                      className="text-blue-600 hover:underline"
                      rel="noreferrer"
                    >
                      https://www.enthealth.org
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative bg-gray-900 text-white">
          {/* Background image hidden on mobile for cleaner design */}
          <div className="absolute inset-0 hidden lg:block">
            <img 
              src="/bottom-image-landing.jpg" 
              alt="Nose Test Background" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>
      
          <div className="relative px-4 py-20 sm:px-8 lg:px-16 xl:px-32 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Take the NOSE Test
              </h2>
              <p className="text-lg sm:text-xl mb-8 text-gray-200">
                Find out your personalized NOSE score in just a few clicks — and
                get a free phone consultation to review your results.
              </p>
              <button 
                onClick={handleShowQuiz}
                className="inline-block bg-teal-500 text-white font-semibold px-8 py-4 rounded-lg shadow transition hover:bg-teal-600"
              >
                Take the NOSE Test
              </button>
            </div>
          </div>
        </section>
      </main>
      
    </div>
  );
};

export default NOSELandingPage;

