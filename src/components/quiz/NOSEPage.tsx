
import { QuizSelector } from './QuizSelector';

export function NOSEPage() {
  const handleSelectQuiz = () => {
    window.location.href = '/quiz?type=NOSE&mode=single';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6">
          NOSE Assessment
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Nasal Obstruction Symptom Evaluation - Assess your nasal breathing
        </p>
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">About This Assessment</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            The NOSE scale is a validated instrument for evaluating nasal obstruction symptoms. 
            It helps assess how nasal congestion affects your quality of life and daily activities.
          </p>
          <button
            onClick={handleSelectQuiz}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-2xl text-xl transition-all duration-200 hover:scale-105 shadow-lg"
          >
            Start NOSE Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
