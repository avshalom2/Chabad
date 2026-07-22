'use client';

import { useEffect, useState } from 'react';
import styles from './Header.module.css';
import Navigation from './Navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatHebrewDate } from '@/lib/hebrew-calendar';

export default function Header() {
  const pathname = usePathname();
  const [hebrewDate, setHebrewDate] = useState('');

  useEffect(() => {
    const updateHebrewDate = () => setHebrewDate(formatHebrewDate(new Date()));
    updateHebrewDate();

    const timer = window.setInterval(updateHebrewDate, 60 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);
  
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
            <img src="/header-chabad-logo.png" alt='בית חב"ד הרצליה פיתוח' className={styles.logoGraphic} />
          </div>
        </Link>

        {/* LEFT: Hebrew date and donation button */}
        <div className={styles.headerInfo}>
          <span className={styles.hebrewDate} aria-label="התאריך העברי היום">
            {hebrewDate || '\u00a0'}
          </span>
          <Link href="/donate" className={styles.donateBtn}>
            לתרומה
          </Link>
        </div>
      </div>

      <Navigation />
    </header>
  );
}

