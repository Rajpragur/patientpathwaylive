
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  TestTube,
  Settings,
  HelpCircle,
  User,
  Calendar,
  Share2,
  LogOut
} from "lucide-react";

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const { signOut } = useAuth();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview and leads'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Performance metrics'
    },
    {
      id: 'trends',
      label: 'Trends',
      icon: TrendingUp,
      description: 'Data insights'
    },
    {
      id: 'quizzes',
      label: 'Assessments',
      icon: TestTube,
      description: 'Manage quizzes'
    },
    {
      id: 'share',
      label: 'Share',
      icon: Share2,
      description: 'Share assessments'
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: Calendar,
      description: 'Appointments'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      description: 'Account settings'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Preferences'
    },
    {
      id: 'support',
      label: 'Support',
      icon: HelpCircle,
      description: 'Help & support'
    }
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex flex-col h-full w-64 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#0E7C9D] bg-clip-text text-transparent">
          Patient Pathway
        </h2>
        <p className="text-sm text-gray-600 mt-1">ENT Medical Platform</p>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-auto p-3 rounded-xl transition-all duration-200",
                  currentPage === item.id
                    ? "bg-gradient-to-r from-[#FF6B35] to-[#0E7C9D] text-white shadow-lg"
                    : "hover:bg-gray-50 text-gray-700"
                )}
                onClick={() => onPageChange(item.id)}
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className={cn(
                    "text-xs",
                    currentPage === item.id ? "text-white/80" : "text-gray-500"
                  )}>
                    {item.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Sign Out */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
