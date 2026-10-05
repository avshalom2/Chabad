'use client';

import { siteConfig } from '@/lib/site-config';
import styles from './ClassicHomepage.module.css';

export default function ClassicContactSection({ children }) {
  return <section className={`${styles.section} ${styles.contact}`} id="classic-contact"><div><p className={styles.eyebrow}>השיחה שלנו מתחילה כאן</p><h2>נעים להכיר.<br /><em>אנחנו כאן בשבילכם.</em></h2><p>שאלה, בקשה או רצון להיפגש — נשמח לשמוע מכם.</p><a className={styles.textLink} href={`tel:${siteConfig.contact.phone}`}><bdi>{siteConfig.contact.phone}</bdi> <span aria-hidden="true">←</span></a></div><div>{children}</div></section>;
}
