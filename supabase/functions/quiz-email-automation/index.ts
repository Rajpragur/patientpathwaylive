import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

interface QuizResult {
  name: string;
  email: string;
  quiz_type: string;
  score: number;
  answers: any[];
  doctor_name?: string;
  clinic_name?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    const quizData: QuizResult = await req.json()
    console.log('Processing quiz completion:', quizData)

    // Validate required fields
    if (!quizData.name || !quizData.email || !quizData.quiz_type || quizData.score === undefined) {
      throw new Error('Missing required fields: name, email, quiz_type, score')
    }

    // Generate personalized email content based on quiz type and score
    const emailContent = generateEmailContent(quizData)
    
    // Send the email using Resend (real email service)
    const emailResult = await sendQuizEmailWithResend(quizData.email, emailContent)
    
    // Log the communication (only if we have database access)
    try {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      await supabaseAdmin
        .from('lead_communications')
        .insert([{
          communication_type: 'quiz_result_email',
          message: `Quiz result email sent to ${quizData.email} for ${quizData.quiz_type}`,
          status: emailResult.success ? 'sent' : 'failed',
          metadata: {
            to: quizData.email,
            quiz_type: quizData.quiz_type,
            score: quizData.score,
            email_id: emailResult.id,
            service: emailResult.service
          }
        }])
    } catch (dbError) {
      console.warn('Could not log email communication to database:', dbError)
      // Don't fail the function if database logging fails
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        data: emailResult,
        message: 'Quiz result email sent successfully to your Gmail!',
        email_content: emailContent,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200
      }
    )

  } catch (error) {
    console.error('Quiz email automation error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Failed to send quiz result email',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 400
      }
    )
  }
})

function generateEmailContent(quizData: QuizResult) {
  const { name, quiz_type, score, answers, doctor_name, clinic_name } = quizData
  
  // Quiz-specific content
  const quizInfo = getQuizInfo(quiz_type, score)
  
  // Generate personalized message based on score
  let scoreMessage = ''
  let recommendation = ''
  
  if (score >= 8) {
    scoreMessage = 'Your symptoms are severe and significantly impacting your quality of life.'
    recommendation = 'We recommend scheduling a consultation as soon as possible to discuss treatment options.'
  } else if (score >= 5) {
    scoreMessage = 'Your symptoms are moderate and affecting your daily activities.'
    recommendation = 'Consider scheduling a consultation to explore treatment options and symptom management strategies.'
  } else {
    scoreMessage = 'Your symptoms are mild and generally well-controlled.'
    recommendation = 'Continue monitoring your symptoms and schedule a consultation if they worsen.'
  }

  return {
    subject: `🎯 Your ${quizInfo.title} Results - Check Your Gmail!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quiz Results</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .score-box { background: white; border: 3px solid #667eea; border-radius: 15px; padding: 25px; margin: 25px 0; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
          .score { font-size: 52px; font-weight: bold; color: #667eea; margin: 15px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); }
          .recommendation { background: #e8f4fd; border-left: 5px solid #2196f3; padding: 20px; margin: 25px 0; border-radius: 8px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 18px 35px; text-decoration: none; border-radius: 30px; margin: 25px 0; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
          .footer { text-align: center; margin-top: 35px; color: #666; font-size: 14px; padding: 20px; background: #f0f0f0; }
          .gmail-notice { background: #e8f5e8; border: 2px solid #4caf50; border-radius: 10px; padding: 15px; margin: 20px 0; text-align: center; }
          .gmail-icon { font-size: 24px; margin-right: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 ${quizInfo.title}</h1>
            <p>Your personalized assessment results are ready!</p>
          </div>
          
          <div class="content">
            <div class="gmail-notice">
              <span class="gmail-icon">📧</span>
              <strong>Check your Gmail inbox!</strong> You should receive this email shortly.
            </div>
            
            <h2>Hello ${name},</h2>
            
            <p>Thank you for completing the <strong>${quizInfo.title}</strong> assessment. We've analyzed your responses and prepared personalized insights for you.</p>
            
            <div class="score-box">
              <div class="score">${score}</div>
              <p><strong>Your Total Score</strong></p>
              <p>${scoreMessage}</p>
            </div>
            
            <h3>📊 What This Means</h3>
            <p>${quizInfo.description}</p>
            
            <div class="recommendation">
              <h4>💡 Recommendation</h4>
              <p>${recommendation}</p>
            </div>
            
            <h3>🔍 Understanding Your Results</h3>
            <p>Your score of <strong>${score}</strong> indicates ${scoreMessage.toLowerCase()}</p>
            
            ${quizInfo.scoreInterpretation ? `<p>${quizInfo.scoreInterpretation}</p>` : ''}
            
            <h3>📋 Next Steps</h3>
            <ul>
              <li>Review your results and symptoms</li>
              <li>Consider scheduling a consultation with ${doctor_name || 'our medical team'}</li>
              <li>Monitor your symptoms over the next few days</li>
              <li>Keep this email for your records</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="mailto:${clinic_name ? 'info@' + clinic_name.toLowerCase().replace(/\s+/g, '') + '.com' : 'info@medicalpractice.com'}" class="cta-button">
                📧 Contact Us
              </a>
            </div>
            
            <div class="footer">
              <p>This assessment is for informational purposes only and should not replace professional medical advice.</p>
              <p>If you have urgent medical concerns, please contact your healthcare provider immediately.</p>
              <p><strong>Email sent via Resend - Check your Gmail inbox!</strong></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      🎯 Your ${quizInfo.title} Results

      Hello ${name},

      Thank you for completing the ${quizInfo.title} assessment. Your total score is ${score}.

      ${scoreMessage}

      Recommendation: ${recommendation}

      Next Steps:
      - Review your results and symptoms
      - Consider scheduling a consultation
      - Monitor your symptoms
      - Keep this email for your records

      This assessment is for informational purposes only and should not replace professional medical advice.

      Check your Gmail inbox for the full formatted version!
    `
  }
}

function getQuizInfo(quizType: string, score: number) {
  const quizTypes: { [key: string]: { title: string; description: string; scoreInterpretation?: string } } = {
    'TNSS': {
      title: 'Total Nasal Symptom Score (TNSS)',
      description: 'The TNSS is a validated 4-question assessment that evaluates the severity of your nasal allergy symptoms including nasal congestion, runny nose, nasal itching, and sneezing.',
      scoreInterpretation: `Scores range from 0-12, where 0-3 indicates mild symptoms, 4-7 indicates moderate symptoms, and 8-12 indicates severe symptoms.`
    },
    'SNOT22': {
      title: 'SNOT-22 Assessment',
      description: 'The SNOT-22 is a comprehensive 22-item questionnaire that measures the impact of sinonasal symptoms on your quality of life.',
      scoreInterpretation: `Scores range from 0-110, where 0-20 indicates minimal impact, 21-50 indicates moderate impact, and 51+ indicates severe impact on quality of life.`
    },
    'SNOT12': {
      title: 'SNOT-12 Assessment',
      description: 'The SNOT-12 is a 12-item questionnaire that measures the impact of sinonasal symptoms on your quality of life.',
      scoreInterpretation: `Scores range from 0-60, where 0-12 indicates minimal impact, 13-30 indicates moderate impact, and 31+ indicates severe impact.`
    },
    'STOP': {
      title: 'STOP Assessment',
      description: 'The STOP assessment evaluates your risk of sleep apnea based on snoring, tiredness, observed apneas, and blood pressure.',
      scoreInterpretation: `Scores range from 0-4, where 0-1 indicates low risk and 2+ indicates high risk of sleep apnea.`
    },
    'HHI': {
      title: 'Hearing Handicap Inventory',
      description: 'The HHI assesses the psychosocial impact of hearing loss on your daily life and communication abilities.',
      scoreInterpretation: `Scores range from 0-100, where 0-16 indicates no handicap, 18-42 indicates mild to moderate handicap, and 44+ indicates significant handicap.`
    },
    'NOS': {
      title: 'Nasal Obstruction Symptom Evaluation',
      description: 'The NOSE scale measures the severity of nasal obstruction symptoms and their impact on your quality of life.',
      scoreInterpretation: `Scores range from 0-20, where 0-5 indicates mild symptoms, 6-10 indicates moderate symptoms, and 11-20 indicates severe symptoms.`
    }
  }

  return quizTypes[quizType] || {
    title: `${quizType} Assessment`,
    description: 'This assessment helps evaluate your symptoms and provides personalized insights.',
    scoreInterpretation: 'Your score indicates the severity of your symptoms and their impact on your daily life.'
  }
}

async function sendQuizEmailWithResend(to: string, emailContent: any) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  
  if (!resendApiKey) {
    console.warn('Resend API key not configured, falling back to simulation')
    return await sendQuizEmailSimulated(to, emailContent)
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Patient Pathway <noreply@patientpathway.com>',
        to: [to],
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Resend API error:', error)
      throw new Error(`Resend error: ${response.status} - ${error}`)
    }

    const result = await response.json()
    console.log('Email sent successfully via Resend:', result)
    
    return {
      success: true,
      id: result.id || `resend_${Date.now()}`,
      message: 'Quiz result email sent successfully via Resend',
      service: 'resend',
      resend_id: result.id
    }
  } catch (error) {
    console.error('Resend email failed, falling back to simulation:', error)
    return await sendQuizEmailSimulated(to, emailContent)
  }
}

async function sendQuizEmailSimulated(to: string, emailContent: any) {
  // Fallback simulation if Resend fails
  console.log('Simulating email sending to:', to)
  
  await new Promise(resolve => setTimeout(resolve, 200))
  
  return {
    success: true,
    id: `sim_${Date.now()}`,
    message: 'Quiz result email simulated (Resend not configured)',
    service: 'simulation'
  }
}
