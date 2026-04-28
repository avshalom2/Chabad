'use client';

import styles from './Header.module.css';
import Navigation from './Navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  
  // Don't render header on admin or login routes
  if (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/admin/login') {
    return null;
  }

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        {/* RIGHT: Logo */}
        <Link href="/" className={styles.logo}>
          <div className={styles.logoContainer}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo_50px.png" alt='סמל בית חב"ד הרצליה פיתוח' className={styles.logoGraphic} />
            <div className={styles.logoText}>
              <h1 className={styles.logoBrand}>בית חב"ד</h1>
              <p className={styles.logoSubtitle}>הרצליה פיתוח</p>
            </div>
          </div>
        </Link>

        {/* LEFT: Donation button */}
        <Link href="/donate" className={styles.donateBtn}>
          תרומות
        </Link>
      </div>

      <Navigation />
    </header>
  );
}

