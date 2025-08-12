export type QuizType = 'SNOT22' | 'NOSE' | 'HHIA' | 'EPWORTH' | 'DHI' | 'STOP' | 'TNSS' | 'SNOT12';

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
}

export interface Quiz {
  id: QuizType;
  title: string;
  description: string;
  questions: QuizQuestion[];
  maxScore: number;
  scoring: Object;
}

export interface QuizResult {
  score: number;
  severity: 'normal' | 'mild' | 'moderate' | 'severe';
  interpretation: string;
}
