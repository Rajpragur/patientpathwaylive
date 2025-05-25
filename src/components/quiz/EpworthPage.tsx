
import { QuizSelector } from './QuizSelector';

export function EpworthPage() {
  const handleSelectQuiz = () => {
    window.location.href = '/quiz?type=EPWORTH&mode=single';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-6">
          Epworth Assessment
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Epworth Sleepiness Scale - Evaluate daytime sleepiness
        </p>
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">About This Assessment</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            The Epworth Sleepiness Scale measures your likelihood of dozing off in various situations. 
            It helps assess excessive daytime sleepiness and potential sleep disorders.
          </p>
          <button
            onClick={handleSelectQuiz}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-2xl text-xl transition-all duration-200 hover:scale-105 shadow-lg"
          >
            Start Epworth Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
