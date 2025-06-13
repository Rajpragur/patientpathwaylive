
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TwilioTestRequest {
  account_sid: string;
  auth_token: string;
  phone_number: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { account_sid, auth_token, phone_number }: TwilioTestRequest = await req.json();

    // Test Twilio connection by making a request to validate credentials
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${account_sid}.json`;
    const authHeader = `Basic ${btoa(`${account_sid}:${auth_token}`)}`;

    const response = await fetch(twilioUrl, {
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      throw new Error('Invalid Twilio credentials');
    }

    const accountInfo = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Twilio connection successful',
        account_status: accountInfo.status,
        phone_number: phone_number
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error testing Twilio connection:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to test Twilio connection' 
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
