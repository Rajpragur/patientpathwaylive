import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationDropdown } from './NotificationDropdown';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Megaphone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketingTicker } from './MarketingTicker';
import { getOrCreateDoctorProfile, DoctorProfile } from '@/lib/profileUtils';

export function DashboardHeader() {
  const { user } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMarketingTicker, setShowMarketingTicker] = useState(true);

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
      
      const profile = await getOrCreateDoctorProfile(user.id, user.email || undefined);
      
      if (profile) {
        setDoctorProfile(profile);
      } else {
        setError('Failed to fetch or create doctor profile');
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
                    alt={`Dr. ${getDoctorName()}`}
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
                  Dr. {getDoctorName()}
                </h2>
                <p className="text-xs text-gray-500">
                  {doctorProfile?.specialty || 'Medical Professional'}
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
                Dr. {getDoctorName()}
              </h2>
              <p className="text-sm text-gray-500">
                {doctorProfile?.specialty || 'Medical Professional'}
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