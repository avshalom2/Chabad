'use client';

import { useEffect, useState } from 'react';
import styles from './Header.module.css';
import Navigation from './Navigation';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { formatHebrewDate } from '@/lib/hebrew-calendar';
import ClassicHomepageHeader, { classicFontClasses } from './ClassicHomepageHeader';
import classicStyles from './ClassicHomepage.module.css';

export default function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
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

  // Keep the previous site header available as a URL-only backup.
  if (searchParams.get('template') !== 'classic-shell') {
    return <div className={`${classicStyles.page} ${classicStyles.shellHeader} ${classicFontClasses}`} data-site-header data-site-header-variant="classic"><ClassicHomepageHeader /></div>;
  }

  return (
    <header className={styles.header} data-site-header data-site-header-variant="legacy">
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

