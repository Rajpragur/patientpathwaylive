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

    // Trigger automated communications
    try {
      await triggerAutomatedCommunications(lead, doctorProfile, supabaseAdmin)
    } catch (commError) {
      console.warn('Automated communications failed:', commError)
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

async function triggerAutomatedCommunications(lead: any, doctorProfile: any, supabaseAdmin: any) {
  console.log('Triggering automated communications for lead:', lead.id)
  
  const communications = []
  
  // 1. Send welcome SMS to the lead
  if (lead.phone && doctorProfile?.twilio_account_sid && doctorProfile?.twilio_auth_token && doctorProfile?.twilio_phone_number) {
    try {
      const smsResult = await sendWelcomeSMS(lead, doctorProfile)
      communications.push({
        lead_id: lead.id,
        communication_type: 'welcome_sms',
        message: smsResult.message,
        status: smsResult.success ? 'sent' : 'failed',
        metadata: { twilio_sid: smsResult.sid || null }
      })
    } catch (error) {
      console.error('SMS sending failed:', error)
      communications.push({
        lead_id: lead.id,
        communication_type: 'welcome_sms',
        message: 'Failed to send welcome SMS',
        status: 'failed',
        metadata: { error: error.message }
      })
    }
  }

  // 2. Send welcome email to the lead
  if (lead.email) {
    try {
      const emailResult = await sendWelcomeEmail(lead, doctorProfile)
      communications.push({
        lead_id: lead.id,
        communication_type: 'welcome_email',
        message: emailResult.message,
        status: emailResult.success ? 'sent' : 'failed',
        metadata: { email_id: emailResult.id || null }
      })
    } catch (error) {
      console.error('Email sending failed:', error)
      communications.push({
        lead_id: lead.id,
        communication_type: 'welcome_email',
        message: 'Failed to send welcome email',
        status: 'failed',
        metadata: { error: error.message }
      })
    }
  }

  // 3. Send notification SMS to doctor
  if (doctorProfile?.phone && doctorProfile?.twilio_account_sid && doctorProfile?.twilio_auth_token && doctorProfile?.twilio_phone_number) {
    try {
      const doctorSmsResult = await sendDoctorNotificationSMS(lead, doctorProfile)
      communications.push({
        lead_id: lead.id,
        communication_type: 'doctor_notification_sms',
        message: doctorSmsResult.message,
        status: doctorSmsResult.success ? 'sent' : 'failed',
        metadata: { twilio_sid: doctorSmsResult.sid || null }
      })
    } catch (error) {
      console.error('Doctor SMS notification failed:', error)
      communications.push({
        lead_id: lead.id,
        communication_type: 'doctor_notification_sms',
        message: 'Failed to send doctor notification SMS',
        status: 'failed',
        metadata: { error: error.message }
      })
    }
  }

  // 4. Send notification email to doctor
  if (doctorProfile?.email) {
    try {
      const doctorEmailResult = await sendDoctorNotificationEmail(lead, doctorProfile)
      communications.push({
        lead_id: lead.id,
        communication_type: 'doctor_notification_email',
        message: doctorEmailResult.message,
        status: doctorEmailResult.success ? 'sent' : 'failed',
        metadata: { email_id: doctorEmailResult.id || null }
      })
    } catch (error) {
      console.error('Doctor email notification failed:', error)
      communications.push({
        lead_id: lead.id,
        communication_type: 'doctor_notification_email',
        message: 'Failed to send doctor notification email',
        status: 'failed',
        metadata: { error: error.message }
      })
    }
  }

  // Save all communication records
  if (communications.length > 0) {
    try {
      const { error: commError } = await supabaseAdmin
        .from('lead_communications')
        .insert(communications)
      
      if (commError) {
        console.error('Failed to save communication records:', commError)
      }
    } catch (error) {
      console.error('Error saving communication records:', error)
    }
  }
}

async function sendWelcomeSMS(lead: any, doctorProfile: any) {
  const message = `Hi ${lead.name}! Thank you for completing the ${lead.quiz_type} assessment. Your score: ${lead.score}. Dr. ${doctorProfile.last_name || 'Smith'} will review your results and contact you within 24 hours. Reply STOP to unsubscribe.`
  
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${doctorProfile.twilio_account_sid}/Messages.json`
  const authHeader = `Basic ${btoa(`${doctorProfile.twilio_account_sid}:${doctorProfile.twilio_auth_token}`)}`
  
  const body = new URLSearchParams({
    From: doctorProfile.twilio_phone_number,
    To: lead.phone,
    Body: message
  })

  const response = await fetch(twilioUrl, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Twilio SMS failed: ${response.status} - ${errorText}`)
  }

  const result = await response.json()
  return { 
    success: true, 
    message: 'Welcome SMS sent successfully',
    sid: result.sid 
  }
}

async function sendWelcomeEmail(lead: any, doctorProfile: any) {
  // For now, we'll simulate email sending
  // In production, integrate with SendGrid, Resend, or similar service
  const emailContent = {
    to: lead.email,
    subject: `Your ${lead.quiz_type} Assessment Results - ${doctorProfile.clinic_name || 'Medical Practice'}`,
    html: `
      <h2>Thank you for completing the ${lead.quiz_type} assessment!</h2>
      <p>Dear ${lead.name},</p>
      <p>We've received your assessment results with a score of <strong>${lead.score}</strong>.</p>
      <p>Dr. ${doctorProfile.last_name || 'Smith'} will review your results and contact you within 24 hours to discuss next steps.</p>
      <p>If you have any immediate questions, please don't hesitate to reach out.</p>
      <br>
      <p>Best regards,<br>The ${doctorProfile.clinic_name || 'Medical'} Team</p>
    `
  }

  // TODO: Integrate with actual email service
  // For now, return success (you'll need to implement this)
  return { 
    success: true, 
    message: 'Welcome email queued for sending',
    id: `email_${Date.now()}`
  }
}

async function sendDoctorNotificationSMS(lead: any, doctorProfile: any) {
  const message = `NEW LEAD: ${lead.name} completed ${lead.quiz_type} assessment with score ${lead.score}. Contact: ${lead.phone} | ${lead.email}`
  
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${doctorProfile.twilio_account_sid}/Messages.json`
  const authHeader = `Basic ${btoa(`${doctorProfile.twilio_account_sid}:${doctorProfile.twilio_auth_token}`)}`
  
  const body = new URLSearchParams({
    From: doctorProfile.twilio_phone_number,
    To: doctorProfile.phone,
    Body: message
  })

  const response = await fetch(twilioUrl, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Twilio SMS failed: ${response.status} - ${errorText}`)
  }

  const result = await response.json()
  return { 
    success: true, 
    message: 'Doctor notification SMS sent successfully',
    sid: result.sid 
  }
}

async function sendDoctorNotificationEmail(lead: any, doctorProfile: any) {
  // For now, we'll simulate email sending
  // In production, integrate with SendGrid, Resend, or similar service
  const emailContent = {
    to: doctorProfile.email,
    subject: `New Lead: ${lead.name} - ${lead.quiz_type} Assessment`,
    html: `
      <h2>New Lead Generated</h2>
      <p><strong>Patient Name:</strong> ${lead.name}</p>
      <p><strong>Assessment:</strong> ${lead.quiz_type}</p>
      <p><strong>Score:</strong> ${lead.score}</p>
      <p><strong>Contact Information:</strong></p>
      <ul>
        <li>Phone: ${lead.phone}</li>
        <li>Email: ${lead.email}</li>
      </ul>
      <p><strong>Submitted:</strong> ${new Date(lead.submitted_at).toLocaleString()}</p>
      <br>
      <p>Please contact this patient within 24 hours.</p>
    `
  }

  // TODO: Integrate with actual email service
  // For now, return success (you'll need to implement this)
  return { 
    success: true, 
    message: 'Doctor notification email queued for sending',
    id: `email_${Date.now()}`
  }
}