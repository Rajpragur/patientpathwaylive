import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
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

    const emailData: EmailRequest = await req.json()
    console.log('Processing email request:', { to: emailData.to, subject: emailData.subject })

    // Validate required fields
    if (!emailData.to || !emailData.subject || !emailData.html) {
      throw new Error('Missing required fields: to, subject, html')
    }

    // For now, we'll use a simple email service simulation
    // In production, integrate with SendGrid, Resend, or similar
    const emailResult = await sendEmail(emailData)

    // Log the email communication
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    try {
      await supabaseAdmin
        .from('lead_communications')
        .insert([{
          communication_type: 'email',
          message: `Email sent to ${emailData.to}: ${emailData.subject}`,
          status: emailResult.success ? 'sent' : 'failed',
          metadata: {
            to: emailData.to,
            subject: emailData.subject,
            email_id: emailResult.id,
            service: 'email_service'
          }
        }])
    } catch (dbError) {
      console.warn('Could not log email communication:', dbError)
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        data: emailResult,
        message: 'Email sent successfully'
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
    console.error('Email function error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Failed to send email'
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

async function sendEmail(emailData: EmailRequest) {
  // TODO: Integrate with actual email service
  // Options: SendGrid, Resend, Mailgun, AWS SES
  
  // For now, simulate email sending
  console.log('Sending email:', {
    to: emailData.to,
    subject: emailData.subject,
    html: emailData.html.substring(0, 100) + '...'
  })

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100))

  // Simulate success/failure (90% success rate for demo)
  const isSuccess = Math.random() > 0.1

  if (isSuccess) {
    return {
      success: true,
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: 'Email queued for sending',
      service: 'email_service'
    }
  } else {
    throw new Error('Email service temporarily unavailable')
  }
}

// Alternative implementation using SendGrid (uncomment when ready)
/*
async function sendEmailWithSendGrid(emailData: EmailRequest) {
  const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY')
  if (!sendgridApiKey) {
    throw new Error('SendGrid API key not configured')
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sendgridApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: emailData.to }],
        subject: emailData.subject
      }],
      from: { email: emailData.from || 'noreply@yourdomain.com' },
      content: [
        {
          type: 'text/html',
          value: emailData.html
        }
      ]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SendGrid error: ${response.status} - ${error}`)
  }

  const result = await response.json()
  return {
    success: true,
    id: result.id || `sg_${Date.now()}`,
    message: 'Email sent via SendGrid',
    service: 'sendgrid'
  }
}
*/
