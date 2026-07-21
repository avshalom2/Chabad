'use client';

import { useEffect, useState } from 'react';
import styles from './StoreHoursBar.module.css';

const defaults = { title: 'שעות פתיחת החנות', days: "ימים א׳-ה׳", hours: '10:00–19:00', badge: '' };

export default function StoreHoursBar() {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    fetch('/api/store-hours', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => setDetails({ ...defaults, ...(data.storeHours || {}) }))
      .catch(() => setDetails(defaults));
  }, []);

  if (!details) return null;

  return (
    <section className={styles.bar} dir="rtl" aria-label={details.title}>
      <div className={styles.clock} aria-hidden="true"><span className={styles.hourHand} /><span className={styles.minuteHand} /></div>
      <div className={styles.copy}>
        <h2>{details.title}</h2>
        <p>{details.days} · <bdi className={styles.hours}>{details.hours}</bdi></p>
      </div>
      {details.badge && <span className={styles.badge}><span aria-hidden="true">☀</span>{details.badge}</span>}
    </section>
  );
}
