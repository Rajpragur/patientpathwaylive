
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

interface CollapsibleSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onSignOut: () => Promise<void>;
}

export function CollapsibleSidebar({ currentPage, onPageChange, onSignOut }: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const mainMenuItems = [
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
      id: 'schedule',
      label: 'Schedule',
      icon: Calendar,
      description: 'Appointments'
    }
  ];

  const bottomMenuItems = [
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

  const renderMenuItem = (item: any) => {
    const Icon = item.icon;
    return (
      <Button
        key={item.id}
        variant={currentPage === item.id ? "default" : "ghost"}
        className={cn(
          "w-full justify-start h-auto transition-all duration-200",
          isCollapsed ? "p-2" : "p-3",
          currentPage === item.id
            ? "bg-gradient-to-r from-[#FF6B35] to-[#0E7C9D] text-white shadow-lg"
            : "hover:bg-gray-50 text-gray-700"
        )}
        onClick={() => onPageChange(item.id)}
        title={isCollapsed ? item.label : undefined}
      >
        <Icon className={cn("flex-shrink-0", isCollapsed ? "w-5 h-5" : "w-5 h-5 mr-3")} />
        {!isCollapsed && (
          <div className="text-left">
            <div className="font-medium">{item.label}</div>
            <div className={cn(
              "text-xs",
              currentPage === item.id ? "text-white/80" : "text-gray-500"
            )}>
              {item.description}
            </div>
          </div>
        )}
      </Button>
    );
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Logo and Collapse Button */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#0E7C9D] bg-clip-text text-transparent">
              Patient Pathway
            </h2>
            <p className="text-xs text-gray-600 mt-1">ENT Medical Platform</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Main Navigation */}
      <ScrollArea className="flex-1">
        <div className={cn("space-y-2", isCollapsed ? "p-2" : "p-4")}>
          {mainMenuItems.map(renderMenuItem)}
        </div>
      </ScrollArea>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200">
        <div className={cn("space-y-2", isCollapsed ? "p-2" : "p-4")}>
          {bottomMenuItems.map(renderMenuItem)}
        </div>
      </div>

      {/* Sign Out */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className={cn(
            "w-full text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200",
            isCollapsed ? "justify-center p-2" : "justify-start"
          )}
          onClick={onSignOut}
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <LogOut className={cn("flex-shrink-0", isCollapsed ? "w-5 h-5" : "w-5 h-5 mr-3")} />
          {!isCollapsed && "Sign Out"}
        </Button>
      </div>
    </div>
  );
}
