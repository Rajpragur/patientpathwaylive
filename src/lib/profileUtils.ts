import { supabase } from '@/integrations/supabase/client';

export interface DoctorProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  doctor_id: string | null;
  created_at: string;
  updated_at: string;
  location?: string | null;
  specialty?: string | null;
  phone?: string | null;
  clinic_name?: string | null;
  logo_url?: string | null;
  avatar_url?: string | null;
  website?: string | null;
  email_prefix?: string | null;
  access_control?: boolean;
}

/**
 * Gets or creates a doctor profile for the given user
 * Ensures only one profile exists per user
 */
export async function getOrCreateDoctorProfile(userId: string, userEmail?: string): Promise<DoctorProfile | null> {
  try {
    // First, try to get existing profile
    const { data: existingProfiles, error: fetchError } = await supabase
      .from('doctor_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching doctor profiles:', fetchError);
      return null;
    }

    // If profiles exist, return the first one and clean up duplicates
    if (existingProfiles && existingProfiles.length > 0) {
      const primaryProfile = existingProfiles[0];
      
      // If there are duplicates, clean them up
      if (existingProfiles.length > 1) {
        console.log(`Found ${existingProfiles.length} profiles for user ${userId}, cleaning up duplicates...`);
        
        // Delete all profiles except the first one
        const profilesToDelete = existingProfiles.slice(1);
        for (const profile of profilesToDelete) {
          const { error: deleteError } = await supabase
            .from('doctor_profiles')
            .delete()
            .eq('id', profile.id);
          
          if (deleteError) {
            console.error(`Error deleting duplicate profile ${profile.id}:`, deleteError);
          } else {
            console.log(`Deleted duplicate profile ${profile.id}`);
          }
        }
      }
      
      return primaryProfile;
    }

    // No profile exists, create a new one
    console.log(`No profile found for user ${userId}, creating new profile...`);
    
    const newProfile = {
      user_id: userId,
      first_name: 'Doctor',
      last_name: 'User',
      email: userEmail || '',
      doctor_id: Math.floor(100000 + Math.random() * 900000).toString(),
      access_control: true
    };

    const { data: createdProfile, error: createError } = await supabase
      .from('doctor_profiles')
      .insert([newProfile])
      .select()
      .single();

    if (createError) {
      console.error('Error creating doctor profile:', createError);
      return null;
    }

    console.log('Created new doctor profile:', createdProfile.id);
    return createdProfile;

  } catch (error) {
    console.error('Unexpected error in getOrCreateDoctorProfile:', error);
    return null;
  }
}

/**
 * Gets the doctor profile for a user (doesn't create if doesn't exist)
 */
export async function getDoctorProfile(userId: string): Promise<DoctorProfile | null> {
  try {
    const { data: profiles, error } = await supabase
      .from('doctor_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1);

    if (error) {
      console.error('Error fetching doctor profile:', error);
      return null;
    }

    return profiles && profiles.length > 0 ? profiles[0] : null;
  } catch (error) {
    console.error('Unexpected error in getDoctorProfile:', error);
    return null;
  }
}
