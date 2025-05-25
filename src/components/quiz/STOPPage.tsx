
import { QuizSelector } from './QuizSelector';

export function STOPPage() {
  const handleSelectQuiz = () => {
    window.location.href = '/quiz?type=STOP&mode=single';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-6">
          STOP Assessment
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          STOP-Bang Questionnaire - Screen for sleep apnea risk
        </p>
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">About This Assessment</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            The STOP-Bang questionnaire is a validated screening tool for obstructive sleep apnea. 
            It helps identify patients at high risk for sleep-disordered breathing.
          </p>
          <button
            onClick={handleSelectQuiz}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 px-8 rounded-2xl text-xl transition-all duration-200 hover:scale-105 shadow-lg"
          >
            Start STOP Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
