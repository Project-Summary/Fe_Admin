'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Toaster } from 'sonner';

export default function DashboardLayout({ children }: { children: any }) {
  const [isMounted, setIsMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check for authentication on client side
  useEffect(() => {
    setIsMounted(true);

    const token = localStorage.getItem('admin-token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // Don't render children until authentication check is complete
  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} currentPath={pathname} />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuButtonClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>

      {/* Toast notifications */}
      <Toaster position="top-right" />
    </div>
  );
}
