
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  LayoutDashboard, 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Calendar,
  User, 
  Settings, 
  LogOut,
  HelpCircle
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const { signOut, user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const topMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'quizzes', label: 'Quiz Management', icon: FileText },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
  ];

  const bottomMenuItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getDoctorName = () => {
    if (user?.email) {
      const name = user.email.split('@')[0];
      return `Dr. ${name.charAt(0).toUpperCase() + name.slice(1)}`;
    }
    return 'Doctor';
  };

  const getInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'DR';
  };

  return (
    <div 
      className={cn(
        "bg-white border-r border-gray-200 h-full flex flex-col transition-all duration-300 ease-in-out shadow-sm",
        isHovered ? "w-56" : "w-16"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Section */}
      <div className={cn("p-3 border-b border-gray-100", isHovered ? "px-4" : "px-3")}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0E7C9D] to-[#FD904B] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <img 
              src="/lovable-uploads/6b38df79-5ad8-494b-83ed-7dba6c54d4b1.png" 
              alt="Patient Pathway"
              className="w-6 h-6 object-contain"
            />
          </div>
          {isHovered && (
            <div className="animate-fade-in">
              <h1 className="text-sm font-bold text-[#0E7C9D]">Patient Pathway</h1>
            </div>
          )}
        </div>
      </div>
      
      {/* Top Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {topMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "default" : "ghost"}
              className={cn(
                "w-full transition-all duration-200 relative group rounded-xl",
                isHovered ? "justify-start gap-3 px-3 h-11" : "justify-center px-0 h-11 w-12 mx-auto",
                currentPage === item.id 
                  ? "bg-[#0E7C9D] text-white shadow-md hover:bg-[#0E7C9D]/90" 
                  : "text-slate-600 hover:text-[#0E7C9D] hover:bg-slate-50"
              )}
              onClick={() => onPageChange(item.id)}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isHovered && <span className="text-sm animate-fade-in">{item.label}</span>}
              {!isHovered && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Button>
          );
        })}
      </nav>
      
      {/* Bottom Section */}
      <div className="p-2 space-y-1 border-t border-gray-100">
        {bottomMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "default" : "ghost"}
              className={cn(
                "w-full transition-all duration-200 relative group rounded-xl",
                isHovered ? "justify-start gap-3 px-3 h-11" : "justify-center px-0 h-11 w-12 mx-auto",
                currentPage === item.id 
                  ? "bg-[#0E7C9D] text-white shadow-md hover:bg-[#0E7C9D]/90" 
                  : "text-slate-600 hover:text-[#0E7C9D] hover:bg-slate-50"
              )}
              onClick={() => onPageChange(item.id)}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isHovered && <span className="text-sm animate-fade-in">{item.label}</span>}
              {!isHovered && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Button>
          );
        })}
        
        {/* Profile Section */}
        {isHovered && (
          <div className="px-3 py-3 border-t border-gray-100 mt-2 animate-fade-in">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-doctor.jpg" />
                <AvatarFallback className="bg-[#0E7C9D] text-white text-xs">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {getDoctorName()}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Sign Out Button */}
        <Button
          variant="ghost"
          className={cn(
            "w-full transition-all duration-200 relative group rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50",
            isHovered ? "justify-start gap-3 px-3 h-11" : "justify-center px-0 h-11 w-12 mx-auto"
          )}
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isHovered && <span className="text-sm animate-fade-in">Sign Out</span>}
          {!isHovered && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              Sign Out
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}
