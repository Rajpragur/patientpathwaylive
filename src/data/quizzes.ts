
import { Quiz } from '@/types/quiz';

export const quizzes: Record<string, Quiz> = {
  SNOT22: {
    id: 'SNOT22',
    title: 'SNOT-22 Assessment',
    description: 'Comprehensive evaluation of sinus and nasal symptoms',
    maxScore: 110,
    questions: [
      {
        id: '1',
        text: 'How often do you experience nasal congestion?',
        options: ['Never (0)', 'Rarely (1)', 'Sometimes (2)', 'Often (3)', 'Very Often (4)', 'Constantly (5)']
      },
      {
        id: '2', 
        text: 'How often do you experience runny nose?',
        options: ['Never (0)', 'Rarely (1)', 'Sometimes (2)', 'Often (3)', 'Very Often (4)', 'Constantly (5)']
      },
      {
        id: '3',
        text: 'How often do you experience post-nasal discharge?',
        options: ['Never (0)', 'Rarely (1)', 'Sometimes (2)', 'Often (3)', 'Very Often (4)', 'Constantly (5)']
      },
      {
        id: '4',
        text: 'How often do you experience thick nasal discharge?',
        options: ['Never (0)', 'Rarely (1)', 'Sometimes (2)', 'Often (3)', 'Very Often (4)', 'Constantly (5)']
      },
      {
        id: '5',
        text: 'How often do you experience loss of smell/taste?',
        options: ['Never (0)', 'Rarely (1)', 'Sometimes (2)', 'Often (3)', 'Very Often (4)', 'Constantly (5)']
      },
      {
        id: '6',
        text: 'How often do you experience cough?',
        options: ['Never (0)', 'Rarely (1)', 'Sometimes (2)', 'Often (3)', 'Very Often (4)', 'Constantly (5)']
      },
      {
        id: '7',
        text: 'How often do you experience ear fullness?',
        options: ['Never (0)', 'Rarely (1)', 'Sometimes (2)', 'Often (3)', 'Very Often (4)', 'Constantly (5)']
      },
      {
        id: '8',
        text: 'How often do you experience dizziness?',
        options: ['Never (0)', 'Rarely (1)', 'Sometimes (2)', 'Often (3)', 'Very Often (4)', 'Constantly (5)']
      },
      {
        id: '9',
        text: 'How often do you experience ear pain?',
        options: ['Never (0)', 'Rarely (1)', 'Sometimes (2)', 'Often (3)', 'Very Often (4)', 'Constantly (5)']
      },
      {
        id: '10',
        text: 'How often do you experience facial pain/pressure?',
        options: ['Never (0)', 'Rarely (1)', 'Sometimes (2)', 'Often (3)', 'Very Often (4)', 'Constantly (5)']
      },
      {
        id: '11',
        text: 'How often do you have difficulty falling asleep?',
        options: ['Never (0)', 'Rarely (1)', 'Sometimes (2)', 'Often (3)', 'Very Often (4)', 'Constantly (5)']
      },
      {
        id: '12',
        text: 'How often do you wake up at night?',
        options: ['Never (0)', 'Rarely (1)', 'Sometimes (2)', 'Often (3)', 'Very Often (4)', 'Constantly (5)']
      },
      {
        id: '13',
        text: 'How often do you lack a good night\'s sleep?',
        options: ['Never (0)', 'Rarely (1)', 'Sometimes (2)', 'Often (3)', 'Very Often (4)', 'Constantly (5)']
      },
      {
        id: '14',
        text: 'How often do you wake up tired?',
        options: ['Never (0)', 'Rarely (1)', 'Sometimes (2)', 'Often (3)', 'Very Often (4)', 'Constantly (5)']
      },
      {
        id: '15',
        text: 'How often are you fatigued during the day?',
        options: ['Never (0)', 'Rarely (1)', 'Sometimes (2)', 'Often (3)', 'Very Often (4)', 'Constantly (5)']
      },
      {
        id: '16',
        text: 'How often do you have reduced productivity?',
        options: ['Never (0)', 'Rarely (1)', 'Sometimes (2)', 'Often (3)', 'Very Often (4)', 'Constantly (5)']
      },
      {
        id: '17',
        text: 'How often do you have reduced concentration?',
        options: ['Never (0)', 'Rarely (1)', 'Sometimes (2)', 'Often (3)', 'Very Often (4)', 'Constantly (5)']
      },
      {
        id: '18',
        text: 'How often are you frustrated/restless/irritable?',
        options: ['Never (0)', 'Rarely (1)', 'Sometimes (2)', 'Often (3)', 'Very Often (4)', 'Constantly (5)']
      },
      {
        id: '19',
        text: 'How often are you sad?',
        options: ['Never (0)', 'Rarely (1)', 'Sometimes (2)', 'Often (3)', 'Very Often (4)', 'Constantly (5)']
      },
      {
        id: '20',
        text: 'How often are you embarrassed by your condition?',
        options: ['Never (0)', 'Rarely (1)', 'Sometimes (2)', 'Often (3)', 'Very Often (4)', 'Constantly (5)']
      },
      {
        id: '21',
        text: 'How often do you avoid spending time with others?',
        options: ['Never (0)', 'Rarely (1)', 'Sometimes (2)', 'Often (3)', 'Very Often (4)', 'Constantly (5)']
      },
      {
        id: '22',
        text: 'How often do you experience difficulty breathing through your nose?',
        options: ['Never (0)', 'Rarely (1)', 'Sometimes (2)', 'Often (3)', 'Very Often (4)', 'Constantly (5)']
      }
    ]
  },
  
  NOSE: {
    id: 'NOSE',
    title: 'NOSE Scale Assessment',
    description: 'Nasal Obstruction Symptom Evaluation for breathing difficulties',
    maxScore: 100,
    questions: [
      {
        id: '1',
        text: 'Nasal congestion or stuffiness',
        options: ['Not a problem (0)', 'Very mild problem (5)', 'Moderate problem (10)', 'Fairly bad problem (15)', 'Severe problem (20)']
      },
      {
        id: '2',
        text: 'Nasal blockage or obstruction',
        options: ['Not a problem (0)', 'Very mild problem (5)', 'Moderate problem (10)', 'Fairly bad problem (15)', 'Severe problem (20)']
      },
      {
        id: '3',
        text: 'Trouble breathing through my nose',
        options: ['Not a problem (0)', 'Very mild problem (5)', 'Moderate problem (10)', 'Fairly bad problem (15)', 'Severe problem (20)']
      },
      {
        id: '4',
        text: 'Trouble sleeping',
        options: ['Not a problem (0)', 'Very mild problem (5)', 'Moderate problem (10)', 'Fairly bad problem (15)', 'Severe problem (20)']
      },
      {
        id: '5',
        text: 'Unable to get enough air through my nose during exercise or exertion',
        options: ['Not a problem (0)', 'Very mild problem (5)', 'Moderate problem (10)', 'Fairly bad problem (15)', 'Severe problem (20)']
      }
    ]
  },

  HHIA: {
    id: 'HHIA',
    title: 'Hearing Handicap Inventory for Adults',
    description: 'Assessment of hearing difficulties and their impact on daily life',
    maxScore: 100,
    questions: [
      {
        id: '1',
        text: 'Does a hearing problem cause you to feel embarrassed when meeting new people?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '2',
        text: 'Does a hearing problem cause you to feel frustrated when talking to members of your family?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '3',
        text: 'Do you have difficulty hearing when someone speaks in a whisper?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '4',
        text: 'Do you feel handicapped by a hearing problem?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '5',
        text: 'Does a hearing problem cause you difficulty when visiting friends, relatives, or neighbors?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '6',
        text: 'Does a hearing problem cause you to attend religious services less often than you would like?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '7',
        text: 'Does a hearing problem cause you to have arguments with family members?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '8',
        text: 'Does a hearing problem cause you difficulty when listening to TV or radio?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '9',
        text: 'Do you feel that any difficulty with your hearing limits or hampers your personal or social life?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '10',
        text: 'Does a hearing problem cause you difficulty when in a restaurant with relatives or friends?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '11',
        text: 'Does a hearing problem cause you to feel depressed?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '12',
        text: 'Does a hearing problem cause you to listen to TV or radio more loudly than others?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '13',
        text: 'Does a hearing problem cause you to feel nervous?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '14',
        text: 'Does a hearing problem cause you to visit friends, relatives, or neighbors less often than you would like?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '15',
        text: 'Does a hearing problem cause you to have difficulty hearing/understanding co-workers, clients, or customers?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '16',
        text: 'Do you feel handicapped by a hearing problem?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '17',
        text: 'Does a hearing problem cause you difficulty when listening to TV or radio?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '18',
        text: 'Does a hearing problem cause you to feel left out when you are with a group of people?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '19',
        text: 'Does a hearing problem cause you to be irritable?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '20',
        text: 'Does a hearing problem cause you to feel left out when you are with a group of people?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '21',
        text: 'Does a hearing problem cause you difficulty when you are in a crowded store?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '22',
        text: 'Does a hearing problem cause you to feel isolated from others?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '23',
        text: 'Does a hearing problem cause you to avoid groups of people?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '24',
        text: 'Does a hearing problem cause you difficulty when talking on the telephone?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '25',
        text: 'Do you feel that a hearing problem reduces your enjoyment of life?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      }
    ]
  },

  EPWORTH: {
    id: 'EPWORTH',
    title: 'Epworth Sleepiness Scale',
    description: 'Measure your general level of daytime sleepiness',
    maxScore: 24,
    questions: [
      {
        id: '1',
        text: 'How likely are you to doze off or fall asleep while sitting and reading?',
        options: ['Would never doze (0)', 'Slight chance of dozing (1)', 'Moderate chance of dozing (2)', 'High chance of dozing (3)']
      },
      {
        id: '2',
        text: 'How likely are you to doze off or fall asleep while watching TV?',
        options: ['Would never doze (0)', 'Slight chance of dozing (1)', 'Moderate chance of dozing (2)', 'High chance of dozing (3)']
      },
      {
        id: '3',
        text: 'How likely are you to doze off or fall asleep while sitting inactive in a public place?',
        options: ['Would never doze (0)', 'Slight chance of dozing (1)', 'Moderate chance of dozing (2)', 'High chance of dozing (3)']
      },
      {
        id: '4',
        text: 'How likely are you to doze off or fall asleep as a passenger in a car for an hour without a break?',
        options: ['Would never doze (0)', 'Slight chance of dozing (1)', 'Moderate chance of dozing (2)', 'High chance of dozing (3)']
      },
      {
        id: '5',
        text: 'How likely are you to doze off or fall asleep while lying down to rest in the afternoon?',
        options: ['Would never doze (0)', 'Slight chance of dozing (1)', 'Moderate chance of dozing (2)', 'High chance of dozing (3)']
      },
      {
        id: '6',
        text: 'How likely are you to doze off or fall asleep while sitting and talking to someone?',
        options: ['Would never doze (0)', 'Slight chance of dozing (1)', 'Moderate chance of dozing (2)', 'High chance of dozing (3)']
      },
      {
        id: '7',
        text: 'How likely are you to doze off or fall asleep while sitting quietly after lunch without alcohol?',
        options: ['Would never doze (0)', 'Slight chance of dozing (1)', 'Moderate chance of dozing (2)', 'High chance of dozing (3)']
      },
      {
        id: '8',
        text: 'How likely are you to doze off or fall asleep while in a car, while stopped for a few minutes in traffic?',
        options: ['Would never doze (0)', 'Slight chance of dozing (1)', 'Moderate chance of dozing (2)', 'High chance of dozing (3)']
      }
    ]
  },

  DHI: {
    id: 'DHI',
    title: 'Dizziness Handicap Inventory',
    description: 'Assessment of dizziness impact on daily activities',
    maxScore: 100,
    questions: [
      {
        id: '1',
        text: 'Does looking up increase your problem?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '2',
        text: 'Because of your problem, do you feel frustrated?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '3',
        text: 'Because of your problem, do you restrict your travel for business or recreation?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '4',
        text: 'Does walking down the aisle of a supermarket increase your problems?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '5',
        text: 'Because of your problem, do you have difficulty getting into or out of bed?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '6',
        text: 'Does your problem significantly restrict your participation in social activities?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '7',
        text: 'Because of your problem, do you have difficulty reading?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '8',
        text: 'Does performing more ambitious activities like sports, dancing, household chores increase your problem?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '9',
        text: 'Because of your problem, are you afraid to leave your home without having someone accompany you?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '10',
        text: 'Because of your problem, have you been embarrassed in front of others?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '11',
        text: 'Do quick movements of your head increase your problem?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '12',
        text: 'Because of your problem, do you avoid heights?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '13',
        text: 'Does turning over in bed increase your problem?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '14',
        text: 'Because of your problem, is it difficult for you to do strenuous housework or yard work?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '15',
        text: 'Because of your problem, are you afraid people may think you are intoxicated?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '16',
        text: 'Because of your problem, is it difficult for you to go for a walk by yourself?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '17',
        text: 'Does walking down a sidewalk increase your problem?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '18',
        text: 'Because of your problem, is it difficult for you to concentrate?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '19',
        text: 'Because of your problem, is it difficult for you to walk around your house in the dark?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '20',
        text: 'Because of your problem, are you afraid to stay home alone?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '21',
        text: 'Because of your problem, do you feel handicapped?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '22',
        text: 'Has the problem placed stress on your relationships with members of your family or friends?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '23',
        text: 'Because of your problem, are you depressed?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '24',
        text: 'Does your problem interfere with your job or household responsibilities?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      },
      {
        id: '25',
        text: 'Does bending over increase your problem?',
        options: ['Yes (4)', 'Sometimes (2)', 'No (0)']
      }
    ]
  },

  STOP: {
    id: 'STOP',
    title: 'STOP-Bang Sleep Apnea Screening',
    description: 'Screening tool for obstructive sleep apnea risk assessment',
    maxScore: 8,
    questions: [
      {
        id: '1',
        text: 'Do you Snore loudly (louder than talking or loud enough to be heard through closed doors)?',
        options: ['Yes (1)', 'No (0)']
      },
      {
        id: '2',
        text: 'Do you often feel Tired, fatigued, or sleepy during daytime?',
        options: ['Yes (1)', 'No (0)']
      },
      {
        id: '3',
        text: 'Has anyone Observed you stop breathing during your sleep?',
        options: ['Yes (1)', 'No (0)']
      },
      {
        id: '4',
        text: 'Do you have or are you being treated for high blood Pressure?',
        options: ['Yes (1)', 'No (0)']
      },
      {
        id: '5',
        text: 'Body Mass Index more than 35 kg/m²?',
        options: ['Yes (1)', 'No (0)']
      },
      {
        id: '6',
        text: 'Age over 50 years old?',
        options: ['Yes (1)', 'No (0)']
      },
      {
        id: '7',
        text: 'Neck circumference greater than 40cm?',
        options: ['Yes (1)', 'No (0)']
      },
      {
        id: '8',
        text: 'Gender: Are you male?',
        options: ['Yes (1)', 'No (0)']
      }
    ]
  },

  TNSS: {
    id: 'TNSS',
    title: 'Total Nasal Symptom Score',
    description: 'Assessment of nasal congestion and rhinitis symptoms',
    maxScore: 12,
    questions: [
      {
        id: '1',
        text: 'Nasal congestion/stuffiness',
        options: ['None (0)', 'Mild (1)', 'Moderate (2)', 'Severe (3)']
      },
      {
        id: '2',
        text: 'Runny nose',
        options: ['None (0)', 'Mild (1)', 'Moderate (2)', 'Severe (3)']
      },
      {
        id: '3',
        text: 'Nasal itching',
        options: ['None (0)', 'Mild (1)', 'Moderate (2)', 'Severe (3)']
      },
      {
        id: '4',
        text: 'Sneezing',
        options: ['None (0)', 'Mild (1)', 'Moderate (2)', 'Severe (3)']
      }
    ]
  }
};
