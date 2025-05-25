
import { QuizSelector } from './QuizSelector';

export function SNOT22Page() {
  const handleSelectQuiz = () => {
    // Auto-select SNOT22 quiz
    window.location.href = '/quiz?type=SNOT22&mode=single';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
          SNOT-22 Assessment
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Sino-Nasal Outcome Test - Evaluate your nasal and sinus symptoms
        </p>
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">About This Assessment</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            The SNOT-22 is a validated questionnaire used to assess the severity of chronic rhinosinusitis symptoms. 
            It evaluates how nasal and sinus problems affect your daily life, sleep quality, and overall well-being.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl mb-2">⏱️</div>
              <h3 className="font-semibold text-gray-800">5-7 Minutes</h3>
              <p className="text-gray-600 text-sm">Quick completion</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📋</div>
              <h3 className="font-semibold text-gray-800">22 Questions</h3>
              <p className="text-gray-600 text-sm">Comprehensive evaluation</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-800">Instant Results</h3>
              <p className="text-gray-600 text-sm">Immediate scoring</p>
            </div>
          </div>
          <button
            onClick={handleSelectQuiz}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl text-xl transition-all duration-200 hover:scale-105 shadow-lg"
          >
            Start SNOT-22 Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
