import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

export interface Location {
  city: string;
  address: string;
  phone: string;
}

export interface DoctorProfile {
  id: string;
  name: string;
  credentials: string;
  website?: string;
  phone?: string;
  email?: string;
  clinic_name?: string;
  location?: Array<{
    city: string;
    address: string;
    phone: string;
  }>;
  testimonials?: Array<{
    text: string;
    location: string;
    author: string;
  }>;
}

// In EnhancedChatBot.tsx, update the doctor state
const [doctor, setDoctor] = useState<DoctorProfile | null>(null);

// Update doctor fetching effect
useEffect(() => {
  const fetchDoctorInfo = async () => {
    if (!doctor.id) return;
    
    try {
      console.log('🏥 Fetching doctor info:', doctor.id);
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select('id, name, credentials, website, phone, email, clinic_name')
        .eq('id', doctor.id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        console.log('✅ Doctor data found:', data);
        setDoctor(data);
      } else {
        console.log('❌ No doctor data found');
      }
    } catch (error) {
      console.error('Error fetching doctor:', error);
    }
  };

  if (doctor.id) {
    fetchDoctorInfo();
  }
}, [doctor.id]);