
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export function SNOT12Page() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const key = searchParams.get('key');
    const doctor = searchParams.get('doctor');
    
    if (key || doctor) {
      // Redirect to quiz with chatbot
      window.location.href = `/quiz?type=SNOT12&key=${key}&doctor=${doctor}&mode=single`;
    }
  }, [searchParams]);

  const handleSelectQuiz = () => {
    window.location.href = '/quiz?type=SNOT12&mode=single';
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-6">
          SNOT-12 Assessment
        </h1>
        <p className="text-lg text-slate-700 mb-8">
          Sino-Nasal Outcome Test - Evaluate your nasal and sinus symptoms (Short)
        </p>
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">About This Assessment</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            The SNOT-12 is a validated short-form patient questionnaire used to assess the impact 
of nasal and sinus symptoms on quality of life. It is a condensed version of the SNOT-22
and includes 12 key items across nasal, sleep, facial, and emotional domains.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl mb-2">⏱️</div>
              <h3 className="font-semibold text-slate-800">5-7 Minutes</h3>
              <p className="text-slate-600 text-sm">Quick completion</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">📋</div>
              <h3 className="font-semibold text-slate-800">12 Questions</h3>
              <p className="text-slate-600 text-sm">Comprehensive evaluation</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold text-slate-800">Instant Results</h3>
              <p className="text-slate-600 text-sm">Immediate scoring</p>
            </div>
          </div>
          <button
            onClick={handleSelectQuiz}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 shadow-md"
          >
            Start SNOT-12 Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
