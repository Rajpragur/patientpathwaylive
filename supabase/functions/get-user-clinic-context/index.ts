import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Verify the requesting user
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's clinic memberships
    const { data: memberships, error: membershipsError } = await supabaseClient
      .from('clinic_members')
      .select(`
        *,
        clinic_profiles!inner(
          id,
          clinic_name,
          clinic_slug,
          description,
          phone,
          email,
          address,
          city,
          state,
          zip_code,
          country,
          logo_url,
          primary_color,
          secondary_color,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')

    if (membershipsError) {
      console.error('Error fetching clinic memberships:', membershipsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch clinic memberships' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!memberships || memberships.length === 0) {
      return new Response(
        JSON.stringify({ 
          hasClinics: false,
          memberships: [],
          primaryClinic: null,
          canCreateClinic: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get locations for each clinic
    const clinicIds = memberships.map(m => m.clinic_id)
    const { data: locations, error: locationsError } = await supabaseClient
      .from('clinic_locations')
      .select('*')
      .in('clinic_id', clinicIds)

    if (locationsError) {
      console.error('Error fetching clinic locations:', locationsError)
    }

    // Get member location assignments
    const memberIds = memberships.map(m => m.id)
    const { data: memberLocations, error: memberLocationsError } = await supabaseClient
      .from('clinic_member_locations')
      .select(`
        clinic_member_id,
        location_id,
        clinic_locations!inner(
          id,
          name,
          address,
          city,
          state,
          phone,
          email,
          is_primary
        )
      `)
      .in('clinic_member_id', memberIds)

    if (memberLocationsError) {
      console.error('Error fetching member locations:', memberLocationsError)
    }

    // Determine primary clinic (clinic where user is owner, or first clinic if no ownership)
    const ownedClinic = memberships.find(m => m.role === 'owner')
    const primaryClinic = ownedClinic || memberships[0]

    // Format the response
    const formattedMemberships = memberships.map(membership => {
      const memberLocationData = memberLocations?.filter(ml => ml.clinic_member_id === membership.id) || []
      const assignedLocations = memberLocationData.map(ml => ml.clinic_locations)

      return {
        id: membership.id,
        clinicId: membership.clinic_id,
        role: membership.role,
        permissions: membership.permissions,
        clinic: membership.clinic_profiles,
        assignedLocations,
        isPrimary: membership.clinic_id === primaryClinic.clinic_id
      }
    })

    // Get doctor profile for backward compatibility
    const { data: doctorProfile, error: profileError } = await supabaseClient
      .from('doctor_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching doctor profile:', profileError)
    }

    return new Response(
      JSON.stringify({
        hasClinics: true,
        memberships: formattedMemberships,
        primaryClinic: {
          id: primaryClinic.clinic_id,
          name: primaryClinic.clinic_profiles.clinic_name,
          slug: primaryClinic.clinic_profiles.clinic_slug,
          role: primaryClinic.role,
          permissions: primaryClinic.permissions
        },
        doctorProfile: doctorProfile || null,
        canCreateClinic: !ownedClinic // Can create clinic if not already an owner
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in get-user-clinic-context function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

serve(handler)

