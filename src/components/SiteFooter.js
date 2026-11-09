'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import ClassicFooter from './ClassicFooter';
import LegacyFooter from './Footer';

// The original Footer and its stylesheet remain untouched for rollback.
export default function SiteFooter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  if (pathname.startsWith('/admin') || pathname === '/login') return null;
  return searchParams.get('footer') === 'legacy' ? <LegacyFooter /> : <ClassicFooter />;
}
