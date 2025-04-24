'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Film,
  BookOpen,
  FolderKanban,
  Users,
  BellRing,
  BarChart2,
  Settings,
  LogOut,
  Bot,
  Tv,
  FileText,
  X,
  Clapperboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export default function Sidebar({
  open,
  onClose,
  currentPath,
}: {
  open: any;
  onClose: any;
  currentPath: any;
}) {
  const router = useRouter();
  const isResizingRef = useRef(false);
  const sidebarRef = useRef<any>(null);
  const navbarRef = useRef(null);

  const navigationItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: 'Movies',
      icon: <Film className="h-5 w-5" />,
      subMenu: [
        {
          title: 'All Movies',
          href: '/movies',
          icon: <Clapperboard className="h-4 w-4" />,
        },
        {
          title: 'Episodes',
          href: '/movies/episodes',
          icon: <Tv className="h-4 w-4" />,
        },
        {
          title: 'Create New',
          href: '/movies/new',
          icon: <FileText className="h-4 w-4" />,
        },
      ],
    },
    {
      title: 'Stories',
      icon: <BookOpen className="h-5 w-5" />,
      subMenu: [
        {
          title: 'All Stories',
          href: '/stories',
          icon: <BookOpen className="h-4 w-4" />,
        },
        {
          title: 'Chapters',
          href: '/stories/chapters',
          icon: <FileText className="h-4 w-4" />,
        },
        {
          title: 'Create New',
          href: '/stories/new',
          icon: <FileText className="h-4 w-4" />,
        },
      ],
    },
    {
      title: 'Categories',
      href: '/categories',
      icon: <FolderKanban className="h-5 w-5" />,
    },
    {
      title: 'Users',
      href: '/users',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'AI Content',
      href: '/ai-content',
      icon: <Bot className="h-5 w-5" />,
    },
    {
      title: 'API Stats',
      href: '/api-stats',
      icon: <BarChart2 className="h-5 w-5" />,
    },
    {
      title: 'Notifications',
      href: '/notifications',
      icon: <BellRing className="h-5 w-5" />,
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('admin-token');
    router.push('/login');
  };

  // Handle clicking outside sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        open &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !isResizingRef.current
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  // Mobile sidebar using Sheet from shadcn
  const MobileSidebar = () => (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="p-0 w-72">
        <div className="flex h-screen flex-col overflow-hidden">
          <div className="flex h-14 items-center border-b px-4">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Clapperboard className="h-6 w-6 text-primary" />
              <span className="text-lg">Admin Panel</span>
            </Link>
            <Button variant="ghost" size="icon" className="ml-auto md:hidden" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <SidebarContent />
        </div>
      </SheetContent>
    </Sheet>
  );

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div ref={sidebarRef} className="hidden border-r bg-background md:block w-72">
      <div className="flex h-screen flex-col overflow-hidden">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Clapperboard className="h-6 w-6 text-primary" />
            <span className="text-lg">Admin Panel</span>
          </Link>
        </div>
        <SidebarContent />
      </div>
    </div>
  );

  // Shared sidebar content
  const SidebarContent = () => (
    <>
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-2 p-4">
          {navigationItems.map((item, index) => (
            <div key={index}>
              {item.href ? (
                <NavItem
                  className={''}
                  onClick={handleOnClickNavItem}
                  href={item.href}
                  icon={item.icon}
                  title={item.title}
                  active={currentPath === item.href}
                />
              ) : (
                <NavGroup key={item.title} item={item} currentPath={currentPath} />
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      <div className="mt-auto border-t p-4">
        <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </>
  );

  return (
    <>
      <MobileSidebar />
      <DesktopSidebar />
    </>
  );
}

const handleOnClickNavItem = () => {
  console.log('Handle on click nav item');
};

// Navigation item component
function NavItem({
  href,
  icon,
  title,
  active,
  onClick,
  className,
}: {
  href: any;
  icon: any;
  title: any;
  active: any;
  onClick: any;
  className: any;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors',
        active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
        className,
      )}
    >
      {icon}
      <span>{title}</span>
    </Link>
  );
}

// Navigation group component with submenu
function NavGroup({ item, currentPath }: { item: any; currentPath: any }) {
  // Check if any child is active
  const isGroupActive = item.subMenu?.some((subItem: any) => currentPath === subItem.href);

  return (
    <div className="space-y-1">
      <div
        className={cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
          isGroupActive ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {item.icon}
        <span>{item.title}</span>
      </div>

      <div className="ml-4 pl-2 border-l">
        {item.subMenu?.map((subItem: any, idx: number) => (
          <NavItem
            key={idx}
            onClick={handleOnClickNavItem}
            href={subItem.href}
            icon={subItem.icon}
            title={subItem.title}
            active={currentPath === subItem.href}
            className="py-1.5"
          />
        ))}
      </div>
    </div>
  );
}
