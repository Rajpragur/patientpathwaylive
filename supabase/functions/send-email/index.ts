import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

interface EmailRequest {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
  attachments?: Array<{
    filename: string
    content: string
    contentType: string
  }>
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
    
    // Validate required fields
    if (!emailData.to || !emailData.subject || !emailData.html) {
      throw new Error('Missing required fields: to, subject, html')
    }

    // Use Resend for email sending (you can also use SendGrid, Mailgun, etc.)
    const emailResult = await sendEmailViaResend(emailData)

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

async function sendEmailViaResend(emailData: EmailRequest) {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  
  if (!RESEND_API_KEY) {
    // Fallback to console log for development
    console.log('Email would be sent:', {
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html
    })
    
    return {
      id: `dev_email_${Date.now()}`,
      message: 'Email logged (RESEND_API_KEY not configured)'
    }
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: emailData.from || 'noreply@yourdomain.com',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text || emailData.html.replace(/<[^>]*>/g, ''),
      reply_to: emailData.replyTo,
      attachments: emailData.attachments
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Resend API failed: ${response.status} - ${errorText}`)
  }

  const result = await response.json()
  return {
    id: result.id,
    message: 'Email sent via Resend'
  }
}
