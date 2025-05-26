
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationDropdown } from './NotificationDropdown';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function DashboardHeader() {
  const { user } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState<any>(null);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('doctor_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setDoctorProfile(data);
        }
      }
    };
    
    fetchDoctorProfile();
  }, [user]);

  const getInitials = () => {
    if (doctorProfile?.first_name && doctorProfile?.last_name) {
      return (doctorProfile.first_name.charAt(0) + doctorProfile.last_name.charAt(0)).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'DR';
  };

  const getDoctorName = () => {
    if (doctorProfile?.first_name && doctorProfile?.last_name) {
      return `${doctorProfile.first_name} ${doctorProfile.last_name}`;
    }
    if (user?.email) {
      const name = user.email.split('@')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return 'Doctor';
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="w-32"></div>
        
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg">
            <img 
              src="/lovable-uploads/6b38df79-5ad8-494b-83ed-7dba6c54d4b1.png" 
              alt="Patient Pathway"
              className="w-16 h-16 object-contain"
            />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#0E7C9D]">
              Patient Pathway Portal
            </h1>
            <p className="text-sm text-gray-600">Medical Assessment Management System</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <NotificationDropdown />
          
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 ring-2 ring-[#0E7C9D]/20">
              <AvatarImage src={doctorProfile?.avatar_url || "/placeholder-doctor.jpg"} />
              <AvatarFallback className="bg-[#0E7C9D] text-white text-sm">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-700">
              {getDoctorName()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
