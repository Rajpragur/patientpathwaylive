import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify the user's JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse the request body
    const { teamMemberId, doctorId } = await req.json()

    if (!teamMemberId || !doctorId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify that the calling user is the doctor who owns this team member
    const { data: doctorProfile, error: doctorError } = await supabaseClient
      .from('doctor_profiles')
      .select('*')
      .eq('id', doctorId)
      .eq('user_id', user.id)
      .single()

    if (doctorError || !doctorProfile) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized: You can only remove team members from your own clinic' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the team member record
    const { data: teamMember, error: teamError } = await supabaseClient
      .from('team_members')
      .select('*')
      .eq('id', teamMemberId)
      .eq('doctor_id', doctorId)
      .single()

    if (teamError || !teamMember) {
      return new Response(
        JSON.stringify({ success: false, error: 'Team member not found or does not belong to your clinic' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let deletedDoctorProfileId = null
    let deletedTeamMemberId = null

    // Step 1: Delete the doctor profile if it exists
    if (teamMember.linked_user_id) {
      const { data: deletedProfile, error: profileError } = await supabaseClient
        .from('doctor_profiles')
        .delete()
        .eq('user_id', teamMember.linked_user_id)
        .select('id')
        .single()

      if (profileError) {
        console.error('Error deleting doctor profile:', profileError)
        // Continue with team member deletion even if profile deletion fails
      } else {
        deletedDoctorProfileId = deletedProfile?.id
        console.log('Successfully deleted doctor profile:', deletedDoctorProfileId)
      }
    }

    // Step 2: Delete the team member record
    const { data: deletedTeamMember, error: teamDeleteError } = await supabaseClient
      .from('team_members')
      .delete()
      .eq('id', teamMemberId)
      .select('id')
      .single()

    if (teamDeleteError) {
      console.error('Error deleting team member:', teamDeleteError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to delete team member record' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    deletedTeamMemberId = deletedTeamMember?.id
    console.log('Successfully deleted team member:', deletedTeamMemberId)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Team member removed successfully',
        deletedTeamMemberId,
        deletedDoctorProfileId,
        linkedUserId: teamMember.linked_user_id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in remove-team-member function:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
