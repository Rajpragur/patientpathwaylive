import { QuizType } from '@/types/quiz';

interface QuizResult {
  score: number;
  severity: 'normal' | 'mild' | 'moderate' | 'severe';
  interpretation: string;
  summary: string;
}

interface QuizAnswer {
  questionIndex: number;
  answer: string;
  answerIndex: number;
}

export function calculateQuizScore(quizType: QuizType, answers: QuizAnswer[] | number[]): QuizResult {
  // Handle both QuizAnswer array and number array for backward compatibility
  const answerIndices = Array.isArray(answers) && answers.length > 0 && typeof answers[0] === 'object'
    ? (answers as QuizAnswer[]).map(a => a.answerIndex)
    : answers as number[];
  
  switch (quizType) {
    case 'SNOT22':
      // SNOT-22 scoring: 0-5 scale for 22 questions (max 110)
      const snot22Score = answerIndices.reduce((sum, answer) => sum + answer, 0);
      let snot22Severity: 'normal' | 'mild' | 'moderate' | 'severe' = 'normal';
      let snot22Interpretation = '';

      if (snot22Score >= 70) {
        snot22Severity = 'severe';
        snot22Interpretation = 'Severe nasal/sinus symptoms significantly impacting quality of life. Immediate medical consultation recommended.';
      } else if (snot22Score >= 40) {
        snot22Severity = 'moderate';
        snot22Interpretation = 'Moderate nasal/sinus symptoms affecting daily activities. Medical evaluation recommended.';
      } else if (snot22Score >= 20) {
        snot22Severity = 'mild';
        snot22Interpretation = 'Mild nasal/sinus symptoms with some impact on quality of life. Consider medical consultation.';
      } else {
        snot22Interpretation = 'Minimal nasal/sinus symptoms with little impact on quality of life.';
      }

      return {
        score: snot22Score,
        severity: snot22Severity,
        interpretation: snot22Interpretation,
        summary: `SNOT-22 Score: ${snot22Score}/110 - ${snot22Severity} symptoms`
      };

    case 'NOSE':
      // NOSE scoring: Each question is scored 0, 5, 10, 15, or 20. Sum and multiply by 5 for max 100.
      // Parse the value from the option string if needed.
      const noseRawScore = answerIndices.reduce((sum, answer, idx) => {
        // If answer is a number (0-4), convert to 0,5,10,15,20
        // If answer is already 0,5,10,15,20, use as is
        if (typeof answer === 'number' && answer >= 0 && answer <= 4) {
          return sum + answer * 5;
        }
        // fallback: just add
        return sum + answer;
      }, 0);
      const noseScore = noseRawScore; // Already scaled to 100 max
      let noseSeverity: 'normal' | 'mild' | 'moderate' | 'severe' = 'normal';
      let noseInterpretation = '';

      if (noseScore >= 75) {
        noseSeverity = 'severe';
        noseInterpretation = 'Severe nasal obstruction significantly affecting breathing and quality of life. Surgical consultation recommended.';
      } else if (noseScore >= 50) {
        noseSeverity = 'moderate';
        noseInterpretation = 'Moderate nasal obstruction with noticeable impact on breathing. Medical evaluation recommended.';
      } else if (noseScore >= 25) {
        noseSeverity = 'mild';
        noseInterpretation = 'Mild nasal obstruction with some breathing difficulties. Consider medical consultation.';
      } else {
        noseInterpretation = 'Minimal nasal obstruction with little impact on breathing.';
      }

      return {
        score: noseScore,
        severity: noseSeverity,
        interpretation: noseInterpretation,
        summary: `NOSE Score: ${noseScore}/100 - ${noseSeverity} nasal obstruction`
      };

    case 'HHIA':
      // HHIA scoring: Yes=4, Sometimes=2, No=0 for 25 questions (max 100)
      const hhiaScore = answerIndices.reduce((sum, answer) => {
        return sum + (answer === 0 ? 4 : answer === 1 ? 2 : 0);
      }, 0);
      let hhiaSeverity: 'normal' | 'mild' | 'moderate' | 'severe' = 'normal';
      let hhiaInterpretation = '';

      if (hhiaScore >= 58) {
        hhiaSeverity = 'severe';
        hhiaInterpretation = 'Severe hearing handicap significantly impacting daily life. Immediate audiological consultation recommended.';
      } else if (hhiaScore >= 18) {
        hhiaSeverity = 'mild';
        hhiaInterpretation = 'Mild to moderate hearing handicap affecting some activities. Audiological evaluation recommended.';
      } else {
        hhiaInterpretation = 'No significant hearing handicap detected.';
      }

      return {
        score: hhiaScore,
        severity: hhiaSeverity,
        interpretation: hhiaInterpretation,
        summary: `HHIA Score: ${hhiaScore}/100 - ${hhiaSeverity === 'normal' ? 'No significant' : hhiaSeverity} hearing handicap`
      };

    case 'EPWORTH':
      // Epworth scoring: 0-3 scale for 8 questions (max 24)
      const epworthScore = answerIndices.reduce((sum, answer) => sum + answer, 0);
      let epworthSeverity: 'normal' | 'mild' | 'moderate' | 'severe' = 'normal';
      let epworthInterpretation = '';

      if (epworthScore >= 16) {
        epworthSeverity = 'severe';
        epworthInterpretation = 'Severe excessive daytime sleepiness. High risk of sleep disorders. Immediate sleep study recommended.';
      } else if (epworthScore >= 11) {
        epworthSeverity = 'moderate';
        epworthInterpretation = 'Moderate excessive daytime sleepiness. Sleep disorder evaluation recommended.';
      } else if (epworthScore >= 6) {
        epworthSeverity = 'mild';
        epworthInterpretation = 'Mild excessive daytime sleepiness. Consider sleep hygiene evaluation.';
      } else {
        epworthInterpretation = 'Normal daytime alertness. No significant sleepiness detected.';
      }

      return {
        score: epworthScore,
        severity: epworthSeverity,
        interpretation: epworthInterpretation,
        summary: `Epworth Score: ${epworthScore}/24 - ${epworthSeverity} daytime sleepiness`
      };

    case 'DHI':
      // DHI scoring: Yes=4, Sometimes=2, No=0 for 25 questions (max 100)
      const dhiScore = answerIndices.reduce((sum, answer) => {
        return sum + (answer === 0 ? 4 : answer === 1 ? 2 : 0);
      }, 0);
      let dhiSeverity: 'normal' | 'mild' | 'moderate' | 'severe' = 'normal';
      let dhiInterpretation = '';

      if (dhiScore >= 60) {
        dhiSeverity = 'severe';
        dhiInterpretation = 'Severe dizziness handicap significantly impacting daily activities. Comprehensive vestibular evaluation recommended.';
      } else if (dhiScore >= 36) {
        dhiSeverity = 'moderate';
        dhiInterpretation = 'Moderate dizziness handicap affecting daily life. Vestibular assessment recommended.';
      } else if (dhiScore >= 16) {
        dhiSeverity = 'mild';
        dhiInterpretation = 'Mild dizziness handicap with some impact on activities. Consider vestibular evaluation.';
      } else {
        dhiInterpretation = 'Minimal dizziness handicap with little impact on daily life.';
      }

      return {
        score: dhiScore,
        severity: dhiSeverity,
        interpretation: dhiInterpretation,
        summary: `DHI Score: ${dhiScore}/100 - ${dhiSeverity} dizziness handicap`
      };

    case 'STOP':
      // STOP-BANG scoring: 1 point for each YES answer (max 8)
      const stopScore = answerIndices.reduce((sum, answer) => sum + answer, 0);
      let stopSeverity: 'normal' | 'mild' | 'moderate' | 'severe' = 'normal';
      let stopInterpretation = '';

      if (stopScore >= 5) {
        stopSeverity = 'severe';
        stopInterpretation = 'High risk for obstructive sleep apnea. Immediate sleep study evaluation recommended.';
      } else if (stopScore >= 3) {
        stopSeverity = 'moderate';
        stopInterpretation = 'Intermediate risk for obstructive sleep apnea. Sleep evaluation recommended.';
      } else {
        stopInterpretation = 'Low risk for obstructive sleep apnea.';
      }

      return {
        score: stopScore,
        severity: stopSeverity,
        interpretation: stopInterpretation,
        summary: `STOP-BANG Score: ${stopScore}/8 - ${stopSeverity === 'normal' ? 'Low' : stopSeverity} OSA risk`
      };

    case 'TNSS':
      // TNSS scoring: 0-3 scale for 4 questions (max 12)
      const tnssScore = answerIndices.reduce((sum, answer) => sum + answer, 0);
      let tnssSeverity: 'normal' | 'mild' | 'moderate' | 'severe' = 'normal';
      let tnssInterpretation = '';

      if (tnssScore >= 9) {
        tnssSeverity = 'severe';
        tnssInterpretation = 'Severe nasal symptoms requiring immediate medical attention.';
      } else if (tnssScore >= 6) {
        tnssSeverity = 'moderate';
        tnssInterpretation = 'Moderate nasal symptoms. Medical evaluation recommended.';
      } else if (tnssScore >= 3) {
        tnssSeverity = 'mild';
        tnssInterpretation = 'Mild nasal symptoms. Consider medical consultation if persistent.';
      } else {
        tnssInterpretation = 'Minimal nasal symptoms.';
      }

      return {
        score: tnssScore,
        severity: tnssSeverity,
        interpretation: tnssInterpretation,
        summary: `TNSS Score: ${tnssScore}/12 - ${tnssSeverity} nasal symptoms`
      };

    default:
      return {
        score: 0,
        severity: 'normal',
        interpretation: 'Unknown quiz type',
        summary: 'Score calculation not available'
      };
  }
}
