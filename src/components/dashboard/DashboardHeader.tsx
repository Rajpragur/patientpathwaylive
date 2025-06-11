
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
        {/* Left: User Profile */}
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 ring-2 ring-[#0E7C9D]/20">
            <AvatarImage src={doctorProfile?.avatar_url || "/placeholder-doctor.jpg"} />
            <AvatarFallback className="bg-[#0E7C9D] text-white text-sm font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Dr. {getDoctorName()}
            </h2>
            <p className="text-sm text-gray-500">
              {doctorProfile?.specialty || 'Medical Professional'}
            </p>
          </div>
        </div>
        
        {/* Center: Logo */}
        <div className="flex flex-col items-center flex-1 max-w-md">
          <img 
            src="/patient-pathway-logo.jpeg" 
            alt="Patient Pathway Logo"
            className="w-20 h-20 object-contain mb-1"
          />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#0E7C9D] bg-clip-text text-transparent">
            Patient Pathway
          </h1>
          <p className="text-xs text-gray-600">Medical Assessment Management System</p>
        </div>
        
        {/* Right: Notifications */}
        <div className="flex items-center gap-4">
          <NotificationDropdown />
        </div>
      </div>
    </header>
  );
}
