
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { NotificationDropdown } from './NotificationDropdown';

export function DashboardHeader() {
  const { user } = useAuth();

  const getInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'DR';
  };

  const getDoctorName = () => {
    if (user?.email) {
      const name = user.email.split('@')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return 'Doctor';
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-600">
            Patient Pathway Portal
          </h1>
          <p className="text-sm text-gray-600">Medical Assessment Management System</p>
        </div>
        
        <div className="flex items-center gap-4">
          <NotificationDropdown />
          
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-600 text-white text-xs">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-700">
              Dr. {getDoctorName()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
