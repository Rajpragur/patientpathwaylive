import React, { useState } from 'react';
import { Check } from 'lucide-react';

export default function NoseLandingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

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

  return (
    <div className="antialiased bg-white font-sans text-gray-900">
      <main className="w-full">
      {/* Hero Section */}
        <div className="bg-gray-100">
          <section className="cover relative bg-gradient-to-r from-blue-600 to-teal-500 px-4 sm:px-8 lg:px-16 xl:px-40 2xl:px-64 overflow-hidden py-32 flex items-center justify-center text-center">
            <div className="h-full absolute top-0 left-0 right-0 z-0">
              <img 
                src="/hero-bg.jpg" 
                alt="" 
                className="w-full h-full object-cover opacity-20"
              />
            </div>

            <div className="lg:w-4/5 relative z-10">
              <div>
                <h1 className="text-white text-4xl md:text-5xl xl:text-6xl font-bold leading-tight">
                  Breathing easier starts here.
        </h1>

                <p className="text-blue-100 text-xl md:text-2xl leading-snug mt-4">
                  If you're dealing with nasal congestion, poor sleep, or
                  shortness of breath with activity, it could be nasal
                  obstruction. You're 5 clicks away from your clinically validated
                  NOSE score (0–100). I'll review your results personally and
                  discuss next steps to help you breathe—and sleep—better.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Doctor Note Section */}
        <section className="relative px-4 py-16 sm:px-8 lg:px-16 xl:px-40 2xl:px-64 lg:py-32 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            {/* Left Image */}
            <div>
              <img 
                src="/placeholder.svg" 
                alt="Doctor" 
                className="w-full h-80 md:h-96 object-cover rounded-2xl shadow-md"
              />
            </div>

            {/* Right Content */}
            <div>
              <h2 className="text-3xl font-bold mb-4">A note from Dr. Vaughn</h2>
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
              <a 
                target="_blank" 
                href="/quiz/nose" 
                className="px-8 py-4 bg-teal-500 text-white rounded inline-block mt-5 font-semibold hover:bg-teal-600 transition"
                rel="noreferrer"
              >
                Take the NOSE Test
              </a>
            </div>
          </div>
        </section>

        {/* What is NAO Section */}
        <section className="relative px-4 py-16 sm:px-8 lg:px-16 xl:px-40 2xl:px-64 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-12">
            {/* Left Column */}
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
                <li className="flex items-start">
                  <Check className="h-6 w-6 text-green-600 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Difficulty breathing through one or both nostrils</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-6 w-6 text-green-600 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Persistent congestion (with or without allergies)</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-6 w-6 text-green-600 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Mouth breathing and snoring; dry mouth on waking</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-6 w-6 text-green-600 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Facial pressure or frequent "sinus infections"</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-6 w-6 text-green-600 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Fatigue, brain fog, and reduced exercise tolerance</span>
                </li>
              </ul>
            </div>

            {/* Right Column */}
            <div className="flex justify-center">
              <img 
                src="/placeholder.svg" 
                alt="Nasal Airway" 
                className="w-full object-cover rounded-2xl shadow-lg"
              />
            </div>
          </div>
      </section>

        {/* How NOSE Test Works */}
        <section className="relative bg-gray-900 py-20">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src="/placeholder.svg" 
              alt="Background" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-60"></div>
          </div>

          {/* Content */}
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

            {/* CTA Button */}
            <a 
              target="_blank" 
              href="/quiz/nose" 
              className="inline-block bg-teal-500 text-white font-semibold px-8 py-4 rounded-lg shadow-lg transition hover:bg-teal-600"
              rel="noreferrer"
            >
              Take the NOSE Test
            </a>
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

            {/* Table */}
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
            {/* First-line medical care */}
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

            {/* In-office minimally invasive options */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                In-office minimally invasive options
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>VivAer® nasal airway remodeling (no incisions)</li>
                <li>Turbinate reduction (RF or microdebrider)</li>
              </ul>
            </div>

            {/* Surgical correction */}
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
        <section className="relative px-4 py-16 sm:px-8 lg:px-16 xl:px-40 2xl:px-64 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Column */}
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

            {/* Image Column */}
            <div className="flex justify-center lg:justify-end">
              <img 
                src="/placeholder.svg" 
                alt="Nasal treatment illustration" 
                className="rounded-2xl shadow-lg object-cover w-full"
              />
            </div>
          </div>
        </section>

        {/* Treatment Comparison Table */}
        <section className="relative px-4 py-16 sm:px-8 lg:px-16 xl:px-40 2xl:px-64 bg-gray-50">
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
          <a 
            target="_blank" 
            href="/quiz/nose" 
            className="inline-block bg-teal-500 text-white font-semibold px-8 py-4 rounded-lg shadow-lg transition hover:bg-teal-600"
            rel="noreferrer"
          >
            Take the NOSE Test
          </a>
        </section>

        {/* Expanded Treatment Details */}
        <section className="relative px-4 py-16 sm:px-8 lg:px-16 xl:px-40 2xl:px-64 bg-white">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Expanded Treatment Details & Recovery
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Medications */}
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

            {/* Septoplasty */}
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

            {/* Turbinate Reduction */}
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

            {/* Nasal Valve Implants */}
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

            {/* Functional Rhinoplasty */}
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

            {/* J-flap Procedure */}
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
              </p>
            </div>
          </div>
        </section>

        {/* What Happens After Test */}
        <section className="relative px-4 py-16 sm:px-8 lg:px-16 xl:px-40 2xl:px-64 bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Left column: Image */}
            <div>
              <img 
                src="/placeholder.svg" 
                alt="Patient consultation illustration" 
                className="w-full rounded-lg shadow-md object-cover"
              />
            </div>

            {/* Right column: Text */}
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
                  I review your results and any notes you include.
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

              {/* CTA */}
              <div className="mt-6 flex flex-col xl:flex-row sm:justify-start gap-3">
                <a 
                  target="_blank" 
                  href="/quiz/nose" 
                  className="bg-teal-500 text-white font-semibold px-8 py-4 rounded-lg shadow-lg transition hover:bg-teal-600 w-full sm:w-auto text-center"
                  rel="noreferrer"
                >
                  Take the NOSE Test
                </a>
                <a 
                  target="_blank" 
                  href="/quiz/nose" 
                  className="bg-teal-500 text-white font-semibold px-8 py-4 rounded-lg shadow-lg transition hover:bg-teal-600 w-full sm:w-auto text-center"
                  rel="noreferrer"
                >
                  Schedule a Free Phone Consultation
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="relative px-4 py-16 sm:px-8 lg:px-16 xl:px-40 2xl:px-64 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Doctor Bio & Contact */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose Exhale Sinus (from Dr. Vaughn)
              </h2>

              <ul className="space-y-4 text-gray-700 mb-8">
                <li className="flex items-start">
                  <span className="mr-3 text-blue-600 font-bold">●</span>
                  Fellowship-trained ENT care with in-office, minimally invasive solutions
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-blue-600 font-bold">●</span>
                  Thousands of patients helped across <span className="font-semibold">Chicagoland area</span>
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
                {/* Doctor Bio */}
                <div className="md:col-span-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Doctor Bio</h3>
                  <a 
                    href="https://www.exhalesinus.com/ryan-c-vaughn-md" 
                    target="_blank" 
                    className="text-blue-600 hover:underline"
                    rel="noreferrer"
                  >
                    Dr. Ryan C. Vaughn, MD
                  </a>
                </div>

                {/* Contact & Locations */}
                <div className="md:col-span-2">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Contact & Locations</h3>
                  <p className="font-medium text-gray-800">
                    Practice Website:{' '}
                    <a 
                      href="https://www.exhalesinus.com/" 
                      target="_blank" 
                      className="text-blue-600 hover:underline"
                      rel="noreferrer"
                    >
                      www.exhalesinus.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Image */}
            <div>
              <img 
                src="/placeholder.svg" 
                alt="Dr. Vaughn - Exhale Sinus" 
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
          {/* Background image */}
          <div className="absolute inset-0">
            <img 
              src="/placeholder.svg" 
              alt="Nose Test Background" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-60"></div>
          </div>

          {/* Content */}
          <div className="relative px-4 py-20 sm:px-8 lg:px-16 xl:px-32 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Take the NOSE Test
              </h2>
              <p className="text-lg sm:text-xl mb-8 text-gray-200">
                Find out your personalized NOSE score in just a few clicks — and
                get a free phone consultation to review your results.
              </p>
              <a 
                href="/quiz/nose" 
                target="_blank" 
                className="inline-block bg-teal-500 text-white font-semibold px-8 py-4 rounded-lg shadow transition hover:bg-teal-600"
                rel="noreferrer"
              >
                Take the NOSE Test
              </a>
            </div>
          </div>
      </section>
      </main>
    </div>
  );
}
