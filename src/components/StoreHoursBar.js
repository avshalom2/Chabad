'use client';

import { useContext, useEffect, useState } from 'react';
import styles from './StoreHoursBar.module.css';
import { StoreHoursContext } from './StoreHoursProvider';

const defaults = { title: 'שעות פתיחת החנות', days: "ימים א׳-ה׳", hours: '10:00–19:00', badge: '' };

export default function StoreHoursBar({ variant, compact = false, mobileCompact = false } = {}) {
  const initialDetails = useContext(StoreHoursContext);
  const [fetchedDetails, setDetails] = useState(null);
  const details = initialDetails !== undefined ? { ...defaults, ...initialDetails } : fetchedDetails;

  useEffect(() => {
    if (initialDetails !== undefined) return;
    let active = true;
    fetch('/api/store-hours', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => { if (active) setDetails({ ...defaults, ...(data.storeHours || {}) }); })
      .catch(() => { if (active) setDetails(defaults); });
    return () => { active = false; };
  }, [initialDetails]);

  if (!details) return null;

  return (
    <section className={`${styles.bar} ${variant === 'classic' ? styles.classic : ''} ${compact ? styles.compact : ''} ${mobileCompact ? styles.mobileCompact : ''}`} dir="rtl" aria-label={details.title}>
      {variant !== 'classic' && <div className={styles.clock} aria-hidden="true"><span className={styles.hourHand} /><span className={styles.minuteHand} /></div>}
      <div className={styles.copy}>
        {variant === 'classic' ? <div className={styles.storeHeader}>
          <div className={styles.clockBox} aria-hidden="true"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="16" cy="16" r="14" /><path d="M16 7v9l7 4" /></svg></div>
          <div className={styles.storeHeading}><span className={styles.storeLabel}>חנות חב״ד</span><h2>{details.title === defaults.title ? 'שעות פתיחה' : details.title}</h2></div>
        </div> : <h2>{details.title}</h2>}
        <p><span>{details.days}</span>{variant !== 'classic' && ' · '}<bdi className={styles.hours}>{details.hours}</bdi></p>
      </div>
      {variant === 'classic' && <p className={styles.storeDescription}>יודאיקה · תפילין · מזוזות<br />מתנות וספרי קודש</p>}
      {details.badge && <span className={styles.badge}><span aria-hidden="true">☀</span>{details.badge}</span>}
      {variant === 'classic' && <a className={styles.inquiry} href="#classic-contact">בירור לפני הגעה <span aria-hidden="true">←</span></a>}
    </section>
  );
}
