
import { QuizType, QuizAnswer, QuizResult } from '../types/quiz';

export function calculateQuizScore(quizType: QuizType, answers: QuizAnswer[]): QuizResult {
  console.log('Calculating score for quiz:', quizType, 'with answers:', answers);
  
  switch (quizType) {
    case 'SNOT22':
      return calculateSNOT22Score(answers);
    case 'NOSE':
      return calculateNOSEScore(answers);
    case 'HHIA':
      return calculateHHIAScore(answers);
    case 'EPWORTH':
      return calculateEpworthScore(answers);
    case 'DHI':
      return calculateDHIScore(answers);
    case 'STOP':
      return calculateSTOPScore(answers);
    case 'TNSS':
      return calculateTNSSScore(answers);
    default:
      return { 
        score: 0, 
        interpretation: 'Unknown quiz type', 
        severity: 'normal',
        summary: 'Unable to calculate score for unknown quiz type.'
      };
  }
}

function mapSNOT22LabelToScore(label: string): number {
  console.log('Mapping SNOT22 label:', label);
  switch(label) {
    case "0 - Not a problem": return 0;
    case "1 - Very Mild Problem": return 1;
    case "2 - Moderate Problem": return 2;
    case "3 - Fairly Bad Problem": return 3;
    case "4 - Severe Problem": return 4;
    case "5 - Problem as bad as it can be": return 5;
    default: 
      console.log('Unknown SNOT22 label, defaulting to 0');
      return 0;
  }
}

function calculateSNOT22Score(answers: QuizAnswer[]): QuizResult {
  console.log('SNOT22 answers received:', answers);
  const scores = answers.map(answer => {
    const score = mapSNOT22LabelToScore(answer.answer);
    console.log('Answer:', answer.answer, 'Score:', score);
    return score;
  });
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  console.log('SNOT22 calculated score:', totalScore, 'from scores:', scores);
  
  const maxPossible = answers.length * 5;
  const percentage = Math.round((totalScore / maxPossible) * 100);

  let interpretation = "";
  let severity: 'normal' | 'mild' | 'moderate' | 'severe' = 'normal';
  let summary = "";

  if (percentage >= 41) {
    interpretation = "🚨 Your score suggests severe chronic rhinitis. We recommend consulting a specialist as soon as possible.";
    severity = 'severe';
    summary = "You scored in the severe range, indicating significant impact on your quality of life from nasal and sinus symptoms.";
  } else if (percentage >= 16) {
    interpretation = "⚠️ Your score indicates significant chronic rhinitis, a common but treatable condition.";
    severity = 'moderate';
    summary = "You scored in the moderate range, suggesting your symptoms may benefit from professional evaluation and treatment.";
  } else {
    interpretation = "✅ You appear to have No to Mild Chronic rhinitis at this time.";
    severity = 'normal';
    summary = "You scored in the normal range, indicating minimal impact from nasal and sinus symptoms.";
  }

  return { score: totalScore, interpretation, severity, summary };
}

function mapNOSELabelToScore(label: string): number {
  console.log('Mapping NOSE label:', label);
  switch(label) {
    case "0 - Not a problem": return 0;
    case "1 - Very Mild": return 1;
    case "2 - Moderate": return 2;
    case "3 - Fairly Bad": return 3;
    case "4 - Severe": return 4;
    default: 
      console.log('Unknown NOSE label, defaulting to 0');
      return 0;
  }
}

function calculateNOSEScore(answers: QuizAnswer[]): QuizResult {
  console.log('NOSE answers received:', answers);
  const scores = answers.map(answer => {
    const score = mapNOSELabelToScore(answer.answer);
    console.log('Answer:', answer.answer, 'Score:', score);
    return score;
  });
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  console.log('NOSE calculated score:', totalScore, 'from scores:', scores);
  
  // NOSE max score is 20 (5 questions × 4 max points)
  const maxPossible = 20;
  const percentage = Math.round((totalScore / maxPossible) * 100);

  let interpretation = "";
  let severity: 'normal' | 'mild' | 'moderate' | 'severe' = 'normal';
  let summary = "";

  if (percentage >= 75) {
    interpretation = "🚨 Your score suggests severe nasal obstruction. We recommend consulting a specialist as soon as possible.";
    severity = 'severe';
    summary = "You scored in the severe range, indicating significant breathing difficulties through your nose.";
  } else if (percentage >= 50) {
    interpretation = "⚠️ Your score indicates significant nasal obstruction, a common but treatable condition.";
    severity = 'moderate';
    summary = "You scored in the moderate range, suggesting noticeable nasal breathing problems that may benefit from treatment.";
  } else if (percentage >= 25) {
    interpretation = "🙂 Your score shows moderate symptoms. Monitoring and early care may be helpful.";
    severity = 'mild';
    summary = "You scored in the mild range, indicating some nasal obstruction symptoms worth monitoring.";
  } else {
    interpretation = "✅ You appear to have mild or no nasal obstruction at this time.";
    severity = 'normal';
    summary = "You scored in the normal range, indicating minimal nasal breathing problems.";
  }

  return { score: totalScore, interpretation, severity, summary };
}

function mapHHIALabelToScore(label: string): number {
  switch(label) {
    case "0 - No": return 0;
    case "2 - Sometimes": return 2;
    case "4 - Yes": return 4;
    default: return 0;
  }
}

function calculateHHIAScore(answers: QuizAnswer[]): QuizResult {
  const scores = answers.map(answer => mapHHIALabelToScore(answer.answer));
  const rawScore = scores.reduce((sum, score) => sum + score, 0);
  const finalScore = rawScore * 5;

  let interpretation = "";
  let severity: 'normal' | 'mild' | 'moderate' | 'severe' = 'normal';
  let summary = "";

  if (finalScore >= 44) {
    interpretation = "🚨 Your score suggests a significant hearing handicap. Please consider consulting an audiologist or ENT specialist.";
    severity = 'severe';
    summary = "You scored in the severe range, indicating significant impact on daily activities due to hearing difficulties.";
  } else if (finalScore >= 18) {
    interpretation = "⚠️ Your score indicates a mild to moderate hearing handicap, which may impact your daily communication.";
    severity = 'moderate';
    summary = "You scored in the moderate range, suggesting some hearing-related challenges in social situations.";
  } else {
    interpretation = "✅ You appear to have no significant hearing handicap at this time.";
    severity = 'normal';
    summary = "You scored in the normal range, indicating minimal impact from hearing difficulties.";
  }

  return { score: finalScore, interpretation, severity, summary };
}

function mapEpworthLabelToScore(label: string): number {
  switch(label) {
    case "0 - Would never nod off": return 0;
    case "1 - Slight chance of nodding off": return 1;
    case "2 - Moderate chance of nodding off": return 2;
    case "3 - High chance of nodding off": return 3;
    default: return 0;
  }
}

function calculateEpworthScore(answers: QuizAnswer[]): QuizResult {
  const scores = answers.map(answer => mapEpworthLabelToScore(answer.answer));
  const finalScore = scores.reduce((sum, score) => sum + score, 0);

  let interpretation = "";
  let severity: 'normal' | 'mild' | 'moderate' | 'severe' = 'normal';
  let summary = "";

  if (finalScore >= 16) {
    interpretation = "Your score suggests severe daytime sleepiness. Please seek medical attention — this could indicate a serious underlying sleep disorder.";
    severity = 'severe';
    summary = "You scored in the severe range, indicating excessive daytime sleepiness that may require immediate medical attention.";
  } else if (finalScore >= 10) {
    interpretation = "Your score raises concern: you may need to get more sleep, improve your sleep hygiene, or consult a doctor.";
    severity = 'moderate';
    summary = "You scored in the moderate range, suggesting significant daytime sleepiness that warrants further evaluation.";
  } else if (finalScore >= 5) {
    interpretation = "Your score shows mild sleepiness. Monitor your sleep habits and stay consistent with your sleep routine.";
    severity = 'mild';
    summary = "You scored in the mild range, indicating some daytime sleepiness worth monitoring.";
  } else {
    interpretation = "You appear to have normal sleep patterns with no excessive daytime sleepiness.";
    severity = 'normal';
    summary = "You scored in the normal range, indicating healthy sleep patterns and alertness during the day.";
  }

  return { score: finalScore, interpretation, severity, summary };
}

function mapDHILabelToScore(label: string): number {
  switch(label) {
    case "No": return 0;
    case "Sometimes": return 2;
    case "Yes": return 4;
    default: return 0;
  }
}

function calculateDHIScore(answers: QuizAnswer[]): QuizResult {
  const scores = answers.map(answer => mapDHILabelToScore(answer.answer));
  const finalScore = scores.reduce((sum, score) => sum + score, 0);

  let interpretation = "";
  let severity: 'normal' | 'mild' | 'moderate' | 'severe' = 'normal';
  let summary = "";

  if (finalScore >= 54) {
    interpretation = "🚨 Your score indicates severe handicap. Please consult a balance specialist.";
    severity = 'severe';
    summary = "You scored in the severe range, indicating significant impact on daily activities due to dizziness and balance issues.";
  } else if (finalScore >= 36) {
    interpretation = "⚠️ Your score indicates moderate handicap. Consider consulting a specialist.";
    severity = 'moderate';
    summary = "You scored in the moderate range, suggesting noticeable impact from dizziness symptoms.";
  } else if (finalScore >= 16) {
    interpretation = "🙂 Your score indicates mild handicap. Monitoring may be helpful.";
    severity = 'mild';
    summary = "You scored in the mild range, indicating some dizziness-related difficulties worth monitoring.";
  } else {
    interpretation = "✅ You appear to have minimal dizziness handicap at this time.";
    severity = 'normal';
    summary = "You scored in the normal range, indicating minimal impact from dizziness or balance problems.";
  }

  return { score: finalScore, interpretation, severity, summary };
}

function calculateSTOPScore(answers: QuizAnswer[]): QuizResult {
  const yesCount = answers.filter(answer => answer.answer === 'Yes').length;
  
  let interpretation = "";
  let severity: 'normal' | 'mild' | 'moderate' | 'severe' = 'normal';
  let summary = "";

  if (yesCount >= 5) {
    interpretation = "🚨 High Risk: You have a high risk of obstructive sleep apnea. Please consult a sleep specialist.";
    severity = 'severe';
    summary = "You scored in the high-risk range for sleep apnea, indicating multiple risk factors are present.";
  } else if (yesCount >= 3) {
    interpretation = "⚠️ Intermediate Risk: You have an intermediate risk of obstructive sleep apnea. Consider evaluation.";
    severity = 'moderate';
    summary = "You scored in the intermediate-risk range, suggesting some risk factors for sleep apnea are present.";
  } else {
    interpretation = "✅ Low Risk: You have a low risk of obstructive sleep apnea.";
    severity = 'normal';
    summary = "You scored in the low-risk range, indicating few risk factors for sleep apnea.";
  }

  return { score: yesCount, interpretation, severity, summary };
}

function mapTNSSLabelToScore(label: string): number {
  switch(label) {
    case "NO symptoms": return 0;
    case "MILD Symptoms present but easily tolerated": return 1;
    case "MODERATE Symptoms present and bothersome": return 2;
    case "SEVERE Symptoms present and interfere with activities of daily living and/or sleep": return 3;
    default: return 0;
  }
}

function calculateTNSSScore(answers: QuizAnswer[]): QuizResult {
  const scores = answers.map(answer => mapTNSSLabelToScore(answer.answer));
  const finalScore = scores.reduce((sum, score) => sum + score, 0);

  let interpretation = "";
  let severity: 'normal' | 'mild' | 'moderate' | 'severe' = 'normal';
  let summary = "";

  if (finalScore >= 9) {
    interpretation = "🚨 Your score suggests severe chronic rhinitis symptoms. We recommend consulting a specialist as soon as possible.";
    severity = 'severe';
    summary = "You scored in the severe range, indicating significant impact from nasal allergy symptoms.";
  } else if (finalScore >= 6) {
    interpretation = "⚠️ Your score indicates moderate chronic rhinitis symptoms, a common but treatable condition.";
    severity = 'moderate';
    summary = "You scored in the moderate range, suggesting noticeable nasal allergy symptoms that may benefit from treatment.";
  } else if (finalScore >= 1) {
    interpretation = "🙂 Your score shows mild chronic rhinitis symptoms. Monitoring and early care may be helpful.";
    severity = 'mild';
    summary = "You scored in the mild range, indicating some nasal allergy symptoms worth monitoring.";
  } else {
    interpretation = "✅ You appear to have no chronic rhinitis symptoms at this time.";
    severity = 'normal';
    summary = "You scored in the normal range, indicating no significant nasal allergy symptoms.";
  }

  return { score: finalScore, interpretation, severity, summary };
}
