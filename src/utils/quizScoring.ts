
import { QuizType, QuizAnswer, QuizResult } from '../types/quiz';

export function calculateQuizScore(quizType: QuizType, answers: QuizAnswer[]): QuizResult {
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
      return { score: 0, interpretation: 'Unknown quiz type', severity: 'normal' };
  }
}

function mapSNOT22LabelToScore(label: string): number {
  switch(label) {
    case "0 - Not a problem": return 0;
    case "1 - Very Mild Problem": return 1;
    case "2 - Moderate Problem": return 2;
    case "3 - Fairly Bad Problem": return 3;
    case "4 - Severe Problem": return 4;
    case "5 - Problem as bad as it can be": return 5;
    default: return 0;
  }
}

function calculateSNOT22Score(answers: QuizAnswer[]): QuizResult {
  const scores = answers.map(answer => mapSNOT22LabelToScore(answer.answer));
  const rawScore = scores.reduce((sum, score) => sum + score, 0);
  const finalScore = rawScore * 5;

  let interpretation = "";
  let severity: 'normal' | 'mild' | 'moderate' | 'severe' = 'normal';

  if (finalScore >= 45) {
    interpretation = "🚨 Your score suggests severe chronic rhinitis. We recommend consulting a specialist as soon as possible.";
    severity = 'severe';
  } else if (finalScore >= 18) {
    interpretation = "⚠️ Your score indicates significant chronic rhinitis, a common but treatable condition.";
    severity = 'moderate';
  } else {
    interpretation = "✅ You appear to have No to Mild Chronic rhinitis at this time.";
    severity = 'normal';
  }

  return { score: finalScore, interpretation, severity };
}

function mapNOSELabelToScore(label: string): number {
  switch(label) {
    case "0 - Not a problem": return 0;
    case "1 - Very Mild": return 1;
    case "2 - Moderate": return 2;
    case "3 - Fairly Bad": return 3;
    case "4 - Severe": return 4;
    default: return 0;
  }
}

function calculateNOSEScore(answers: QuizAnswer[]): QuizResult {
  const scores = answers.map(answer => mapNOSELabelToScore(answer.answer));
  const rawScore = scores.reduce((sum, score) => sum + score, 0);
  const finalScore = rawScore * 5;

  let interpretation = "";
  let severity: 'normal' | 'mild' | 'moderate' | 'severe' = 'normal';

  if (finalScore >= 80) {
    interpretation = "🚨 Your score suggests severe nasal obstruction. We recommend consulting a specialist as soon as possible.";
    severity = 'severe';
  } else if (finalScore >= 55) {
    interpretation = "⚠️ Your score indicates significant nasal obstruction, a common but treatable condition.";
    severity = 'moderate';
  } else if (finalScore >= 30) {
    interpretation = "🙂 Your score shows moderate symptoms. Monitoring and early care may be helpful.";
    severity = 'mild';
  } else {
    interpretation = "✅ You appear to have mild or no nasal obstruction at this time.";
    severity = 'normal';
  }

  return { score: finalScore, interpretation, severity };
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

  if (finalScore >= 44) {
    interpretation = "🚨 Your score suggests a significant hearing handicap. Please consider consulting an audiologist or ENT specialist.";
    severity = 'severe';
  } else if (finalScore >= 18) {
    interpretation = "⚠️ Your score indicates a mild to moderate hearing handicap, which may impact your daily communication.";
    severity = 'moderate';
  } else {
    interpretation = "✅ You appear to have no significant hearing handicap at this time.";
    severity = 'normal';
  }

  return { score: finalScore, interpretation, severity };
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

  if (finalScore >= 16) {
    interpretation = "Your score suggests severe daytime sleepiness. Please seek medical attention — this could indicate a serious underlying sleep disorder.";
    severity = 'severe';
  } else if (finalScore >= 10) {
    interpretation = "Your score raises concern: you may need to get more sleep, improve your sleep hygiene, or consult a doctor.";
    severity = 'moderate';
  } else if (finalScore >= 5) {
    interpretation = "Your score shows mild sleepiness. Monitor your sleep habits and stay consistent with your sleep routine.";
    severity = 'mild';
  } else {
    interpretation = "You appear to have normal sleep patterns with no excessive daytime sleepiness.";
    severity = 'normal';
  }

  return { score: finalScore, interpretation, severity };
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

  if (finalScore >= 54) {
    interpretation = "🚨 Your score indicates severe handicap. Please consult a balance specialist.";
    severity = 'severe';
  } else if (finalScore >= 36) {
    interpretation = "⚠️ Your score indicates moderate handicap. Consider consulting a specialist.";
    severity = 'moderate';
  } else if (finalScore >= 16) {
    interpretation = "🙂 Your score indicates mild handicap. Monitoring may be helpful.";
    severity = 'mild';
  } else {
    interpretation = "✅ You appear to have minimal dizziness handicap at this time.";
    severity = 'normal';
  }

  return { score: finalScore, interpretation, severity };
}

function calculateSTOPScore(answers: QuizAnswer[]): QuizResult {
  const yesCount = answers.filter(answer => answer.answer === 'Yes').length;
  
  let interpretation = "";
  let severity: 'normal' | 'mild' | 'moderate' | 'severe' = 'normal';

  if (yesCount >= 5) {
    interpretation = "🚨 High Risk: You have a high risk of obstructive sleep apnea. Please consult a sleep specialist.";
    severity = 'severe';
  } else if (yesCount >= 3) {
    interpretation = "⚠️ Intermediate Risk: You have an intermediate risk of obstructive sleep apnea. Consider evaluation.";
    severity = 'moderate';
  } else {
    interpretation = "✅ Low Risk: You have a low risk of obstructive sleep apnea.";
    severity = 'normal';
  }

  return { score: yesCount, interpretation, severity };
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

  if (finalScore >= 9) {
    interpretation = "🚨 Your score suggests severe chronic rhinitis symptoms. We recommend consulting a specialist as soon as possible.";
    severity = 'severe';
  } else if (finalScore >= 6) {
    interpretation = "⚠️ Your score indicates moderate chronic rhinitis symptoms, a common but treatable condition.";
    severity = 'moderate';
  } else if (finalScore >= 1) {
    interpretation = "🙂 Your score shows mild chronic rhinitis symptoms. Monitoring and early care may be helpful.";
    severity = 'mild';
  } else {
    interpretation = "✅ You appear to have no chronic rhinitis symptoms at this time.";
    severity = 'normal';
  }

  return { score: finalScore, interpretation, severity };
}
