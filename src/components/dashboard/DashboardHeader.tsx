
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Bell } from 'lucide-react';

export function DashboardHeader() {
  const { signOut, user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Portal</h1>
          <p className="text-sm text-gray-500">Welcome back, Dr. {user?.user_metadata?.first_name || 'Doctor'}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={signOut} size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
