'use client';

import { siteConfig } from '@/lib/site-config';
import styles from './ClassicHomepage.module.css';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ContactSectionContent({ children, className = '', compactMobile = false, copyFontClass = '' }) {
  const searchParams = useSearchParams();
  if (searchParams.get('footer') !== 'legacy') return null;
  return <section className={`${styles.section} ${styles.contact} ${compactMobile ? styles.compactContact : ''} ${className}`} id="classic-contact"><div className={copyFontClass}><p className={styles.eyebrow}>השיחה שלנו מתחילה כאן</p><h2>נעים להכיר.<br /><em>אנחנו כאן בשבילכם.</em></h2><p>שאלה, בקשה או רצון להיפגש — נשמח לשמוע מכם.</p><a className={styles.textLink} href={`tel:${siteConfig.contact.phone}`}><bdi>{siteConfig.contact.phone}</bdi> <span aria-hidden="true">←</span></a></div><div>{children}</div></section>;
}

export default function ClassicContactSection(props) {
  return <Suspense fallback={null}><ContactSectionContent {...props} /></Suspense>;
}
