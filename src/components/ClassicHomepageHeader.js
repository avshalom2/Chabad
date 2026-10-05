'use client';

import { useEffect, useState } from 'react';
import { Assistant, Frank_Ruhl_Libre } from 'next/font/google';
import Link from 'next/link';
import { formatHebrewDate } from '@/lib/hebrew-calendar';
import styles from './ClassicHomepage.module.css';

const assistant = Assistant({ subsets: ['hebrew'], display: 'swap', variable: '--classic-body-font' });
const frank = Frank_Ruhl_Libre({ subsets: ['hebrew'], display: 'swap', variable: '--classic-heading-font' });
export const classicFontClasses = `${assistant.variable} ${frank.variable}`;

export default function ClassicHomepageHeader() {
  const [date, setDate] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const update = () => setDate(formatHebrewDate(new Date()));
    update();
    const timer = setInterval(update, 60 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);
  const nav = <><a href="#classic-times">שעות ותפילות</a><a href="#classic-services">השירותים שלנו</a><Link href="/shabbat-times">זמני שבת</Link><a href="#classic-articles">חגים ומאמרים</a></>;
  return <>
    <div className={styles.announcement}><span>בית חב״ד הרצליה פיתוח <i /> פותחים את הדלת. פותחים את הלב.</span><time>{date}</time></div>
    <header className={styles.navigation}>
      <Link href="/" className={styles.brand}><span className={styles.brandMark} aria-hidden="true">✧</span><span><strong>בית חב״ד</strong><small>הרצליה פיתוח · הבית של כולנו</small></span></Link>
      <nav aria-label="ניווט דף הבית" className={styles.desktopNav}>{nav}</nav>
      <a className={styles.visit} href="#classic-contact">בואו להכיר <span aria-hidden="true">←</span></a>
      <button className={styles.menuButton} aria-label="תפריט ניווט" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      {menuOpen && <nav className={styles.mobileNav} aria-label="ניווט בנייד" onClick={() => setMenuOpen(false)}>{nav}</nav>}
    </header>
  </>;
}
