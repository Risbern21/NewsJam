import { Users, Upload, User } from 'lucide-react';

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: 'community' | 'upload' | 'profile') => void;
}

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'community', label: 'Community', icon: Users },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as 'community' | 'upload' | 'profile')}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-green-600 dark:text-green-500'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Icon className={`size-6 mb-1 ${isActive ? 'fill-current' : ''}`} />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
