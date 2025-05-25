
export type QuizType = 'SNOT22' | 'NOSE' | 'HHIA' | 'EPWORTH' | 'DHI' | 'STOP' | 'TNSS';

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
  maxScore: number; // Added maxScore property
}

export interface QuizAnswer {
  questionId: string;
  answer: string;
}

export interface QuizResult {
  score: number;
  interpretation: string;
  severity: 'normal' | 'mild' | 'moderate' | 'severe';
  summary: string; // Added summary property
}

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  quiz_type: string;
  score: number;
  answers: any;
  lead_source: string;
  lead_status: 'NEW' | 'CONTACTED' | 'SCHEDULED';
  submitted_at: string;
  created_at: string;
  doctor_id: string;
}

export interface DoctorProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  specialty?: string;
  clinic_name?: string;
}
