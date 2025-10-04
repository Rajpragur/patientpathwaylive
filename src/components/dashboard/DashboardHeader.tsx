import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationDropdown } from './NotificationDropdown';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { getOrCreateDoctorProfile, DoctorProfile } from '@/lib/profileUtils';

export function DashboardHeader() {
  const { user } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTeamMember, setIsTeamMember] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDoctorProfile();
    }
  }, [user]);

  const fetchDoctorProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // First, get the current user's profile to check if they're staff/manager
      const { data: userProfiles, error: fetchError } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Error fetching doctor profiles:', fetchError);
        setError('Failed to fetch doctor profile');
        return;
      }

      if (!userProfiles || userProfiles.length === 0) {
        // No profile exists, create one (regular doctor)
        const profile = await getOrCreateDoctorProfile(user.id, user.email || undefined);
        setDoctorProfile(profile);
        setIsTeamMember(false);
        return;
      }

      const userProfile = userProfiles[0];
      
      // Check if user is staff or manager
      if (userProfile.is_staff || userProfile.is_manager) {
        setIsTeamMember(true);
        
        // If team member, fetch the main doctor's profile using doctor_id_clinic
        if (userProfile.doctor_id_clinic) {
          const { data: mainDoctorProfile, error: mainDoctorError } = await supabase
            .from('doctor_profiles')
            .select('*')
            .eq('id', userProfile.doctor_id_clinic)
            .single();

          if (mainDoctorError) {
            console.error('Error fetching main doctor profile:', mainDoctorError);
            // Fallback to user's own profile
            setDoctorProfile(userProfile);
          } else {
            // Display main doctor's profile info
            setDoctorProfile(mainDoctorProfile);
          }
        } else {
          // No clinic link, use user's own profile
          setDoctorProfile(userProfile);
        }
      } else {
        // Regular doctor, use their own profile
        setIsTeamMember(false);
        setDoctorProfile(userProfile);
      }
    } catch (error) {
      console.error('Error in fetchDoctorProfile:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

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

  const getDisplayName = () => {
    if (isTeamMember) {
      // For team members, show "Dr. [Main Doctor Name]" with team member indicator
      return `Dr. ${getDoctorName()}`;
    } else {
      // For regular doctors, show "Dr. [Doctor Name]"
      return `Dr. ${getDoctorName()}`;
    }
  };

  const getDisplayTitle = () => {
    if (isTeamMember) {
      return 'Team Member'; // Could be enhanced to show "Staff" or "Manager" based on role
    } else {
      return doctorProfile?.specialty || 'Medical Professional';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 shadow-sm">
      <div className="flex flex-col space-y-4">
        {/* Mobile Layout (< md) */}
        <div className="md:hidden">
          {/* Top row: Profile and Notifications */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-[#0E7C9D]/20">
                {doctorProfile?.avatar_url ? (
                  <AvatarImage 
                    src={doctorProfile.avatar_url} 
                    alt={getDisplayName()}
                    onError={(e) => {
                      console.error('Avatar image failed to load:', e);
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : null}
                <AvatarFallback className="bg-[#0E7C9D] text-white text-xs font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {getDisplayName()}
                </h2>
                <p className="text-xs text-gray-500">
                  {getDisplayTitle()}
                </p>
              </div>
            </div>
            <NotificationDropdown />
          </div>
          
          {/* Bottom row: Logo centered */}
          <div className="flex flex-col items-center">
            <img 
              src="/patient-pathway-logo.jpeg" 
              alt="Patient Pathway Logo"
              className="w-32 h-auto object-contain mb-1"
            />
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#0E7C9D] bg-clip-text text-transparent">
              Patient Pathway
            </h1>
            <p className="text-xs text-gray-600 text-center">Medical Assessment Management System</p>
          </div>
        </div>

        {/* Tablet Layout (md to lg) */}
        <div className="hidden md:flex lg:hidden items-center justify-between">
          {/* Left: User Profile */}
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 ring-2 ring-[#0E7C9D]/20">
              {doctorProfile?.avatar_url ? (
                <AvatarImage 
                  src={doctorProfile.avatar_url} 
                  alt={`Dr. ${getDoctorName()}`}
                  onError={(e) => {
                    console.error('Avatar image failed to load:', e);
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : null}
              <AvatarFallback className="bg-[#0E7C9D] text-white text-sm font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {getDisplayName()}
                </h2>
                <p className="text-sm text-gray-500">
                  {getDisplayTitle()}
                </p>
            </div>
          </div>
          
          {/* Center: Logo */}
          <div className="flex flex-col items-center">
            <img 
              src="/patient-pathway-logo.jpeg" 
              alt="Patient Pathway Logo"
              className="w-36 h-auto object-contain mb-1"
            />
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#0E7C9D] bg-clip-text text-transparent">
              Patient Pathway
            </h1>
            <p className="text-xs text-gray-600">Medical Assessment Management System</p>
          </div>
          
          {/* Right: Notifications */}
          <div className="flex items-center">
            <NotificationDropdown />
          </div>
        </div>

        {/* Desktop Layout (lg+) - Original layout */}
        <div className="hidden lg:flex items-center justify-between">
          {/* Left: User Profile */}
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 ring-2 ring-[#0E7C9D]/20">
              {doctorProfile?.avatar_url ? (
                <AvatarImage 
                  src={doctorProfile.avatar_url} 
                  alt={`Dr. ${getDoctorName()}`}
                  onError={(e) => {
                    console.error('Avatar image failed to load:', e);
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : null}
              <AvatarFallback className="bg-[#0E7C9D] text-white text-sm font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {getDisplayName()}
                </h2>
                <p className="text-sm text-gray-500">
                  {getDisplayTitle()}
                </p>
            </div>
          </div>
          
          {/* Center: Logo */}
          <div className="flex flex-col items-center flex-1 max-w-md">
            <img 
              src="/patient-pathway-logo.jpeg" 
              alt="Patient Pathway Logo"
              className="w-40 h-auto object-contain mb-1"
            />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#0E7C9D] bg-clip-text text-transparent">
              Patient Pathway
            </h1>
            <p className="text-xs text-gray-600">Medical Assessment Management System</p>
          </div>
          
          {/* Right: Notifications */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <NotificationDropdown />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}