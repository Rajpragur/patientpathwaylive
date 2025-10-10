import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { EmbeddedCardQuiz } from '@/components/quiz/EmbeddedCardQuiz';
import { supabase } from '@/integrations/supabase/client';
import { generatePageContent, DoctorProfile } from '../../lib/openrouter';
import { useCachedData } from '@/hooks/useCachedData';
import { preloadImages } from '@/utils/imageCache';

const defaultDoctor: DoctorProfile = {
  id: 'demo',
  name: 'Dr. Jane Smith',
  credentials: 'MD, Board-Certified ENT',
  locations: [
    { city: 'Fort Worth', address: '6801 Oakmont Blvd., Fort Worth, TX 76132', phone: '(817) 332-8848' },
    { city: 'Southlake', address: '1545 E. Southlake Blvd., Ste. 140, Southlake, TX 76092', phone: '(817) 420-9393' },
  ],
  testimonials: [
    { text: 'The SNOT-12 assessment helped identify my chronic sinus issues. Treatment has been life-changing.', author: 'Patient', location: 'Fort Worth' },
    { text: 'Dr. Smith used the SNOT-12 to create a personalized treatment plan that finally resolved my symptoms.', author: 'Patient', location: 'Southlake' },
  ],
  website: 'https://www.exhalesinus.com/',
};

const SNOT12LandingPage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const [utmSource, setUtmSource] = useState<string | null>(null);
  const [actualDoctorId, setActualDoctorId] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const isInitialized = useRef(false);

  const toggleAccordion = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I know if my sinus infections are chronic?",
      answer: "Chronic sinusitis means symptoms lasting 12+ weeks. If you have 4+ episodes per year or symptoms that never fully resolve, it's likely chronic and needs evaluation."
    },
    {
      question: "What causes chronic sinus infections?",
      answer: "Common causes include nasal polyps, deviated septum, allergies, immune issues, or structural problems. Proper evaluation with endoscopy and imaging helps identify the root cause."
    },
    {
      question: "Do I need surgery for chronic sinusitis?",
      answer: "Many cases respond to medical therapy. Surgery is considered when medical treatment fails or for structural issues like polyps or septal deviation."
    },
    {
      question: "How long does treatment take to work?",
      answer: "Medical therapy typically shows improvement within 2-4 weeks. Full resolution may take 2-3 months. Surgery recovery varies but most patients see improvement within weeks."
    },
    {
      question: "Can chronic sinusitis be cured?",
      answer: "While some cases can be fully resolved, chronic sinusitis often requires ongoing management. The goal is symptom control and preventing complications."
    }
  ];

  // Initialize doctorId and UTM source
  useEffect(() => {
    if (isInitialized.current) return;

    const searchParams = new URLSearchParams(window.location.search);
    const source = searchParams.get('utm_source');
    if (source) {
      setUtmSource(source);
    }

    const doctorIdFromRoute = doctorId;
    const doctorIdFromQuery = searchParams.get('doctor');
    const id = doctorIdFromQuery || doctorIdFromRoute || 'demo';

    setActualDoctorId(id);
    isInitialized.current = true;
  }, [doctorId]);

  // Cached doctor profile fetch
  const fetchDoctorProfile = useCallback(async (): Promise<DoctorProfile> => {
    if (!actualDoctorId || actualDoctorId === 'demo') {
      return defaultDoctor;
    }

    try {
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('id', actualDoctorId)
        .single();

      if (error) {
        console.error('Error fetching doctor profile:', error);
        return defaultDoctor;
      }

      if (data && data.first_name && data.last_name) {
        return {
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
      }
      return defaultDoctor;
    } catch (error) {
      console.error('Error in fetchDoctorProfile:', error);
      return defaultDoctor;
    }
  }, [actualDoctorId]);

  const { data: doctor, loading } = useCachedData<DoctorProfile>(
    `doctor_profile_${actualDoctorId}`,
    fetchDoctorProfile,
    [actualDoctorId]
  );

  useEffect(() => {
    const imagesToPreload = [
      '/hero-bg.jpg',
      doctor?.avatar_url || '/placeholder.svg',
      '/woman-sneezing.jpg',
      '/woman-tissue.jpg',
      '/woman-sitting.jpg',
      '/woman-breathing.jpg',
      '/mainline-treatment.jpg',
      '/bottom-image-landing.jpg',
    ].filter(Boolean) as string[];

    preloadImages(imagesToPreload).catch(err => 
      console.warn('Some images failed to preload:', err)
    );
  }, [doctor?.avatar_url]);

  const handleShowQuiz = () => {
    // Scroll to quiz section instead of showing popup
    const quizSection = document.getElementById('snot12-quiz-section');
    if (quizSection) {
      quizSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const doctorAvatarUrl = doctor?.avatar_url || '/placeholder.svg';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Your Personalized Assessment</h3>
          <p className="text-gray-600">Fetching doctor information and preparing content...</p>
          <div className="mt-4 text-sm text-gray-500">This may take a few moments</div>
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
                className="w-full h-full object-cover opacity-20"
              />
            </div>

            <div className="relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left Side - Hero Content */}
                <div className="text-center lg:text-left">
                  <h1 className="text-white text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6">
                    Chronic Sinus Infections (Sinusitis) — Find Long‑Term Relief
                  </h1>

                  <p className="text-blue-100 text-lg md:text-xl lg:text-2xl leading-snug">
                    Painful Sinus Infections Happening Way Too Often? Sinus pain and pressure can wear you down. 
                    You don't have to keep putting up with it. Take our SNOT-12 assessment to understand your 
                    symptoms and get a personalized treatment plan. {doctor ? `Dr. ${doctor.last_name} will` : "We'll"} review your results personally and
                    discuss next steps to help you find lasting relief.
                  </p>
                </div>

                {/* Right Side - Quiz Section */}
                <div id="snot12-quiz-section" className="flex justify-center lg:justify-end">
                  <div className="w-full max-w-md" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <EmbeddedCardQuiz
                      quizType="SNOT12"
                      doctorId={doctorId || doctor?.id}
                      utm_source={utmSource}
                      compact={true}
                      autoStart={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
          </div>

        {/* Doctor Note Section */}
        <section className="relative px-4 py-16 sm:px-8 lg:px-16 xl:px-40 2xl:px-64 lg:py-32 bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Doctor Image - Now shown on all devices */}
            <div>
              <img 
                src={doctorAvatarUrl || '/woman-tissue.jpg'} 
                alt="Doctor" 
                className="w-full h-80 md:h-96 object-cover rounded-2xl shadow-md"
              />
            </div>

            <div className="text-center lg:text-left max-w-[450px] mx-auto lg:mx-0">
              <h2 className="text-3xl font-bold mb-4">A note from Dr. {doctor?.last_name || 'Smith'}</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Sinus pain and pressure can wear you down. Maybe your nose is always running, or the pressure 
                in your face is so bad it makes your teeth hurt. You've tried to push through—but the relief never lasts.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                You don't have to keep putting up with it. If infections last for weeks and return several times a year, 
                it's time to look for the underlying cause and a plan that provides lasting relief. Take our SNOT-12 
                assessment to understand your symptoms better.
            </p>
            <button
              onClick={handleShowQuiz}
                className="px-8 py-4 bg-teal-500 text-white rounded inline-block mt-5 font-semibold hover:bg-teal-600 transition"
            >
                Take the SNOT-12 Test
            </button>
              </div>
          </div>
        </section>

        {/* Common Symptoms Section */}
        <section className="relative px-4 py-16 sm:px-8 lg:px-16 xl:px-40 2xl:px-64 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Common Symptoms
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-700">Facial pain & pressure</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-700">Frustrating runny nose and congestion</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-700">Post‑nasal drip and throat irritation</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-700">Headache; sometimes tooth or upper‑jaw pain</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-700">Fever (with acute infection)</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-700">Cough, fatigue, and reduced sense of smell</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-700">Difficulty breathing through the nose</span>
                </li>
              </ul>
              </div>

            {/* Image now shown on all devices */}
            <div className="flex justify-center">
              <img 
                src="/woman-tissue.jpg" 
                alt="Sinus Symptoms" 
                className="w-full object-cover rounded-2xl shadow-lg"
              />
              </div>
          </div>
        </section>

        {/* What Are Chronic Sinus Infections Section */}
        <section className="relative bg-gray-900 py-20">
          {/* Background image now shown on all devices */}
          <div className="absolute inset-0">
            <img 
              src="/woman-sneezing.jpg" 
              alt="Background" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-60"></div>
          </div>

          <div className="relative max-w-3xl mx-auto px-6 text-center text-white">
            <h2 className="text-3xl font-bold mb-6">What Are Chronic Sinus Infections (Chronic Rhinosinusitis)?</h2>
            <p className="leading-relaxed mb-8 text-lg">
              Chronic rhinosinusitis (CRS) means sinus and nasal symptoms that persist for 12 or more weeks, 
              often with objective findings on endoscopy or CT scan. CRS frequently reflects ongoing inflammation, 
              sometimes with nasal polyps.
            </p>

              <button
                onClick={handleShowQuiz}
              className="inline-block bg-teal-500 text-white font-semibold px-8 py-4 rounded-lg shadow-lg transition hover:bg-teal-600"
              >
              Take the SNOT-12 Test
              </button>
          </div>
        </section>

        {/* How We Evaluate Section */}
        <section className="relative px-4 py-16 sm:px-8 lg:px-16 xl:px-40 2xl:px-64 lg:py-32">
          <div className="mb-8 lg:mb-0">
            <h2 className="text-3xl font-bold mb-6">
              How We Evaluate
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  History & Exam
                </h3>
                <p className="text-gray-700">
                  Focused on duration, triggers (allergy), and impact on daily life
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Nasal Endoscopy
                </h3>
                <p className="text-gray-700">
                  To look for swelling, blockage, and polyps
                </p>
                    </div>

              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  CT Imaging
                </h3>
                <p className="text-gray-700">
                  When needed to confirm disease pattern and guide treatment
                </p>
                  </div>

              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Allergy Testing
                </h3>
                <p className="text-gray-700">
                  When symptoms or history suggest an underlying driver
                </p>
              </div>
              </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="relative px-4 py-16 sm:px-8 lg:px-16 xl:px-40 2xl:px-64 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose {doctor?.clinic_name || 'Exhale Sinus'} (from Dr. {doctor?.last_name || 'Smith'})
              </h2>

              <ul className="space-y-4 text-gray-700 mb-8">
                <li className="flex items-start">
                  <span className="mr-3 text-blue-600 font-bold">●</span>
                  Fellowship-trained ENT care with comprehensive sinus treatment
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-blue-600 font-bold">●</span>
                  Thousands of patients helped across <span>{doctor?.locations[0]?.city || 'Bay'} area</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-blue-600 font-bold">●</span>
                  Insurance accepted; no referral required
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-blue-600 font-bold">●</span>
                  Comprehensive diagnostics that match treatment to your condition
                </li>
              </ul>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="md:col-span-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Doctor Bio</h3>
                  <a
                    href={doctor?.website || 'https://www.exhalesinus.com/'}
                    target="_blank"
                    className="text-blue-600 hover:underline"
                    rel="noreferrer"
                  >
                    {doctor?.name || 'Dr. Smith, MD'}
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

            <div>
              <img
                src='/woman-sitting.jpg'
                alt="Doctor - Exhale Sinus"
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
                    <b>American Academy of Otolaryngology —</b> Patient education
                    on chronic sinusitis:{' '}
                    <a
                      href="https://www.enthealth.org"
                      target="_blank"
                      className="text-blue-600 hover:underline"
                      rel="noreferrer"
                    >
                      https://www.enthealth.org
                    </a>
                  </li>
                  <li>
                    <b>SNOT-12 Questionnaire —</b> Validated assessment tool:{' '}
                    <a
                      href="https://pubmed.ncbi.nlm.nih.gov/37501403/"
                      target="_blank"
                      className="text-blue-600 hover:underline"
                      rel="noreferrer"
                    >
                      Clinical validation studies
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative bg-gray-900 text-white">
          {/* Background image now shown on all devices */}
          <div className="absolute inset-0">
            <img 
              src="/woman-breathing.jpg" 
              alt="Sinus Test Background" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-60"></div>
          </div>
      
          <div className="relative px-4 py-20 sm:px-8 lg:px-16 xl:px-32 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Take the SNOT-12 Test
              </h2>
              <p className="text-lg sm:text-xl mb-8 text-gray-200">
                Find out your personalized SNOT-12 score in just a few clicks — and
                get a free phone consultation to review your results.
              </p>
              <button 
                onClick={handleShowQuiz}
                className="inline-block bg-teal-500 text-white font-semibold px-8 py-4 rounded-lg shadow transition hover:bg-teal-600"
              >
                Take the SNOT-12 Test
              </button>
            </div>
          </div>
        </section>
      </main>
      
    </div>
  );
};

export default SNOT12LandingPage;