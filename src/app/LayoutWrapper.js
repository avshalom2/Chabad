'use client';

import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Suspense fallback={null}><Header /></Suspense>
      <div style={{ flex: 1 }}>{children}</div>
      <Footer />
    </>
  );
}
