"use client";

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';

export function FooterWrapper() {
  const pathname = usePathname();
  
  // Hide footer on dashboard, login, and possibly other specific routes
  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/login')) {
    return null;
  }
  
  return <Footer />;
}
