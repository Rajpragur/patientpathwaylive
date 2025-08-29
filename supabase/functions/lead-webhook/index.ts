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
    console.log('Processing lead webhook:', leadData)

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

    // Get doctor profile for webhook data
    const { data: doctorProfile, error: doctorError } = await supabaseAdmin
      .from('doctor_profiles')
      .select('*')
      .eq('id', leadData.doctor_id)
      .single()

    if (doctorError) {
      console.warn('Could not fetch doctor profile:', doctorError)
    }

    // Prepare webhook payload for n8n
    const webhookPayload = {
      lead: {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        quiz_type: lead.quiz_type,
        score: lead.score,
        submitted_at: lead.submitted_at,
        lead_source: leadData.lead_source || 'webhook',
        share_key: leadData.share_key || null
      },
      doctor: doctorProfile ? {
        id: doctorProfile.id,
        name: `${doctorProfile.first_name} ${doctorProfile.last_name}`,
        email: doctorProfile.email,
        phone: doctorProfile.phone,
        clinic_name: doctorProfile.clinic_name,
        location: doctorProfile.location
      } : null,
      quiz_data: leadData.answers || [],
      webhook_timestamp: new Date().toISOString()
    }

    // Return the webhook payload for n8n to process
    return new Response(
      JSON.stringify({
        success: true,
        data: webhookPayload,
        message: 'Lead webhook processed successfully',
        webhook_id: lead.id
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
    console.error('Webhook function error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Failed to process lead webhook'
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
