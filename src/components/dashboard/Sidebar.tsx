
import { 
  Home, 
  BarChart3, 
  TrendingUp, 
  User, 
  Settings, 
  HelpCircle,
  Stethoscope
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'trends', label: 'Trends', icon: TrendingUp },
  { id: 'quizzes', label: 'Quiz Management', icon: Stethoscope },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'support', label: 'Support', icon: HelpCircle },
];

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-blue-600">Patient Pathway</h2>
        <p className="text-sm text-gray-500">Doctor Portal</p>
      </div>
      <nav className="mt-6">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={cn(
              "w-full flex items-center px-6 py-3 text-left transition-colors",
              currentPage === item.id
                ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
