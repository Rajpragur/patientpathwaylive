import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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

    const { invitationToken, userId, firstName, lastName, email } = await req.json()

    if (!invitationToken || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the team member record
    const { data: teamMemberRecord, error: fetchError } = await supabaseClient
      .from('team_members')
      .select(`
        *,
        doctor_profiles!inner(
          id,
          doctor_id,
          clinic_name,
          location,
          phone,
          mobile,
          logo_url,
          providers
        )
      `)
      .eq('invitation_token', invitationToken)
      .single()

    if (fetchError || !teamMemberRecord) {
      console.error('Error fetching team member record:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Invalid invitation token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const doctorProfile = teamMemberRecord.doctor_profiles

    // Update the team member record
    const { error: linkError } = await supabaseClient
      .from('team_members')
      .update({
        linked_user_id: userId,
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('invitation_token', invitationToken)

    if (linkError) {
      console.error('Error linking team member:', linkError)
      return new Response(
        JSON.stringify({ error: 'Failed to link team member' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

      // Create a doctor profile for the team member (with conflict handling)
      const { error: profileError } = await supabaseClient
        .from('doctor_profiles')
        .upsert([{
          user_id: userId,
          first_name: firstName || 'Team',
          last_name: lastName || 'Member',
          email: email,
          doctor_id: doctorProfile.doctor_id,
          clinic_name: doctorProfile.clinic_name,
          location: doctorProfile.location,
          phone: doctorProfile.phone,
          mobile: doctorProfile.mobile,
          logo_url: doctorProfile.logo_url,
          providers: doctorProfile.providers,
          access_control: true,
          // Set team flags based on role
          is_staff: teamMemberRecord.role === 'staff',
          is_manager: teamMemberRecord.role === 'manager',
          doctor_id_clinic: doctorProfile.id.toString() // Ensure it's TEXT
        }], {
          onConflict: 'email', // Use email as the conflict resolution key
          ignoreDuplicates: false // Update if exists
        })

    if (profileError) {
      console.error('Error creating doctor profile for team member:', profileError)
      return new Response(
        JSON.stringify({ error: 'Failed to create team member profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Team member linked successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in link-team-member function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})