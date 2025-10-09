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
    console.log('=== link-team-member function started ===')
    
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

    const requestBody = await req.json()
    console.log('Request body received:', {
      hasInvitationToken: !!requestBody.invitationToken,
      hasUserId: !!requestBody.userId,
      hasFirstName: !!requestBody.firstName,
      hasLastName: !!requestBody.lastName,
      hasEmail: !!requestBody.email,
      invitationToken: requestBody.invitationToken?.substring(0, 8) + '...',
      userId: requestBody.userId?.substring(0, 8) + '...'
    })

    const { invitationToken, userId, firstName, lastName, email } = requestBody

    if (!invitationToken || !userId) {
      console.error('Missing required fields:', { invitationToken: !!invitationToken, userId: !!userId })
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          details: {
            hasInvitationToken: !!invitationToken,
            hasUserId: !!userId
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Looking up team member with invitation token:', invitationToken)

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
          logo_url,
          providers
        )
      `)
      .eq('invitation_token', invitationToken)
      .single()

    if (fetchError || !teamMemberRecord) {
      console.error('Error fetching team member record:', fetchError)
      console.error('Invitation token used:', invitationToken)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid invitation token',
          details: fetchError?.message,
          token: invitationToken
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const doctorProfile = teamMemberRecord.doctor_profiles

    console.log('Team member record:', {
      id: teamMemberRecord.id,
      role: teamMemberRecord.role,
      invitation_token: teamMemberRecord.invitation_token,
      doctor_id: teamMemberRecord.doctor_id
    })

    console.log('Doctor profile data:', {
      id: doctorProfile.id,
      doctor_id: doctorProfile.doctor_id,
      clinic_name: doctorProfile.clinic_name,
      location: doctorProfile.location
    })

    // Update the team member record - use user_id instead of linked_user_id
    const { error: linkError } = await supabaseClient
      .from('team_members')
      .update({
        user_id: userId,
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

      // First, check if a doctor profile already exists for this user
      const { data: existingProfile, error: checkError } = await supabaseClient
        .from('doctor_profiles')
        .select('id, user_id, email')
        .eq('user_id', userId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking existing profile:', checkError)
        return new Response(
          JSON.stringify({ error: 'Failed to check existing profile' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      let profileError = null

      if (existingProfile) {
        // Update existing profile
        console.log('Updating existing doctor profile for team member:', existingProfile.id)
        
        const updateData = {
          first_name: firstName || 'Team',
          last_name: lastName || 'Member',
          email: email,
          doctor_id: doctorProfile.doctor_id,
          clinic_name: doctorProfile.clinic_name,
          location: doctorProfile.location,
          phone: doctorProfile.phone,
          logo_url: doctorProfile.logo_url,
          providers: doctorProfile.providers,
          access_control: true
        }
        
        console.log('Update data for team member profile:', updateData)
        
        const { error: updateError } = await supabaseClient
          .from('doctor_profiles')
          .update(updateData)
          .eq('id', existingProfile.id)

        profileError = updateError
      } else {
        // Create new profile
        console.log('Creating new doctor profile for team member')
        
        const insertData = {
          user_id: userId,
          first_name: firstName || 'Team',
          last_name: lastName || 'Member',
          email: email,
          doctor_id: doctorProfile.doctor_id,
          clinic_name: doctorProfile.clinic_name,
          location: doctorProfile.location,
          phone: doctorProfile.phone,
          logo_url: doctorProfile.logo_url,
          providers: doctorProfile.providers,
          access_control: true
        }
        
        console.log('Insert data for team member profile:', insertData)
        
        const { error: insertError } = await supabaseClient
          .from('doctor_profiles')
          .insert([insertData])

        profileError = insertError
      }

    if (profileError) {
      console.error('Error creating doctor profile for team member:', profileError)
      return new Response(
        JSON.stringify({ error: 'Failed to create team member profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Team member linked successfully:', {
      userId,
      invitationToken,
      role: teamMemberRecord.role,
      doctorProfileId: doctorProfile.id
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Team member linked successfully',
        data: {
          role: teamMemberRecord.role,
          doctorProfileId: doctorProfile.id
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('=== ERROR in link-team-member function ===')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('Full error:', JSON.stringify(error, null, 2))
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        errorType: error.constructor.name
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})