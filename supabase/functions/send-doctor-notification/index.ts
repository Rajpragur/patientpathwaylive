import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DoctorNotificationRequest {
  leadId: string;
  doctorId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { leadId, doctorId }: DoctorNotificationRequest = await req.json();

    // Get lead details
    const { data: lead, error: leadError } = await supabaseClient
      .from('quiz_leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError) throw leadError;

    // Get doctor profile
    const { data: doctorProfile, error: doctorError } = await supabaseClient
      .from('doctor_profiles')
      .select('*')
      .eq('id', doctorId)
      .single();

    if (doctorError) throw doctorError;

    // Send doctor notification email via Resend
    const emailResult = await sendDoctorNotificationEmail(lead, doctorProfile);

    // Log the email
    await supabaseClient.from('email_logs').insert({
      doctor_id: doctorId,
      recipient_email: doctorProfile.email,
      subject: `New Lead: ${lead.name} - ${lead.quiz_type} Assessment`,
      status: emailResult.success ? 'sent' : 'failed',
      resend_id: emailResult.id || null,
      error_message: emailResult.error || null,
      sent_at: new Date().toISOString()
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Doctor notification sent successfully',
      emailResult
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending doctor notification:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

async function sendDoctorNotificationEmail(lead: any, doctorProfile: any) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const doctorName = `${doctorProfile.first_name} ${doctorProfile.last_name}`;
  const severity = getSeverityLevel(lead.score);
  const severityColor = getSeverityColor(severity);
  const dashboardUrl = `${Deno.env.get('APP_URL') || 'https://patientpathway.ai'}/portal?tab=dashboard`;

  // Generate quiz answers summary
  const answersSummary = generateAnswersSummary(lead.answers);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Lead Notification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
        .lead-info { background: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .urgent { border-left: 4px solid #dc2626; }
        .cta-button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .dashboard-button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 10px 20px 0; }
        .answers-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .answers-table th, .answers-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .answers-table th { background-color: #f2f2f2; }
        .score-highlight { font-size: 24px; font-weight: bold; color: ${severityColor}; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 New Lead Alert</h1>
          <p>Patient assessment completed - Action Required</p>
        </div>
        
        <div class="content">
          <h2>New Patient Assessment</h2>
          
          <div class="lead-info urgent">
            <h3>Patient Information</h3>
            <p><strong>Name:</strong> ${lead.name}</p>
            <p><strong>Assessment:</strong> ${lead.quiz_type}</p>
            <p><strong>Score:</strong> <span class="score-highlight">${lead.score}</span></p>
            <p><strong>Severity:</strong> <span style="color: ${severityColor}; font-weight: bold;">${severity.toUpperCase()}</span></p>
            <p><strong>Submitted:</strong> ${new Date(lead.submitted_at).toLocaleString()}</p>
            <p><strong>Source:</strong> ${lead.lead_source || 'Website'}</p>
          </div>
          
          <div class="lead-info">
            <h3>Contact Information</h3>
            <p><strong>Phone:</strong> <a href="tel:${lead.phone}">${lead.phone}</a></p>
            <p><strong>Email:</strong> <a href="mailto:${lead.email}">${lead.email}</a></p>
          </div>
          
          ${answersSummary}
          
          <div class="lead-info">
            <h3>Quick Actions</h3>
            <p><strong>Action Required:</strong> Please contact this patient within 24 hours.</p>
            <a href="tel:${lead.phone}" class="cta-button">📞 Call Patient Now</a>
            <a href="mailto:${lead.email}" class="cta-button">✉️ Email Patient</a>
            <a href="${dashboardUrl}" class="dashboard-button">📊 View Dashboard</a>
          </div>
          
          <div class="lead-info">
            <h3>Next Steps</h3>
            <ol>
              <li>Review the patient's assessment results above</li>
              <li>Contact the patient within 24 hours</li>
              <li>Schedule an appointment if needed</li>
              <li>Update the lead status in your dashboard</li>
            </ol>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f0f9ff; border-radius: 8px;">
          <p><strong>Dashboard Access</strong></p>
          <p>View all leads and manage this patient in your dashboard:</p>
          <a href="${dashboardUrl}" class="dashboard-button">Open Dashboard</a>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
New Lead Alert - Patient Assessment Completed

Patient Information:
- Name: ${lead.name}
- Assessment: ${lead.quiz_type}
- Score: ${lead.score}
- Severity: ${severity.toUpperCase()}
- Submitted: ${new Date(lead.submitted_at).toLocaleString()}
- Source: ${lead.lead_source || 'Website'}

Contact Information:
- Phone: ${lead.phone}
- Email: ${lead.email}

Action Required: Please contact this patient within 24 hours.

Dashboard: ${dashboardUrl}

Next Steps:
1. Review the patient's assessment results
2. Contact the patient within 24 hours
3. Schedule an appointment if needed
4. Update the lead status in your dashboard
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PatientPathway AI <onboarding@resend.dev>', // Using Resend's default domain
        to: doctorProfile.email,
        subject: `🚨 New Lead: ${lead.name} - ${lead.quiz_type} Assessment (Score: ${lead.score})`,
        html: html,
        text: text,
        reply_to: doctorProfile.email
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Resend API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    return {
      success: true,
      id: result.id,
      message: 'Doctor notification email sent successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to send doctor notification email'
    };
  }
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

serve(handler);
