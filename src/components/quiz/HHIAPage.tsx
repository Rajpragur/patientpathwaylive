
import { QuizSelector } from './QuizSelector';

export function HHIAPage() {
  const handleSelectQuiz = () => {
    window.location.href = '/quiz?type=HHIA&mode=single';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
          HHIA Assessment
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Hearing Handicap Inventory for Adults - Evaluate hearing difficulties
        </p>
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">About This Assessment</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            The HHIA is a self-assessment tool that evaluates the social and emotional effects of hearing loss. 
            It helps identify how hearing difficulties impact your daily life and relationships.
          </p>
          <button
            onClick={handleSelectQuiz}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl text-xl transition-all duration-200 hover:scale-105 shadow-lg"
          >
            Start HHIA Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
