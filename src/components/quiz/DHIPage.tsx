
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export function DHIPage() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const key = searchParams.get('key');
    const doctor = searchParams.get('doctor');
    
    if (key || doctor) {
      window.location.href = `/quiz?type=DHI&key=${key}&doctor=${doctor}&mode=single`;
    }
  }, [searchParams]);

  const handleSelectQuiz = () => {
    window.location.href = '/quiz?type=DHI&mode=single';
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold text-teal-600 mb-6">
          DHI Assessment
        </h1>
        <p className="text-lg text-slate-700 mb-8">
          Dizziness Handicap Inventory - Evaluate dizziness and balance issues
        </p>
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">About This Assessment</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            The DHI measures the self-perceived handicapping effects of dizziness. 
            It evaluates how balance problems affect your physical, functional, and emotional well-being.
          </p>
          <button
            onClick={handleSelectQuiz}
            className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 shadow-md"
          >
            Start DHI Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
