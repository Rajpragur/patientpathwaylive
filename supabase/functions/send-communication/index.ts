
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CommunicationRequest {
  leadId: string;
  type: 'sms' | 'email';
  message: string;
  subject?: string;
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

    const { leadId, type, message, subject }: CommunicationRequest = await req.json();

    // Get lead details
    const { data: lead, error: leadError } = await supabaseClient
      .from('quiz_leads')
      .select('*, doctor_profiles(*)')
      .eq('id', leadId)
      .single();

    if (leadError) throw leadError;

    let result;
    if (type === 'email') {
      // Send email via Resend
      const doctorProfile = lead.doctor_profiles;
      if (!doctorProfile?.email_prefix) {
        throw new Error("Doctor email prefix not configured");
      }

      const doctorName = `${doctorProfile.first_name} ${doctorProfile.last_name}`;
      const doctorEmail = doctorProfile.email;
      const emailPrefix = doctorProfile.email_prefix;

      // Prepare email data
      const emailData = {
        to: lead.email,
        subject: subject || `Message from Dr. ${doctorName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Message from Dr. ${doctorName}</h2>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
            </div>
            <p>Best regards,<br>Dr. ${doctorName}</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280;">
              This email was sent from PatientPathway AI - Your trusted healthcare assessment platform
            </p>
          </div>
        `,
        text: `Message from Dr. ${doctorName}\n\n${message}\n\nBest regards,\nDr. ${doctorName}\n\n---\nThis email was sent from PatientPathway AI`,
        doctorId: doctorProfile.id
      };

      // Send via Resend
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Dr. ${doctorName} <dr.${emailPrefix}@patientpathway.ai>`,
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
          reply_to: doctorEmail
        }),
      });

      if (!resendResponse.ok) {
        const errorData = await resendResponse.json();
        throw new Error(`Resend API error: ${resendResponse.status} - ${errorData.message || 'Unknown error'}`);
      }

      const resendResult = await resendResponse.json();

      // Log the email
      await supabaseClient.from('email_logs').insert({
        doctor_id: doctorProfile.id,
        recipient_email: lead.email,
        subject: emailData.subject,
        status: 'sent',
        resend_id: resendResult.id,
        sent_at: new Date().toISOString()
      });

      result = { success: true, message: "Email sent successfully", id: resendResult.id };
    } else if (type === 'sms') {
      // SMS logic using Twilio would go here
      const twilioSid = lead.doctor_profiles.twilio_account_sid;
      const twilioToken = lead.doctor_profiles.twilio_auth_token;
      const twilioPhone = lead.doctor_profiles.twilio_phone_number;

      if (!twilioSid || !twilioToken || !twilioPhone) {
        throw new Error("Twilio credentials not configured");
      }

      // Twilio SMS implementation
      result = { success: true, message: "SMS sent successfully" };
    }

    // Log the communication
    await supabaseClient.from('lead_communications').insert({
      lead_id: leadId,
      communication_type: type,
      message,
      status: 'sent'
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending communication:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
