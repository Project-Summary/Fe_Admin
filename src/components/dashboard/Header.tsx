'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Menu, Search, Moon, Sun, User, LogOut, Settings, BellRing } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

export default function Header({ onMenuButtonClick }: { onMenuButtonClick: any }) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any>([]);
  const [mounted, setMounted] = useState(false);

  // Mock notifications
  useEffect(() => {
    setMounted(true);

    // Mock notifications data - in a real app, this would come from your API
    setNotifications([
      {
        id: 1,
        title: 'New episode request',
        message: 'User john_doe requested a new episode generation',
        time: '5m ago',
        read: false,
      },
      {
        id: 2,
        title: 'Content moderation needed',
        message: 'AI generated content needs review before publishing',
        time: '15m ago',
        read: false,
      },
      {
        id: 3,
        title: 'API usage limit warning',
        message: 'Gemini API usage is approaching daily limit',
        time: '1h ago',
        read: true,
      },
    ]);
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('admin-token');
    router.push('/login');
  };

  // Count unread notifications
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  // Handle mark notification as read
  const markAsRead = (id: any) => {
    setNotifications(
      notifications.map((notification: any) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  // Handle mark all as read
  const markAllAsRead = () => {
    setNotifications(notifications.map((notification: any) => ({ ...notification, read: true })));
  };

  if (!mounted) {
    return null;
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuButtonClick}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Search */}
      <div className="flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-muted-foreground"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                >
                  {unreadCount}
                </Badge>
              )}
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="border-b px-4 py-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Notifications</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  Mark all as read
                </Button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No notifications</div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((notification: any) => (
                    <div
                      key={notification.id}
                      className={`border-b p-4 transition-colors hover:bg-muted/50 ${
                        !notification.read ? 'bg-muted/20' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 rounded-full p-1 ${!notification.read ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                          <BellRing className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4
                              className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}
                            >
                              {notification.title}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {notification.time}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-1 h-auto p-0 text-xs text-primary"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center"
                onClick={() => router.push('/notifications')}
              >
                View all notifications
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/images/admin-avatar.png" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Admin</p>
                <p className="text-xs leading-none text-muted-foreground">admin@gmail.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
