export type QuizType = 'nose' | 'snot22' | 'tnss' | 'dhi' | 'epworth' | 'stop' | 'hhia' | string;

export interface QuizQuestion {
  text: string;
  type: 'multiple_choice' | 'likert_scale';
  options: Array<{
    text: string;
    value: number;
  }>;
}

export interface QuizData {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  maxScore: number;
  scoring?: {
    mild_threshold: number;
    moderate_threshold: number;
    severe_threshold: number;
  };
  isCustom: boolean;
  source: string;
  medium: string;
  campaign: string;
  doctorId?: string;
}
