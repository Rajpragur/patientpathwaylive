
import { QuizSelector } from './QuizSelector';

export function TNSSPage() {
  const handleSelectQuiz = () => {
    window.location.href = '/quiz?type=TNSS&mode=single';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-6">
          TNSS Assessment
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Total Nasal Symptom Score - Evaluate nasal allergy symptoms
        </p>
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">About This Assessment</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            The TNSS evaluates four major nasal symptoms associated with allergic rhinitis. 
            It helps assess the severity of nasal congestion, runny nose, sneezing, and nasal itching.
          </p>
          <button
            onClick={handleSelectQuiz}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl text-xl transition-all duration-200 hover:scale-105 shadow-lg"
          >
            Start TNSS Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
