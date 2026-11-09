'use client';

import { useEffect, useState } from 'react';
import { Assistant } from 'next/font/google';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatHebrewDate } from '@/lib/hebrew-calendar';
import styles from './ClassicHomepage.module.css';
import navigationStyles from './Navigation.module.css';

const assistant = Assistant({ subsets: ['hebrew'], display: 'swap', variable: '--classic-body-font' });
const headingAssistant = Assistant({ subsets: ['hebrew'], display: 'swap', variable: '--classic-heading-font' });
export const classicFontClasses = `${assistant.variable} ${headingAssistant.variable}`;

function categoryHref(category) {
  const customUrl = typeof category.custom_url === 'string' ? category.custom_url.trim() : '';
  if (!customUrl) return `/category/${category.slug}`;
  return /^(https?:|mailto:|tel:|#|\/)/i.test(customUrl) ? customUrl : `/${customUrl}`;
}

export default function ClassicHomepageHeader({ showStoreMenu = false }) {
  const pathname = usePathname();
  const servicesHref = pathname === '/' || pathname === '/homepage-preview' ? '#classic-services' : '/#classic-services';
  const [date, setDate] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [store, setStore] = useState(null);
  const [storeExpanded, setStoreExpanded] = useState(false);
  const [services, setServices] = useState([]);
  const [servicesExpanded, setServicesExpanded] = useState(false);
  const [learning, setLearning] = useState(null);
  const [learningExpanded, setLearningExpanded] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/articles/by-category?categoryId=8&limit=12', { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch service navigation');
        return response.json();
      })
      .then(data => setServices(Array.isArray(data) ? data : []))
      .catch(error => { if (error.name !== 'AbortError') console.error(error); });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/categories/navigate', { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch category navigation');
        return response.json();
      })
      .then(data => {
        setStore(data.categories?.find(category => category.slug === 'store') || null);
        setLearning(data.categories?.find(category => category.slug === 'לימוד-ויהדות') || null);
      })
      .catch(error => { if (error.name !== 'AbortError') console.error(error); });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const update = () => setDate(formatHebrewDate(new Date()));
    update();
    const timer = setInterval(update, 60 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);
  const serviceLinks = (className) => services.map(service => <Link key={service.id} href={`/articles/${service.slug}`} className={className}>{service.title}</Link>);
  const learningHref = learning ? categoryHref(learning) : '/category/לימוד-ויהדות';
  const learningLinks = (className) => learning?.subs?.map(sub => <Link key={sub.id} href={categoryHref(sub)} className={className}>{sub.name}</Link>);
  const nav = (mobile = false) => <>
    {mobile ? <div>
      {services.length ? <button className={navigationStyles.mobileParentButton} aria-expanded={servicesExpanded} onClick={() => { setServicesExpanded(!servicesExpanded); setStoreExpanded(false); setLearningExpanded(false); }}>השירותים שלנו</button> : <a href={servicesHref}>השירותים שלנו</a>}
      {servicesExpanded && <div className={navigationStyles.mobileSubmenu}>{serviceLinks(navigationStyles.mobileSubLink)}</div>}
    </div> : <div className={`${navigationStyles.menuItem} ${styles.storeMenu}`}>
      <a href={servicesHref}>השירותים שלנו</a>
      {!!services.length && <div className={navigationStyles.dropdown}>{serviceLinks(navigationStyles.subLink)}</div>}
    </div>}
    {mobile ? <div>
      {learning?.subs?.length ? <button className={navigationStyles.mobileParentButton} aria-expanded={learningExpanded} onClick={() => { setLearningExpanded(!learningExpanded); setStoreExpanded(false); setServicesExpanded(false); }}>לימוד יהדות</button> : <Link href={learningHref}>לימוד יהדות</Link>}
      {learningExpanded && <div className={navigationStyles.mobileSubmenu}>{learningLinks(navigationStyles.mobileSubLink)}</div>}
    </div> : <div className={`${navigationStyles.menuItem} ${styles.storeMenu}`}>
      <Link href={learningHref}>לימוד יהדות</Link>
      {!!learning?.subs?.length && <div className={navigationStyles.dropdown}>{learningLinks(navigationStyles.subLink)}</div>}
    </div>}
    <Link href="/contact">צור קשר</Link></>;
  const storeHref = store ? categoryHref(store) : '/category/store';
  const storeLinks = store?.subs?.map(sub => <Link key={sub.id} href={categoryHref(sub)} className={navigationStyles.subLink}>{sub.name}</Link>);
  return <div data-classic-header>
    <div className={styles.announcement}><span>בית חב״ד הרצליה פיתוח <i /> פותחים את הדלת. פותחים את הלב.</span><time>{date}</time></div>
    <header className={styles.navigation}>
      <Link href="/" className={styles.brand}><img className={styles.brandMark} src="/header-ufaratzta-mark.png" alt="סמל ופרצת" width="43" height="60" /><span><strong>בית חב״ד</strong><small>הרצליה פיתוח - משכית 22</small></span></Link>
      <nav aria-label="ניווט דף הבית" className={styles.desktopNav}>
        {showStoreMenu && <div className={`${navigationStyles.menuItem} ${styles.storeMenu}`}>
          <Link href={storeHref}>חנות חב״ד</Link>
          {!!store?.subs?.length && <div className={navigationStyles.dropdown}>{storeLinks}</div>}
        </div>}
        {nav()}
      </nav>
      <Link className={`${styles.visit} ${styles.donateButton}`} href="/donate">לתרומה</Link>
      <button className={styles.menuButton} aria-label="תפריט ניווט" aria-expanded={menuOpen} onClick={() => { setMenuOpen(!menuOpen); setStoreExpanded(false); setServicesExpanded(false); setLearningExpanded(false); }}>☰</button>
      {menuOpen && <nav className={styles.mobileNav} aria-label="ניווט בנייד" onClick={event => { if (event.target.closest('a')) { setMenuOpen(false); setStoreExpanded(false); setServicesExpanded(false); setLearningExpanded(false); } }}>
        <button type="button" className={styles.mobileCloseButton} aria-label="סגור תפריט" onClick={() => { setMenuOpen(false); setStoreExpanded(false); setServicesExpanded(false); setLearningExpanded(false); }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
        {showStoreMenu && <div>
          {store?.subs?.length ? <button className={navigationStyles.mobileParentButton} aria-expanded={storeExpanded} onClick={() => { setStoreExpanded(!storeExpanded); setServicesExpanded(false); setLearningExpanded(false); }}>חנות חב״ד</button> : <Link href={storeHref}>חנות חב״ד</Link>}
          {storeExpanded && <div className={navigationStyles.mobileSubmenu}>{store.subs.map(sub => <Link key={sub.id} href={categoryHref(sub)} className={navigationStyles.mobileSubLink}>{sub.name}</Link>)}</div>}
        </div>}
        {nav(true)}
      </nav>}
    </header>
  </div>;
}
