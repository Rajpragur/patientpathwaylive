
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
  maxScore: number;
}

export interface QuizAnswer {
  questionId: string;
  answer: string;
}

export interface QuizResult {
  score: number;
  interpretation: string;
  severity: 'normal' | 'mild' | 'moderate' | 'severe';
  summary: string;
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
  lead_status: string;
  incident_source?: string;
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
  twilio_account_sid?: string;
  twilio_auth_token?: string;
  twilio_phone_number?: string;
  email_settings?: any;
}

export interface QuizIncident {
  id: string;
  doctor_id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface CustomQuiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  max_score: number;
  scoring: {
    mild_threshold: number;
    moderate_threshold: number;
    severe_threshold: number;
  };
  doctor_id: string;
  category: string;
  created_at: string;
  updated_at: string;
}
