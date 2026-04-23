'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * AdminAuthWrapper - Protects the entire admin interface
 * This wraps BOTH sidebar and content as one unit
 * If not authenticated, redirects to login page immediately
 * This ensures menu and content are never shown separately
 */
export default function AdminAuthWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('[ADMIN-AUTH-WRAPPER] pathname:', pathname);
    // Only redirect if we're NOT on the login page
    if (pathname !== '/admin/login') {
      console.log('[ADMIN-AUTH-WRAPPER] Not on login page - redirecting to /admin/login');
      router.push('/admin/login');
    } else {
      console.log('[ADMIN-AUTH-WRAPPER] On login page - rendering');
    }
  }, [pathname, router]);

  // Only render children on the login page - nothing else visible
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // For any other admin page without auth, show nothing (loading state during redirect)
  // This prevents any UI from showing while redirecting
  console.log('[ADMIN-AUTH-WRAPPER] Blank state during redirect from:', pathname);
  return null;
}
