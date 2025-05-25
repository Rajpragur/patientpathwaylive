
import { QuizSelector } from './QuizSelector';

export function DHIPage() {
  const handleSelectQuiz = () => {
    window.location.href = '/quiz?type=DHI&mode=single';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 py-12">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-6">
          DHI Assessment
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Dizziness Handicap Inventory - Evaluate dizziness and balance issues
        </p>
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">About This Assessment</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            The DHI measures the self-perceived handicapping effects of dizziness. 
            It evaluates how balance problems affect your physical, functional, and emotional well-being.
          </p>
          <button
            onClick={handleSelectQuiz}
            className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-2xl text-xl transition-all duration-200 hover:scale-105 shadow-lg"
          >
            Start DHI Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
