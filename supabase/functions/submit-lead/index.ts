import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
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

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const leadData = await req.json()
    console.log('Processing lead submission:', leadData)

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'quiz_type', 'doctor_id', 'score']
    for (const field of requiredFields) {
      if (!leadData[field]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    // Insert lead data
    const { data: lead, error } = await supabaseAdmin
      .from('quiz_leads')
      .insert([{
        ...leadData,
        submitted_at: new Date().toISOString(),
      }])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    // Get doctor profile for communication settings
    const { data: doctorProfile, error: doctorError } = await supabaseAdmin
      .from('doctor_profiles')
      .select('*')
      .eq('id', leadData.doctor_id)
      .single()

    if (doctorError) {
      console.warn('Could not fetch doctor profile for communications:', doctorError)
    }

    // Send doctor notification email
    try {
      await sendDoctorNotification(lead, doctorProfile, supabaseAdmin)
    } catch (commError) {
      console.warn('Doctor notification failed:', commError)
      // Don't fail the lead submission if communications fail
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        data: lead,
        message: 'Lead submitted successfully'
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
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Failed to submit lead'
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

async function sendDoctorNotification(lead: any, doctorProfile: any, supabaseAdmin: any) {
  console.log('Sending doctor notification for lead:', lead.id)
  
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  console.log('Resend API Key (first 10 chars):', resendApiKey ? resendApiKey.substring(0, 10) + '...' : 'NOT_FOUND')
  console.log('API Key length:', resendApiKey ? resendApiKey.length : 0)
  console.log('API Key starts with re_:', resendApiKey ? resendApiKey.startsWith('re_') : false)
  
  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured, logging email content instead')
    await logEmailContent(lead, doctorProfile, supabaseAdmin)
    return
  }

  // Clean the API key - remove any potential encoding issues
  const cleanApiKey = resendApiKey.trim().replace(/['"]/g, '')
  console.log('Cleaned API Key (first 10 chars):', cleanApiKey.substring(0, 10) + '...')

  try {
    const doctorName = `${doctorProfile.first_name} ${doctorProfile.last_name}`;
    const severity = getSeverityLevel(lead.score);
    const severityColor = getSeverityColor(severity);
    const dashboardUrl = `${Deno.env.get('APP_URL') || 'https://patientpathway.ai'}/portal?tab=dashboard`;

    // Generate quiz answers summary
    const answersSummary = generateAnswersSummary(lead.answers);

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; margin-bottom: 20px;">New Quiz Submission</h2>
        
        <div style="margin-bottom: 20px;">
          <p><strong>Quiz:</strong> ${lead.quiz_type} - ${doctorName}</p>
          <p><strong>Status:</strong> Qualified Lead</p>
          <p><strong>Total Score:</strong> ${lead.score}</p>
          <p><strong>Submitted:</strong> ${new Date(lead.submitted_at).toLocaleString()}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 10px;">Contact Information</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Full Name:</strong> ${lead.name}</li>
            <li><strong>Mobile:</strong> ${lead.phone}</li>
            <li><strong>Email:</strong> ${lead.email}</li>
          </ul>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 10px;">Quiz Responses</h3>
          ${generateSimpleAnswersSummary(lead.answers)}
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 10px;">Clinician Dashboard Access</h3>
          <p>Check out your clinician dashboard: <a href="${dashboardUrl}" style="color: #0066cc;">${dashboardUrl}</a></p>
          <p><strong>PIN:</strong> ${lead.id.substring(0, 5)}</p>
          <p><em>Hint: Your PIN is your office zip code.</em></p>
        </div>
      </div>
    `;

    const text = `
New Quiz Submission

Quiz: ${lead.quiz_type} - ${doctorName}
Status: Qualified Lead
Total Score: ${lead.score}
Submitted: ${new Date(lead.submitted_at).toLocaleString()}

Contact Information:
- Full Name: ${lead.name}
- Mobile: ${lead.phone}
- Email: ${lead.email}

Quiz Responses:
${generateSimpleAnswersText(lead.answers)}

---

Clinician Dashboard Access
Check out your clinician dashboard: ${dashboardUrl}
PIN: ${lead.id.substring(0, 5)}
Hint: Your PIN is your office zip code.
    `;

    // Try to send email with Resend
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cleanApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'PatientPathway AI <noreply@resend.dev>',
          to: doctorProfile.email,
          subject: `🚨 New Lead: ${lead.name} - ${lead.quiz_type} Assessment (Score: ${lead.score})`,
          html: html,
          text: text,
          replyTo: doctorProfile.email
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Doctor notification email sent successfully:', result.id);

        // Log the email
        await supabaseAdmin.from('email_logs').insert({
          doctor_id: doctorProfile.id,
          recipient_email: doctorProfile.email,
          subject: `New Lead: ${lead.name} - ${lead.quiz_type} Assessment`,
          status: 'sent',
          resend_id: result.id,
          sent_at: new Date().toISOString()
        });

        // Also log in lead_communications for compatibility
        await supabaseAdmin
          .from('lead_communications')
          .insert({
        lead_id: lead.id,
        communication_type: 'doctor_notification_email',
            message: 'Doctor notification email sent successfully',
            status: 'sent',
            metadata: { 
              email_id: result.id,
              timestamp: new Date().toISOString()
            }
          });
      } else {
        const errorData = await response.json();
        console.warn('Resend API failed, logging email content instead:', errorData);
        await logEmailContent(lead, doctorProfile, supabaseAdmin, errorData);
      }
    } catch (resendError) {
      console.warn('Resend service error, logging email content instead:', resendError);
      await logEmailContent(lead, doctorProfile, supabaseAdmin, resendError);
    }

    } catch (error) {
    console.error('Failed to process doctor notification:', error);
    
    // Log the failure
    await supabaseAdmin
      .from('lead_communications')
      .insert({
        lead_id: lead.id,
        communication_type: 'doctor_notification_email',
        message: 'Failed to process doctor notification',
        status: 'failed',
        metadata: { 
          error: error.message,
          timestamp: new Date().toISOString()
        }
      });
    
    // Don't throw the error - just log it and continue
    console.warn('Doctor notification processing failed, but continuing with lead submission');
  }
}

async function logEmailContent(lead: any, doctorProfile: any, supabaseAdmin: any, error?: any) {
  console.log('=== EMAIL CONTENT (NOT SENT) ===');
  console.log('To:', doctorProfile.email);
  console.log('Subject:', `🚨 New Lead: ${lead.name} - ${lead.quiz_type} Assessment (Score: ${lead.score})`);
  console.log('Lead Details:', {
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    quiz_type: lead.quiz_type,
    score: lead.score,
    submitted_at: lead.submitted_at
  });
  console.log('=== END EMAIL CONTENT ===');

  // Log in lead_communications
  await supabaseAdmin
        .from('lead_communications')
    .insert({
      lead_id: lead.id,
      communication_type: 'doctor_notification_email',
      message: 'Email content logged (not sent due to Resend configuration)',
      status: 'logged',
      metadata: { 
        error: error?.message || 'Resend not configured',
        timestamp: new Date().toISOString(),
        email_content: {
          to: doctorProfile.email,
          subject: `🚨 New Lead: ${lead.name} - ${lead.quiz_type} Assessment (Score: ${lead.score})`,
          lead_details: {
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            quiz_type: lead.quiz_type,
            score: lead.score
          }
        }
      }
    });
}

function generateSimpleAnswersSummary(answers: any) {
  if (!answers || Object.keys(answers).length === 0) {
    return '<p>Detailed answers not available.</p>';
  }
  
  let summary = '<ul style="margin: 0; padding-left: 20px;">';
  
  // Process answers
  Object.entries(answers).forEach(([key, value], index) => {
    const question = `Question ${index + 1}`;
    const answer = typeof value === 'object' ? JSON.stringify(value) : value;
    
    summary += `<li><strong>${question}:</strong> ${answer}</li>`;
  });
  
  summary += '</ul>';
  return summary;
}

function generateSimpleAnswersText(answers: any) {
  if (!answers || Object.keys(answers).length === 0) {
    return 'Detailed answers not available.';
  }
  
  let summary = '';
  
  // Process answers
  Object.entries(answers).forEach(([key, value], index) => {
    const question = `Question ${index + 1}`;
    const answer = typeof value === 'object' ? JSON.stringify(value) : value;
    
    summary += `- ${question}: ${answer}\n`;
  });
  
  return summary;
}

function generateAnswersSummary(answers: any) {
  if (!answers || Object.keys(answers).length === 0) {
    return '<div class="lead-info"><h3>Assessment Details</h3><p>Detailed answers not available.</p></div>';
  }
  
  let summary = '<div class="lead-info"><h3>Assessment Details</h3><table class="answers-table">';
  summary += '<tr><th>Question</th><th>Answer</th><th>Score</th></tr>';
  
  // Process answers
  Object.entries(answers).forEach(([key, value], index) => {
    const question = `Question ${index + 1}`;
    const answer = typeof value === 'object' ? JSON.stringify(value) : value;
    const score = typeof value === 'number' ? value : 'N/A';
    
    summary += `<tr><td>${question}</td><td>${answer}</td><td>${score}</td></tr>`;
  });
  
  summary += '</table></div>';
  return summary;
}

function getSeverityLevel(score: number) {
  if (score >= 80) return 'severe';
  if (score >= 60) return 'moderate';
  if (score >= 40) return 'mild';
  return 'normal';
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'severe': return '#dc2626';
    case 'moderate': return '#ea580c';
    case 'mild': return '#ca8a04';
    default: return '#059669';
  }
}

// Note: Email and SMS functions are now handled by n8n workflows
// This file now only triggers the n8n workflow for automated communications