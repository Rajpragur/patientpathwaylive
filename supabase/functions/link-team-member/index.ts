import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LinkTeamMemberRequest {
  invitationToken: string;
  userId: string;
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

    const { invitationToken, userId }: LinkTeamMemberRequest = await req.json();

    if (!invitationToken || !userId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invitation token and user ID are required'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Call the database function to link team member
    const { data, error } = await supabaseClient.rpc('link_team_member_to_doctor', {
      p_invitation_token: invitationToken,
      p_user_id: userId
    });

    if (error) {
      console.error('Error linking team member:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message || 'Failed to link team member'
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!data.success) {
      return new Response(JSON.stringify({
        success: false,
        error: data.error || 'Failed to link team member'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: data.message,
      doctor_profile_id: data.doctor_profile_id,
      team_member_id: data.team_member_id
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in link-team-member function:", error);
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
