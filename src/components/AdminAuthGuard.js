'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * AdminAuthWrapper - Protects the entire admin interface
 * This wraps BOTH sidebar and content so they can't be separated
 * If not authenticated, redirects to login page immediately
 */
export default function AdminAuthWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('🛡️ AdminAuthWrapper - checking pathname:', pathname);
    
    // Only redirect if we're NOT on the login page
    if (pathname !== '/admin/login') {
      console.log('🔄 Unauthenticated on', pathname, '- redirecting to /admin/login');
      router.push('/admin/login');
    }
  }, [pathname, router]);

  // Only render children on the login page - nothing else
  if (pathname === '/admin/login') {
    console.log('✅ AdminAuthWrapper - rendering login page (unauthenticated)');
    return <>{children}</>;
  }

  // For any other admin page without auth, show nothing (loading state while redirecting)
  console.log('⏳ AdminAuthWrapper - redirecting from', pathname);
  return null;
}
