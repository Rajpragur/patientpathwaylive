import { Quiz } from '@/types/quiz';

export const quizzes: Record<string, Quiz> = {
  SNOT22: {
    id: 'SNOT22',
    title: 'Sino-Nasal Outcome Test (SNOT-22)',
    description: 'Evaluates chronic rhinosinusitis symptoms and quality of life impact',
    maxScore: 110,
    questions: [
      {
        id: 'snot22_1',
        text: 'Need to blow nose',
        options: ['0 - Not a problem', '1 - Very Mild Problem', '2 - Moderate Problem', '3 - Fairly Bad Problem', '4 - Severe Problem', '5 - Problem as bad as it can be']
      },
      {
        id: 'snot22_2',
        text: 'Sneezing',
        options: ['0 - Not a problem', '1 - Very Mild Problem', '2 - Moderate Problem', '3 - Fairly Bad Problem', '4 - Severe Problem', '5 - Problem as bad as it can be']
      },
      {
        id: 'snot22_3',
        text: 'Runny nose',
        options: ['0 - Not a problem', '1 - Very Mild Problem', '2 - Moderate Problem', '3 - Fairly Bad Problem', '4 - Severe Problem', '5 - Problem as bad as it can be']
      },
      {
        id: 'snot22_4',
        text: 'Cough',
        options: ['0 - Not a problem', '1 - Very Mild Problem', '2 - Moderate Problem', '3 - Fairly Bad Problem', '4 - Severe Problem', '5 - Problem as bad as it can be']
      },
      {
        id: 'snot22_5',
        text: 'Nasal blockage',
        options: ['0 - Not a problem', '1 - Very Mild Problem', '2 - Moderate Problem', '3 - Fairly Bad Problem', '4 - Severe Problem', '5 - Problem as bad as it can be']
      },
      {
        id: 'snot22_6',
        text: 'Facial pain/pressure',
        options: ['0 - Not a problem', '1 - Very Mild Problem', '2 - Moderate Problem', '3 - Fairly Bad Problem', '4 - Severe Problem', '5 - Problem as bad as it can be']
      },
      {
        id: 'snot22_7',
        text: 'Loss of sense of smell or taste',
        options: ['0 - Not a problem', '1 - Very Mild Problem', '2 - Moderate Problem', '3 - Fairly Bad Problem', '4 - Severe Problem', '5 - Problem as bad as it can be']
      },
      {
        id: 'snot22_8',
        text: 'Dizziness',
        options: ['0 - Not a problem', '1 - Very Mild Problem', '2 - Moderate Problem', '3 - Fairly Bad Problem', '4 - Severe Problem', '5 - Problem as bad as it can be']
      },
      {
        id: 'snot22_9',
        text: 'Ear fullness',
        options: ['0 - Not a problem', '1 - Very Mild Problem', '2 - Moderate Problem', '3 - Fairly Bad Problem', '4 - Severe Problem', '5 - Problem as bad as it can be']
      },
      {
        id: 'snot22_10',
        text: 'Difficulty falling asleep',
        options: ['0 - Not a problem', '1 - Very Mild Problem', '2 - Moderate Problem', '3 - Fairly Bad Problem', '4 - Severe Problem', '5 - Problem as bad as it can be']
      },
      {
        id: 'snot22_11',
        text: 'Awakening at night',
        options: ['0 - Not a problem', '1 - Very Mild Problem', '2 - Moderate Problem', '3 - Fairly Bad Problem', '4 - Severe Problem', '5 - Problem as bad as it can be']
      },
      {
        id: 'snot22_12',
        text: 'Fatigue',
        options: ['0 - Not a problem', '1 - Very Mild Problem', '2 - Moderate Problem', '3 - Fairly Bad Problem', '4 - Severe Problem', '5 - Problem as bad as it can be']
      },
      {
        id: 'snot22_13',
        text: 'Reduced productivity',
        options: ['0 - Not a problem', '1 - Very Mild Problem', '2 - Moderate Problem', '3 - Fairly Bad Problem', '4 - Severe Problem', '5 - Problem as bad as it can be']
      },
      {
        id: 'snot22_14',
        text: 'Reduced concentration',
        options: ['0 - Not a problem', '1 - Very Mild Problem', '2 - Moderate Problem', '3 - Fairly Bad Problem', '4 - Severe Problem', '5 - Problem as bad as it can be']
      },
      {
        id: 'snot22_15',
        text: 'Frustrated/restless',
        options: ['0 - Not a problem', '1 - Very Mild Problem', '2 - Moderate Problem', '3 - Fairly Bad Problem', '4 - Severe Problem', '5 - Problem as bad as it can be']
      },
      {
        id: 'snot22_16',
        text: 'Feeling down',
        options: ['0 - Not a problem', '1 - Very Mild Problem', '2 - Moderate Problem', '3 - Fairly Bad Problem', '4 - Severe Problem', '5 - Problem as bad as it can be']
      },
      {
        id: 'snot22_17',
        text: 'Irritable',
        options: ['0 - Not a problem', '1 - Very Mild Problem', '2 - Moderate Problem', '3 - Fairly Bad Problem', '4 - Severe Problem', '5 - Problem as bad as it can be']
      },
      {
        id: 'snot22_18',
        text: 'Difficulty swallowing',
        options: ['0 - Not a problem', '1 - Very Mild Problem', '2 - Moderate Problem', '3 - Fairly Bad Problem', '4 - Severe Problem', '5 - Problem as bad as it can be']
      },
      {
        id: 'snot22_19',
        text: 'Thick nasal discharge',
        options: ['0 - Not a problem', '1 - Very Mild Problem', '2 - Moderate Problem', '3 - Fairly Bad Problem', '4 - Severe Problem', '5 - Problem as bad as it can be']
      },
      {
        id: 'snot22_20',
        text: 'Tightness in face',
        options: ['0 - Not a problem', '1 - Very Mild Problem', '2 - Moderate Problem', '3 - Fairly Bad Problem', '4 - Severe Problem', '5 - Problem as bad as it can be']
      },
      {
        id: 'snot22_21',
        text: 'Waking up tired',
        options: ['0 - Not a problem', '1 - Very Mild Problem', '2 - Moderate Problem', '3 - Fairly Bad Problem', '4 - Severe Problem', '5 - Problem as bad as it can be']
      },
      {
        id: 'snot22_22',
        text: 'Embarrassed',
        options: ['0 - Not a problem', '1 - Very Mild Problem', '2 - Moderate Problem', '3 - Fairly Bad Problem', '4 - Severe Problem', '5 - Problem as bad as it can be']
      }
    ]
  },
  NOSE: {
    id: 'NOSE',
    title: 'Nasal Obstruction Symptom Evaluation (NOSE)',
    description: 'Assesses nasal obstruction and breathing difficulties',
    maxScore: 80,
    questions: [
      {
        id: 'nose_1',
        text: 'Nasal congestion or stuffiness',
        options: ['0 - Not a problem', '1 - Very Mild', '2 - Moderate', '3 - Fairly Bad', '4 - Severe']
      },
      {
        id: 'nose_2',
        text: 'Nasal blockage or obstruction',
        options: ['0 - Not a problem', '1 - Very Mild', '2 - Moderate', '3 - Fairly Bad', '4 - Severe']
      },
      {
        id: 'nose_3',
        text: 'Trouble breathing through my nose',
        options: ['0 - Not a problem', '1 - Very Mild', '2 - Moderate', '3 - Fairly Bad', '4 - Severe']
      },
      {
        id: 'nose_4',
        text: 'Trouble sleeping',
        options: ['0 - Not a problem', '1 - Very Mild', '2 - Moderate', '3 - Fairly Bad', '4 - Severe']
      },
      {
        id: 'nose_5',
        text: 'Trouble sleeping',
        options: ['0 - Not a problem', '1 - Very Mild', '2 - Moderate', '3 - Fairly Bad', '4 - Severe']
      }
    ]
  },
  HHIA: {
    id: 'HHIA',
    title: 'Hearing Handicap Inventory for Adults (HHIA)',
    description: 'Evaluates hearing loss impact on daily activities',
    maxScore: 100,
    questions: [
      {
        id: 'hhia_1',
        text: 'Does a hearing problem cause you to use the phone less often than you would like?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      },
      {
        id: 'hhia_2',
        text: 'Does a hearing problem make it difficult for you to hear customers?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      },
      {
        id: 'hhia_3',
        text: 'Does a hearing problem cause you to feel embarrassed when meeting new people?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      },
      {
        id: 'hhia_4',
        text: 'Does a hearing problem cause you to feel frustrated when talking to members of your family?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      },
      {
        id: 'hhia_5',
        text: 'Does a hearing problem make you feel handicapped?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      },
      {
        id: 'hhia_6',
        text: 'Does a hearing problem cause you difficulty when visiting friends, relatives, or neighbors?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      },
      {
        id: 'hhia_7',
        text: 'Does a hearing problem cause you to attend religious services less often than you would like?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      },
      {
        id: 'hhia_8',
        text: 'Does a hearing problem cause you to have arguments with family members?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      },
      {
        id: 'hhia_9',
        text: 'Does a hearing problem cause you difficulty when watching TV?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      },
      {
        id: 'hhia_10',
        text: 'Does a hearing problem keep you from going out as much as you would like?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      },
      {
        id: 'hhia_11',
        text: 'Does a hearing problem make you irritable?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      },
      {
        id: 'hhia_12',
        text: 'Does a hearing problem make it difficult for you to hear at a restaurant?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      },
      {
        id: 'hhia_13',
        text: 'Does a hearing problem cause you to feel depressed?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      },
      {
        id: 'hhia_14',
        text: 'Does a hearing problem make it difficult for you to enjoy social activities?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      },
      {
        id: 'hhia_15',
        text: 'Does a hearing problem cause you to feel isolated from others?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      },
      {
        id: 'hhia_16',
        text: 'Does a hearing problem make it difficult for you to understand family members?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      },
      {
        id: 'hhia_17',
        text: 'Does a hearing problem make you feel left out when you are with people?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      },
      {
        id: 'hhia_18',
        text: 'Does a hearing problem cause you to feel insecure?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      },
      {
        id: 'hhia_19',
        text: 'Does a hearing problem cause you to be less interested in doing things?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      },
      {
        id: 'hhia_20',
        text: 'Does a hearing problem make it difficult for you to concentrate?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      },
      {
        id: 'hhia_21',
        text: 'Does a hearing problem affect your personal life?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      },
      {
        id: 'hhia_22',
        text: 'Does a hearing problem make you feel angry?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      },
      {
        id: 'hhia_23',
        text: 'Does a hearing problem make you feel confused?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      },
      {
        id: 'hhia_24',
        text: 'Does a hearing problem interfere with your work or other activities?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      },
      {
        id: 'hhia_25',
        text: 'Does a hearing problem cause you to avoid groups of people?',
        options: ['0 - No', '2 - Sometimes', '4 - Yes']
      }
    ]
  },
  EPWORTH: {
    id: 'EPWORTH',
    title: 'Epworth Sleepiness Scale',
    description: 'Measures daytime sleepiness and sleep disorders',
    maxScore: 24,
    questions: [
      {
        id: 'epworth_1',
        text: 'Sitting and reading',
        options: ['0 - Would never nod off', '1 - Slight chance of nodding off', '2 - Moderate chance of nodding off', '3 - High chance of nodding off']
      },
      {
        id: 'epworth_2',
        text: 'Watching TV',
        options: ['0 - Would never nod off', '1 - Slight chance of nodding off', '2 - Moderate chance of nodding off', '3 - High chance of nodding off']
      },
      {
        id: 'epworth_3',
        text: 'Sitting, inactive in a public place (e.g. a theatre or a meeting)',
        options: ['0 - Would never nod off', '1 - Slight chance of nodding off', '2 - Moderate chance of nodding off', '3 - High chance of nodding off']
      },
      {
        id: 'epworth_4',
        text: 'As a passenger in a car for an hour without a break',
        options: ['0 - Would never nod off', '1 - Slight chance of nodding off', '2 - Moderate chance of nodding off', '3 - High chance of nodding off']
      },
      {
        id: 'epworth_5',
        text: 'Lying down to rest in the afternoon when circumstances permit',
        options: ['0 - Would never nod off', '1 - Slight chance of nodding off', '2 - Moderate chance of nodding off', '3 - High chance of nodding off']
      },
      {
        id: 'epworth_6',
        text: 'Sitting and talking to someone',
        options: ['0 - Would never nod off', '1 - Slight chance of nodding off', '2 - Moderate chance of nodding off', '3 - High chance of nodding off']
      },
      {
        id: 'epworth_7',
        text: 'Sitting quietly after a lunch without alcohol',
        options: ['0 - Would never nod off', '1 - Slight chance of nodding off', '2 - Moderate chance of nodding off', '3 - High chance of nodding off']
      },
      {
        id: 'epworth_8',
        text: 'In a car, while stopped for a few minutes in traffic',
        options: ['0 - Would never nod off', '1 - Slight chance of nodding off', '2 - Moderate chance of nodding off', '3 - High chance of nodding off']
      }
    ]
  },
  DHI: {
    id: 'DHI',
    title: 'Dizziness Handicap Inventory (DHI)',
    description: 'Assesses dizziness impact on daily functioning',
    maxScore: 100,
    questions: [
      {
        id: 'dhi_1',
        text: 'Does looking up increase your problem?',
        options: ['No', 'Sometimes', 'Yes']
      },
      {
        id: 'dhi_2',
        text: 'Because of your problem, do you have difficulty getting out of bed?',
        options: ['No', 'Sometimes', 'Yes']
      },
      {
        id: 'dhi_3',
        text: 'Because of your problem, do you have difficulty reading?',
        options: ['No', 'Sometimes', 'Yes']
      },
      {
        id: 'dhi_4',
        text: 'Does moving suddenly increase your problem?',
        options: ['No', 'Sometimes', 'Yes']
      },
      {
        id: 'dhi_5',
        text: 'Because of your problem, do you have difficulty walking around the house?',
        options: ['No', 'Sometimes', 'Yes']
      },
      {
        id: 'dhi_6',
        text: 'Because of your problem, do you have difficulty going out alone?',
        options: ['No', 'Sometimes', 'Yes']
      },
      {
        id: 'dhi_7',
        text: 'Because of your problem, are you depressed?',
        options: ['No', 'Sometimes', 'Yes']
      },
      {
        id: 'dhi_8',
        text: 'Does changing position of your head increase your problem?',
        options: ['No', 'Sometimes', 'Yes']
      },
      {
        id: 'dhi_9',
        text: 'Because of your problem, do you have difficulty concentrating?',
        options: ['No', 'Sometimes', 'Yes']
      },
      {
        id: 'dhi_10',
        text: 'Because of your problem, do you have difficulty sleeping?',
        options: ['No', 'Sometimes', 'Yes']
      },
      {
        id: 'dhi_11',
        text: 'Because of your problem, do you have difficulty doing things around the house?',
        options: ['No', 'Sometimes', 'Yes']
      },
      {
        id: 'dhi_12',
        text: 'Because of your problem, are you afraid to leave your home?',
        options: ['No', 'Sometimes', 'Yes']
      },
      {
        id: 'dhi_13',
        text: 'Because of your problem, do you feel frustrated?',
        options: ['No', 'Sometimes', 'Yes']
      },
      {
        id: 'dhi_14',
        text: 'Does bending over increase your problem?',
        options: ['No', 'Sometimes', 'Yes']
      },
      {
        id: 'dhi_15',
        text: 'Because of your problem, are you afraid to walk alone down the street?',
        options: ['No', 'Sometimes', 'Yes']
      },
      {
        id: 'dhi_16',
        text: 'Because of your problem, do you have to restrict your social activities?',
        options: ['No', 'Sometimes', 'Yes']
      },
      {
        id: 'dhi_17',
        text: 'Can you not go out to dinner because of your problem?',
        options: ['No', 'Sometimes', 'Yes']
      },
      {
        id: 'dhi_18',
        text: 'Can you not shop because of your problem?',
        options: ['No', 'Sometimes', 'Yes']
      },
      {
        id: 'dhi_19',
        text: 'Because of your problem, do you feel handicapped?',
        options: ['No', 'Sometimes', 'Yes']
      },
      {
        id: 'dhi_20',
        text: 'Because of your problem, is it difficult for you to read?',
        options: ['No', 'Sometimes', 'Yes']
      },
      {
        id: 'dhi_21',
        text: 'Does getting into or out of bed increase your problem?',
        options: ['No', 'Sometimes', 'Yes']
      },
      {
        id: 'dhi_22',
        text: 'Does quick head movement increase your problem?',
        options: ['No', 'Sometimes', 'Yes']
      },
      {
        id: 'dhi_23',
        text: 'Because of your problem, are you tired?',
        options: ['No', 'Sometimes', 'Yes']
      },
      {
        id: 'dhi_24',
        text: 'Because of your problem, are you afraid to stay home alone?',
        options: ['No', 'Sometimes', 'Yes']
      },
      {
        id: 'dhi_25',
        text: 'Have you been avoiding heights?',
        options: ['No', 'Sometimes', 'Yes']
      }
    ]
  },
  STOP: {
    id: 'STOP',
    title: 'STOP-Bang Sleep Apnea Questionnaire',
    description: 'Screens for obstructive sleep apnea risk factors',
    maxScore: 8,
    questions: [
      {
        id: 'stop_1',
        text: 'Do you snore loudly (louder than talking or loud enough to be heard through closed doors)?',
        options: ['Yes', 'No']
      },
      {
        id: 'stop_2',
        text: 'Do you often feel tired, fatigued, or sleepy during the daytime?',
        options: ['Yes', 'No']
      },
      {
        id: 'stop_3',
        text: 'Has anyone observed you stop breathing or gasp/choke during your sleep?',
        options: ['Yes', 'No']
      },
      {
        id: 'stop_4',
        text: 'Do you have or are you being treated for high blood pressure?',
        options: ['Yes', 'No']
      },
      {
        id: 'stop_5',
        text: 'BMI more than 35 kg/m2?',
        options: ['Yes', 'No']
      },
      {
        id: 'stop_6',
        text: 'Age over 50 years old?',
        options: ['Yes', 'No']
      },
      {
        id: 'stop_7',
        text: 'Neck circumference greater than 40 cm?',
        options: ['Yes', 'No']
      },
      {
        id: 'stop_8',
        text: 'Gender: Are you male?',
        options: ['Yes', 'No']
      }
    ]
  },
  TNSS: {
    id: 'TNSS',
    title: 'Total Nasal Symptom Score (TNSS)',
    description: 'Evaluates nasal allergy symptoms severity',
    maxScore: 12,
    questions: [
      {
        id: 'tnss_1',
        text: 'Runny nose',
        options: ['NO symptoms', 'MILD Symptoms present but easily tolerated', 'MODERATE Symptoms present and bothersome', 'SEVERE Symptoms present and interfere with activities of daily living and/or sleep']
      },
      {
        id: 'tnss_2',
        text: 'Nasal congestion',
        options: ['NO symptoms', 'MILD Symptoms present but easily tolerated', 'MODERATE Symptoms present and bothersome', 'SEVERE Symptoms present and interfere with activities of daily living and/or sleep']
      },
      {
        id: 'tnss_3',
        text: 'Sneezing',
        options: ['NO symptoms', 'MILD Symptoms present but easily tolerated', 'MODERATE Symptoms present and bothersome', 'SEVERE Symptoms present and interfere with activities of daily living and/or sleep']
      },
      {
        id: 'tnss_4',
        text: 'Nasal itching',
        options: ['NO symptoms', 'MILD Symptoms present but easily tolerated', 'MODERATE Symptoms present and bothersome', 'SEVERE Symptoms present and interfere with activities of daily living and/or sleep']
      }
    ]
  }
};
