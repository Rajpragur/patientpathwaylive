
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  BarChart3, 
  TrendingUp, 
  FileText, 
  User, 
  Settings, 
  LogOut,
  Calendar
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
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return 'Doctor';
  };

  return (
    <div 
      className={cn(
        "bg-white border-r h-full flex flex-col transition-all duration-300 ease-in-out",
        isHovered ? "w-64" : "w-16"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn("p-4 border-b", isHovered ? "px-6" : "px-4")}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">PP</span>
          </div>
          {isHovered && (
            <div>
              <h1 className="text-lg font-bold text-blue-600">Patient Pathway</h1>
              <p className="text-xs text-slate-500">Doctor Portal</p>
            </div>
          )}
        </div>
      </div>
      
      <nav className="flex-1 p-2 space-y-1">
        {topMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "default" : "ghost"}
              className={cn(
                "w-full transition-all duration-200",
                isHovered ? "justify-start gap-3 px-3" : "justify-center px-0",
                currentPage === item.id 
                  ? "bg-blue-500 text-white" 
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
              )}
              onClick={() => onPageChange(item.id)}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isHovered && <span className="text-sm">{item.label}</span>}
            </Button>
          );
        })}
      </nav>
      
      <div className="p-2 space-y-1 border-t">
        {bottomMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "default" : "ghost"}
              className={cn(
                "w-full transition-all duration-200",
                isHovered ? "justify-start gap-3 px-3" : "justify-center px-0",
                currentPage === item.id 
                  ? "bg-blue-500 text-white" 
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
              )}
              onClick={() => onPageChange(item.id)}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isHovered && <span className="text-sm">{item.label}</span>}
            </Button>
          );
        })}
        
        {isHovered && (
          <div className="px-3 py-2 text-xs text-slate-500 border-t mt-2 pt-2">
            {getDoctorName()}
          </div>
        )}
        
        <Button
          variant="ghost"
          className={cn(
            "w-full transition-all duration-200 text-slate-600 hover:text-red-600 hover:bg-red-50",
            isHovered ? "justify-start gap-3 px-3" : "justify-center px-0"
          )}
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isHovered && <span className="text-sm">Sign Out</span>}
        </Button>
      </div>
    </div>
  );
}
