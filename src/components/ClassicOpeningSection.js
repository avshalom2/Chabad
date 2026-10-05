'use client';

import { siteConfig } from '@/lib/site-config';
import styles from './ClassicHomepage.module.css';

export default function ClassicOpeningSection({ prayers, store }) {
  return <section className={styles.timesSection} id="classic-times" aria-label="שעות פתיחה ותפילות">
    <div className={styles.timesIntro}>
      <p className={styles.eyebrow}>בית חב״ד הרצליה פיתוח</p>
      <h1>שעות פתיחה<br />{' '}<em>וזמני תפילה.</em></h1>
      <p>זמני התפילות ושעות פתיחת חנות היודאיקה.</p>
      <a className={styles.address} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.contact.address)}`} target="_blank" rel="noopener noreferrer"><span aria-hidden="true">⌖</span> {siteConfig.contact.address}</a>
    </div>
    <div className={styles.prayers} data-opening-prayers>{prayers}</div>
    <div className={styles.store} data-store-hours>{store}</div>
  </section>;
}
