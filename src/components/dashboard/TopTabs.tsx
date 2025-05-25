
import { Button } from '@/components/ui/button';

interface TopTabsProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function TopTabs({ currentTab, onTabChange }: TopTabsProps) {
  const tabs = [
    { id: 'leads', label: 'Leads', description: 'View and manage patient leads' },
    { id: 'company', label: 'Company', description: 'Company settings and team management' },
    { id: 'lead-capture', label: 'Lead Capture', description: 'Configure lead capture tools' }
  ];

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex space-x-1">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={currentTab === tab.id ? "default" : "ghost"}
            className={`px-6 py-3 rounded-lg transition-all duration-200 ${
              currentTab === tab.id 
                ? 'bg-blue-500 text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
