'use client';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import '../app/globals.css';

const Layouts = ({ children }: { children: ReactNode }) => {
  const path = usePathname();
  const fullPageRoutes = ['/login', '/register', '/forgot-password'];
  const isFullPage = fullPageRoutes.includes(path);

  if (isFullPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  return <>{children}</>;
};

export default Layouts;
