import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LinkClinicMemberRequest {
  invitationToken: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { invitationToken, userId }: LinkClinicMemberRequest = await req.json()

    if (!invitationToken || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: invitationToken and userId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Find the invitation
    const { data: invitation, error: invitationError } = await supabaseClient
      .from('clinic_members')
      .select(`
        *,
        clinic_profiles!inner(
          id,
          clinic_name,
          clinic_slug
        )
      `)
      .eq('invitation_token', invitationToken)
      .eq('status', 'pending')
      .single()

    if (invitationError || !invitation) {
      console.error('Error finding invitation:', invitationError)
      return new Response(
        JSON.stringify({ error: 'Invalid or expired invitation token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if invitation has expired
    if (new Date(invitation.token_expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Invitation has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user already has an account with this email
    const { data: existingUser, error: userError } = await supabaseClient.auth.admin.getUserById(userId)
    
    if (userError) {
      console.error('Error fetching user:', userError)
      return new Response(
        JSON.stringify({ error: 'Invalid user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (existingUser.user?.email?.toLowerCase() !== invitation.email.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: 'Email mismatch - user email does not match invitation email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is already a member of this clinic
    const { data: existingMember, error: memberCheckError } = await supabaseClient
      .from('clinic_members')
      .select('id, status')
      .eq('clinic_id', invitation.clinic_id)
      .eq('user_id', userId)
      .single()

    if (existingMember) {
      if (existingMember.status === 'active') {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'User is already a member of this clinic',
            clinicId: invitation.clinic_id,
            clinicName: invitation.clinic_profiles.clinic_name
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        // Update existing pending invitation
        const { error: updateError } = await supabaseClient
          .from('clinic_members')
          .update({
            user_id: userId,
            status: 'active',
            accepted_at: new Date().toISOString(),
            invitation_token: null,
            token_expires_at: null
          })
          .eq('id', existingMember.id)

        if (updateError) {
          console.error('Error updating existing member:', updateError)
          return new Response(
            JSON.stringify({ error: 'Failed to link user to clinic' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Successfully linked to existing clinic invitation',
            clinicId: invitation.clinic_id,
            clinicName: invitation.clinic_profiles.clinic_name
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Update the invitation to link the user
    const { error: updateError } = await supabaseClient
      .from('clinic_members')
      .update({
        user_id: userId,
        status: 'active',
        accepted_at: new Date().toISOString(),
        invitation_token: null,
        token_expires_at: null
      })
      .eq('id', invitation.id)

    if (updateError) {
      console.error('Error linking clinic member:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to link user to clinic' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create a doctor profile for the new team member if they don't have one
    // This maintains backward compatibility with existing code
    const { data: existingProfile, error: profileCheckError } = await supabaseClient
      .from('doctor_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!existingProfile && profileCheckError?.code === 'PGRST116') {
      // No profile exists, create one linked to the clinic
      const { error: profileCreateError } = await supabaseClient
        .from('doctor_profiles')
        .insert([{
          user_id: userId,
          clinic_id: invitation.clinic_id,
          first_name: invitation.first_name || 'Team',
          last_name: invitation.last_name || 'Member',
          email: invitation.email,
          doctor_id: Math.floor(100000 + Math.random() * 900000).toString()
        }])

      if (profileCreateError) {
        console.error('Error creating doctor profile:', profileCreateError)
        // Don't fail the operation for profile creation errors
      }
    }

    // Send welcome email
    const { error: emailError } = await supabaseClient.functions.invoke('send-resend-email', {
      body: {
        to: invitation.email,
        subject: `Welcome to ${invitation.clinic_profiles.clinic_name}!`,
        template: 'clinic-welcome',
        templateData: {
          clinicName: invitation.clinic_profiles.clinic_name,
          memberName: `${invitation.first_name || ''} ${invitation.last_name || ''}`.trim() || 'Team Member',
          role: invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1),
          portalUrl: `${Deno.env.get('SITE_URL')}/portal`
        }
      }
    })

    if (emailError) {
      console.error('Error sending welcome email:', emailError)
      // Don't fail the operation for email errors
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Successfully joined the clinic',
        clinicId: invitation.clinic_id,
        clinicName: invitation.clinic_profiles.clinic_name,
        role: invitation.role
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in link-clinic-member function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

serve(handler)

