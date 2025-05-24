
import { Quiz, QuizType } from '../types/quiz';

export const quizzes: Record<QuizType, Quiz> = {
  SNOT22: {
    id: 'SNOT22',
    title: 'SNOT-22',
    description: 'Sino-Nasal Outcome Test',
    questions: [
      {
        id: 'q1',
        text: 'Rate your need to blow nose',
        options: ['0 - Not a problem', '1 - Very Mild Problem', '2 - Moderate Problem', '3 - Fairly Bad Problem', '4 - Severe Problem', '5 - Problem as bad as it can be']
      },
      {
        id: 'q2',
        text: 'Rate your nasal itching',
        options: ['0 - Not a problem', '1 - Very Mild Problem', '2 - Moderate Problem', '3 - Fairly Bad Problem', '4 - Severe Problem', '5 - Problem as bad as it can be']
      },
      {
        id: 'q3',
        text: 'Rate your Sneezing',
        options: ['0 - Not a problem', '1 - Very Mild Problem', '2 - Moderate Problem', '3 - Fairly Bad Problem', '4 - Severe Problem', '5 - Problem as bad as it can be']
      },
      {
        id: 'q4',
        text: 'Rate your runny nose',
        options: ['0 - Not a problem', '1 - Very Mild Problem', '2 - Moderate Problem', '3 - Fairly Bad Problem', '4 - Severe Problem', '5 - Problem as bad as it can be']
      }
    ]
  },
  NOSE: {
    id: 'NOSE',
    title: 'NOSE',
    description: 'Nasal Obstruction Symptom Evaluation',
    questions: [
      {
        id: 'q1',
        text: 'How much of a problem is nasal congestion or stuffiness?',
        options: ['0 - Not a problem', '1 - Very Mild', '2 - Moderate', '3 - Fairly Bad', '4 - Severe']
      },
      {
        id: 'q2',
        text: 'How much of a problem is nasal blockage or obstruction?',
        options: ['0 - Not a problem', '1 - Very Mild', '2 - Moderate', '3 - Fairly Bad', '4 - Severe']
      },
      {
        id: 'q3',
        text: 'Do you have trouble breathing through your nose?',
        options: ['0 - Not a problem', '1 - Very Mild', '2 - Moderate', '3 - Fairly Bad', '4 - Severe']
      },
      {
        id: 'q4',
        text: 'Has your nasal issue caused you trouble sleeping?',
        options: ['0 - Not a problem', '1 - Very Mild', '2 - Moderate', '3 - Fairly Bad', '4 - Severe']
      },
      {
        id: 'q5',
        text: 'Do you feel like you can\'t get enough air through your nose during exercise or activity?',
        options: ['0 - Not a problem', '1 - Very Mild', '2 - Moderate', '3 - Fairly Bad', '4 - Severe']
      }
    ]
  },
  HHIA: {
    id: 'HHIA',
    title: 'HHIA',
    description: 'Hearing Handicap Inventory for Adults',
    questions: [
      {
        id: 'q1',
        text: 'Does a hearing problem cause you to feel embarrassed when you meet new people?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      },
      {
        id: 'q2',
        text: 'Do you feel that any difficulty with your hearing limits or hampers your personal or social life?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      },
      {
        id: 'q3',
        text: 'Does a hearing problem cause you to avoid groups of people?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      },
      {
        id: 'q4',
        text: 'Does a hearing problem cause you to feel frustrated when talking to members of your family?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      },
      {
        id: 'q5',
        text: 'Does a hearing problem cause you to go shopping less often than you would like?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      }
    ]
  },
  EPWORTH: {
    id: 'EPWORTH',
    title: 'Epworth Sleepiness Scale',
    description: 'Assessment of daytime sleepiness',
    questions: [
      {
        id: 'q1',
        text: 'Sitting and reading',
        options: ['0 - Would never nod off', '1 - Slight chance of nodding off', '2 - Moderate chance of nodding off', '3 - High chance of nodding off']
      },
      {
        id: 'q2',
        text: 'Watching TV',
        options: ['0 - Would never nod off', '1 - Slight chance of nodding off', '2 - Moderate chance of nodding off', '3 - High chance of nodding off']
      },
      {
        id: 'q3',
        text: 'Sitting, inactive, in a public place (e.g., in a meeting, theater, or dinner event)',
        options: ['0 - Would never nod off', '1 - Slight chance of nodding off', '2 - Moderate chance of nodding off', '3 - High chance of nodding off']
      },
      {
        id: 'q4',
        text: 'As a passenger in a car for an hour or more without stopping for a break',
        options: ['0 - Would never nod off', '1 - Slight chance of nodding off', '2 - Moderate chance of nodding off', '3 - High chance of nodding off']
      },
      {
        id: 'q5',
        text: 'Lying down to rest when circumstances permit',
        options: ['0 - Would never nod off', '1 - Slight chance of nodding off', '2 - Moderate chance of nodding off', '3 - High chance of nodding off']
      },
      {
        id: 'q6',
        text: 'Sitting and talking to someone',
        options: ['0 - Would never nod off', '1 - Slight chance of nodding off', '2 - Moderate chance of nodding off', '3 - High chance of nodding off']
      },
      {
        id: 'q7',
        text: 'Sitting quietly after a meal without alcohol',
        options: ['0 - Would never nod off', '1 - Slight chance of nodding off', '2 - Moderate chance of nodding off', '3 - High chance of nodding off']
      },
      {
        id: 'q8',
        text: 'In a car, while stopped for a few minutes in traffic or at a light',
        options: ['0 - Would never nod off', '1 - Slight chance of nodding off', '2 - Moderate chance of nodding off', '3 - High chance of nodding off']
      }
    ]
  },
  DHI: {
    id: 'DHI',
    title: 'DHI',
    description: 'Dizziness Handicap Inventory',
    questions: [
      {
        id: 'q1',
        text: 'Does looking up increase your problem?',
        options: ['No', 'Sometimes', 'Yes']
      },
      {
        id: 'q2',
        text: 'Because of your problem, do you feel frustrated?',
        options: ['No', 'Sometimes', 'Yes']
      },
      {
        id: 'q3',
        text: 'Because of your problem, do you restrict your travel for business or recreation?',
        options: ['No', 'Sometimes', 'Yes']
      },
      {
        id: 'q4',
        text: 'Does walking down the aisle of a supermarket increase your problems?',
        options: ['No', 'Sometimes', 'Yes']
      },
      {
        id: 'q5',
        text: 'Because of your problem, do you have difficulty getting into or out of bed?',
        options: ['No', 'Sometimes', 'Yes']
      }
    ]
  },
  STOP: {
    id: 'STOP',
    title: 'STOP-Bang',
    description: 'Sleep Apnea Screening',
    questions: [
      {
        id: 'q1',
        text: 'Do you Snore Loudly (loud enough to be heard through closed doors or your bed-partner elbows you for snoring at night)?',
        options: ['No', 'Yes']
      },
      {
        id: 'q2',
        text: 'Do you often feel Tired, Fatigued, or Sleepy during the daytime?',
        options: ['No', 'Yes']
      },
      {
        id: 'q3',
        text: 'Has anyone Observed you Stop Breathing or Choking/Gasping during your sleep?',
        options: ['No', 'Yes']
      },
      {
        id: 'q4',
        text: 'Do you have or are being treated for High Blood Pressure?',
        options: ['No', 'Yes']
      },
      {
        id: 'q5',
        text: 'Is your Body Mass Index more than 35 kg/m²?',
        options: ['No', 'Yes', 'Calculate BMI']
      },
      {
        id: 'q6',
        text: 'Are you older than 50?',
        options: ['No', 'Yes']
      },
      {
        id: 'q7',
        text: 'Is your shirt collar 16 inches / 40cm or larger?',
        options: ['No', 'Yes']
      },
      {
        id: 'q8',
        text: 'Are you Male?',
        options: ['No', 'Yes']
      }
    ]
  },
  TNSS: {
    id: 'TNSS',
    title: 'TNSS',
    description: 'Total Nasal Symptom Score',
    questions: [
      {
        id: 'q1',
        text: 'Rate your nasal congestion',
        options: ['NO symptoms', 'MILD Symptoms present but easily tolerated', 'MODERATE Symptoms present and bothersome', 'SEVERE Symptoms present and interfere with activities of daily living and/or sleep']
      },
      {
        id: 'q2',
        text: 'Rate your nasal and throat itching',
        options: ['NO symptoms', 'MILD Symptoms present but easily tolerated', 'MODERATE Symptoms present and bothersome', 'SEVERE Symptoms present and interfere with activities of daily living and/or sleep']
      },
      {
        id: 'q3',
        text: 'Rate your sneezing',
        options: ['NO symptoms', 'MILD Symptoms present but easily tolerated', 'MODERATE Symptoms present and bothersome', 'SEVERE Symptoms present and interfere with activities of daily living and/or sleep']
      },
      {
        id: 'q4',
        text: 'Rate your runny nose',
        options: ['NO symptoms', 'MILD Symptoms present but easily tolerated', 'MODERATE Symptoms present and bothersome', 'SEVERE Symptoms present and interfere with activities of daily living and/or sleep']
      }
    ]
  }
};
