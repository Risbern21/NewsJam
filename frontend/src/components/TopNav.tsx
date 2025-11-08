import { Shield, Moon, Sun, LogOut, Users, Upload, User } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import type { User as UserType } from '../App';

interface TopNavProps {
  currentPage: string;
  onNavigate: (page: 'community' | 'upload' | 'profile') => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  user: UserType | null;
  onLogout: () => void;
}

export function TopNav({ currentPage, onNavigate, isDarkMode, onToggleDarkMode, user, onLogout }: TopNavProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => onNavigate('community')}
              className="group"
            >
              <span className="text-gray-900 dark:text-white tracking-tight">NewsJam</span>
            </button>
            
            <div className="hidden md:flex items-center gap-1">
              <Button
                variant={currentPage === 'community' ? 'default' : 'ghost'}
                onClick={() => onNavigate('community')}
                className={currentPage === 'community' ? 'bg-green-600 hover:bg-green-700 text-white' : 'dark:text-white'}
              >
                <Users className="size-4 mr-2" />
                Community
              </Button>
              <Button
                variant={currentPage === 'upload' ? 'default' : 'ghost'}
                onClick={() => onNavigate('upload')}
                className={currentPage === 'upload' ? 'bg-green-600 hover:bg-green-700 text-white' : 'dark:text-white'}
              >
                <Upload className="size-4 mr-2" />
                Upload
              </Button>
              <Button
                variant={currentPage === 'profile' ? 'default' : 'ghost'}
                onClick={() => onNavigate('profile')}
                className={currentPage === 'profile' ? 'bg-green-600 hover:bg-green-700 text-white' : 'dark:text-white'}
              >
                <User className="size-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleDarkMode}
              className="rounded-full"
            >
              {isDarkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>
            
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Avatar className="size-8">
                      <AvatarImage src={user.avatar} alt={user.username} />
                      <AvatarFallback>{user.username[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-gray-900 dark:text-white">{user.username}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onNavigate('profile')}>
                    <User className="size-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="size-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}