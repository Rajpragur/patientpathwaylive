export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  maxScore: number;
  scoring: ScoringCriteria;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
}

export interface ScoringCriteria {
  normal: string;
  mild: string;
  moderate: string;
  severe: string;
}

export interface QuizResult {
  score: number;
  maxScore: number;
  severity: 'normal' | 'mild' | 'moderate' | 'severe';
  interpretation: string;
  summary: string;
}

export type QuizType = 'SNOT22' | 'NOSE' | 'HHIA' | 'EPWORTH' | 'DHI' | 'STOP' | 'TNSS';

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  quiz_type: string;
  quiz_name?: string;  // The human-readable name of the quiz/assessment
  quiz_title?: string;
  score: number;
  created_at: string;
  submitted_at: string;
  lead_source?: string;
  lead_status?: string;
  incident_source?: string;
  answers?: any;
  doctor_id?: string;
  share_key?: string;
  scheduled_date?: string;
  custom_quiz_id?: string;
}

export interface QuizIncident {
  id: string;
  name: string;
  description?: string;
  doctor_id: string;
  created_at: string;
}
