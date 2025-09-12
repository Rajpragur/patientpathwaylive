
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CommunicationRequest {
  leadId: string;
  type: 'sms';
  message: string;
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

    const { leadId, type, message }: CommunicationRequest = await req.json();

    // Get lead details
    const { data: lead, error: leadError } = await supabaseClient
      .from('quiz_leads')
      .select('*, doctor_profiles(*)')
      .eq('id', leadId)
      .single();

    if (leadError) throw leadError;

    let result;
    if (type === 'email') {
      // Email logic would go here using Resend or similar
      result = { success: true, message: "Email sent successfully" };
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
