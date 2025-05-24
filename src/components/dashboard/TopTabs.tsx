
import { cn } from '@/lib/utils';

interface TopTabsProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'leads', label: 'Leads' },
  { id: 'contact', label: 'Contact' },
  { id: 'company', label: 'Company' },
  { id: 'lead-capture', label: 'Lead Capture' },
];

export function TopTabs({ currentTab, onTabChange }: TopTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
              currentTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
