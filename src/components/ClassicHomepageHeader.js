'use client';

import { useEffect, useState } from 'react';
import { Assistant, Frank_Ruhl_Libre } from 'next/font/google';
import Link from 'next/link';
import { formatHebrewDate } from '@/lib/hebrew-calendar';
import styles from './ClassicHomepage.module.css';
import navigationStyles from './Navigation.module.css';

const assistant = Assistant({ subsets: ['hebrew'], display: 'swap', variable: '--classic-body-font' });
const frank = Frank_Ruhl_Libre({ subsets: ['hebrew'], display: 'swap', variable: '--classic-heading-font' });
export const classicFontClasses = `${assistant.variable} ${frank.variable}`;

function categoryHref(category) {
  const customUrl = typeof category.custom_url === 'string' ? category.custom_url.trim() : '';
  if (!customUrl) return `/category/${category.slug}`;
  return /^(https?:|mailto:|tel:|#|\/)/i.test(customUrl) ? customUrl : `/${customUrl}`;
}

export default function ClassicHomepageHeader({ articlesHref = '#classic-articles', showStoreMenu = false }) {
  const [date, setDate] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [store, setStore] = useState(null);
  const [storeExpanded, setStoreExpanded] = useState(false);
  useEffect(() => {
    if (!showStoreMenu) return;
    const controller = new AbortController();
    fetch('/api/categories/navigate', { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch store navigation');
        return response.json();
      })
      .then(data => setStore(data.categories?.find(category => category.slug === 'store') || null))
      .catch(error => { if (error.name !== 'AbortError') console.error(error); });
    return () => controller.abort();
  }, [showStoreMenu]);
  useEffect(() => {
    const update = () => setDate(formatHebrewDate(new Date()));
    update();
    const timer = setInterval(update, 60 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);
  const nav = <><a href="#classic-times">שעות ותפילות</a><a href="#classic-services">השירותים שלנו</a><Link href="/shabbat-times">זמני שבת</Link><Link href={articlesHref}>חגים ומאמרים</Link>{showStoreMenu && <a href="#classic-contact">צור קשר</a>}</>;
  const storeHref = store ? categoryHref(store) : '/category/store';
  const storeLinks = store?.subs?.map(sub => <Link key={sub.id} href={categoryHref(sub)} className={navigationStyles.subLink}>{sub.name}</Link>);
  return <>
    <div className={styles.announcement}><span>בית חב״ד הרצליה פיתוח <i /> פותחים את הדלת. פותחים את הלב.</span><time>{date}</time></div>
    <header className={styles.navigation}>
      <Link href="/" className={styles.brand}><span className={styles.brandMark} aria-hidden="true">✧</span><span><strong>בית חב״ד</strong><small>הרצליה פיתוח · הבית של כולנו</small></span></Link>
      <nav aria-label="ניווט דף הבית" className={styles.desktopNav}>
        {showStoreMenu && <div className={`${navigationStyles.menuItem} ${styles.storeMenu}`}>
          <Link href={storeHref}>חנות חב״ד</Link>
          {!!store?.subs?.length && <div className={navigationStyles.dropdown}>{storeLinks}</div>}
        </div>}
        {nav}
      </nav>
      {showStoreMenu ? <Link className={`${styles.visit} ${styles.donateButton}`} href="/donate">לתרומה</Link> : <a className={styles.visit} href="#classic-contact">בואו להכיר <span aria-hidden="true">←</span></a>}
      <button className={styles.menuButton} aria-label="תפריט ניווט" aria-expanded={menuOpen} onClick={() => { setMenuOpen(!menuOpen); setStoreExpanded(false); }}>☰</button>
      {menuOpen && <nav className={styles.mobileNav} aria-label="ניווט בנייד" onClick={event => { if (event.target.closest('a')) { setMenuOpen(false); setStoreExpanded(false); } }}>
        {showStoreMenu && <div>
          {store?.subs?.length ? <button className={navigationStyles.mobileParentButton} aria-expanded={storeExpanded} onClick={() => setStoreExpanded(!storeExpanded)}>חנות חב״ד</button> : <Link href={storeHref}>חנות חב״ד</Link>}
          {storeExpanded && <div className={navigationStyles.mobileSubmenu}>{store.subs.map(sub => <Link key={sub.id} href={categoryHref(sub)} className={navigationStyles.mobileSubLink}>{sub.name}</Link>)}</div>}
        </div>}
        {nav}
      </nav>}
    </header>
  </>;
}
