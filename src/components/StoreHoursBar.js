'use client';

import { useEffect, useState } from 'react';
import styles from './StoreHoursBar.module.css';

const defaults = { title: 'שעות פתיחת החנות', days: "ימים א׳-ה׳", hours: '10:00–19:00', badge: '' };

export default function StoreHoursBar({ variant } = {}) {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    fetch('/api/store-hours', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => setDetails({ ...defaults, ...(data.storeHours || {}) }))
      .catch(() => setDetails(defaults));
  }, []);

  if (!details) return null;

  return (
    <section className={`${styles.bar} ${variant === 'classic' ? styles.classic : ''}`} dir="rtl" aria-label={details.title}>
      <div className={styles.clock} aria-hidden="true"><span className={styles.hourHand} /><span className={styles.minuteHand} /></div>
      <div className={styles.copy}>
        <h2>{details.title}</h2>
        <p>{details.days} · <bdi className={styles.hours}>{details.hours}</bdi></p>
      </div>
      {variant === 'classic' && <p className={styles.storeDescription}>יודאיקה · תפילין · מזוזות<br />מתנות וספרי קודש</p>}
      {details.badge && <span className={styles.badge}><span aria-hidden="true">☀</span>{details.badge}</span>}
      {variant === 'classic' && <a className={styles.inquiry} href="#classic-contact">בירור לפני הגעה <span aria-hidden="true">←</span></a>}
    </section>
  );
}
