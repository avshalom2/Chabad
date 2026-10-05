'use client';

import { siteConfig } from '@/lib/site-config';
import { classicFontClasses } from './ClassicHomepageHeader';
import styles from './SmartGridRenderer.module.css';

export default function BodyOpeningIntro() {
  return <div className={`${styles.bodyOpeningIntro} ${classicFontClasses}`} data-body-opening-intro>
      <p className={styles.eyebrow}>בית חב״ד הרצליה פיתוח</p>
      <h1>שעות פתיחה<br />{' '}<em>וזמני תפילה.</em></h1>
      <p>זמני התפילות ושעות פתיחת חנות היודאיקה.</p>
      <a className={styles.address} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.contact.address)}`} target="_blank" rel="noopener noreferrer"><span aria-hidden="true">⌖</span> {siteConfig.contact.address}</a>
    </div>;
}
