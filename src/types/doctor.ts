import { supabase } from '@/integrations/supabase/client';
export interface Location {
  city: string;
  address: string;
  phone: string;
}

export interface DoctorProfile {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  credentials: string;
  specialty?: string;
  locations: Location[];
  clinic_name?: string;
  phone?: string;
  testimonials: Array<{
    text: string;
    author: string;
    location: string;
  }>;
  website: string; // Make sure this is included
  avatar_url?: string;
  location?: string;
}

// Example API call to create/update doctor profile
const updateDoctorProfile = async (doctorData: Partial<DoctorProfile>) => {
  const { data, error } = await supabase
    .from('doctor_profiles')
    .upsert({
      id: doctorData.id,
      first_name: doctorData.first_name,
      last_name: doctorData.last_name,
      specialty: doctorData.specialty,
      clinic_name: doctorData.clinic_name,
      phone: doctorData.phone,
      location: doctorData.location,
      avatar_url: doctorData.avatar_url,
      website: doctorData.website // Include website field
    })
    .select();

  if (error) throw error;
  return data;
};