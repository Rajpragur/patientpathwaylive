import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ResendEmailRequest {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  doctorId?: string;
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

    const { to, subject, html, text, from, replyTo, cc, bcc, doctorId }: ResendEmailRequest = await req.json();

    // Get Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    // If doctorId is provided, get doctor's email prefix
    let doctorEmailPrefix = null;
    let doctorName = null;
    let doctorEmail = null;

    if (doctorId) {
      const { data: doctorProfile, error: doctorError } = await supabaseClient
        .from('doctor_profiles')
        .select('email_prefix, first_name, last_name, email')
        .eq('id', doctorId)
        .single();

      if (doctorError) {
        console.error('Error fetching doctor profile:', doctorError);
      } else if (doctorProfile) {
        doctorEmailPrefix = doctorProfile.email_prefix;
        doctorName = `${doctorProfile.first_name} ${doctorProfile.last_name}`;
        doctorEmail = doctorProfile.email;
      }
    }

    // Prepare email data
    const emailData: any = {
      from: from || (doctorEmailPrefix ? `dr.${doctorEmailPrefix}@patientpathway.ai` : 'noreply@patientpathway.ai'),
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
      reply_to: replyTo || doctorEmail || 'support@patientpathway.ai',
    };

    if (cc) emailData.cc = cc;
    if (bcc) emailData.bcc = bcc;

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json();
      throw new Error(`Resend API error: ${resendResponse.status} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await resendResponse.json();

    // Log the email in the database
    await supabaseClient.from('email_logs').insert({
      doctor_id: doctorId,
      recipient_email: Array.isArray(to) ? to.join(', ') : to,
      subject,
      status: 'sent',
      resend_id: result.id,
      sent_at: new Date().toISOString()
    });

    return new Response(JSON.stringify({
      success: true,
      id: result.id,
      message: 'Email sent successfully via Resend'
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email via Resend:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
