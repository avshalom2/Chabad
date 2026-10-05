'use client';

import ClassicHomepageHeader, { classicFontClasses } from './ClassicHomepageHeader';
import styles from './ClassicHomepage.module.css';

export default function ClassicHomepageShell({ children, embedded = false }) {
  return <div className={`${classicFontClasses} ${styles.squareShell}`} data-homepage-design={embedded ? 'classic-embedded' : 'classic'} data-homepage-body="original">
    <div className={`${styles.page} ${styles.shellHeader}`}><ClassicHomepageHeader /></div>
    <div className={styles.originalBody}>{children}</div>
  </div>;
}
