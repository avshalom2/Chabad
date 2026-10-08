'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatHebrewDate } from '@/lib/hebrew-calendar';
import { israelDateKey, showHomepageShabbat } from '@/lib/shabbat-times';
import { classicFontClasses } from './ClassicHomepageHeader';
import styles from './HomepageShabbatBar.module.css';

export default function HomepageShabbatBar() {
  const [today, setToday] = useState(null);
  const [upcoming, setUpcoming] = useState(null);
  useEffect(() => {
    const update = () => setToday(showHomepageShabbat() ? israelDateKey() : null);
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!today) return;
    const controller = new AbortController();
    fetch('/api/shabbat-times/upcoming', { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('Shabbat times unavailable'); return response.json(); })
      .then(data => setUpcoming(data.upcoming))
      .catch(error => { if (error.name !== 'AbortError') setUpcoming(null); });
    return () => controller.abort();
  }, [today]);

  if (!today || !upcoming || upcoming.date < today || !upcoming.candleTime || !upcoming.havdalahTime) return null;
  const date = new Date(`${upcoming.date}T12:00:00`);
  const civilDate = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'numeric' }).format(date);
  return <section className={`${classicFontClasses} ${styles.bar}`} dir="rtl" aria-label="זמני השבת הקרובה" data-homepage-shabbat>
    <div className={styles.identity}>
      <span className={styles.eyebrow}>✧ <Link href="/shabbat-times">השבת הקרובה</Link> ✧</span>
      <h2>{upcoming.parashah}</h2>
      <p>{formatHebrewDate(date)} · <time dateTime={upcoming.date}>{civilDate}</time></p>
    </div>
    <div className={styles.time}><span>כניסת שבת</span><strong dir="ltr">{upcoming.candleTime}</strong></div>
    <div className={styles.time}><span>יציאת שבת</span><strong dir="ltr">{upcoming.havdalahTime}</strong></div>
    <svg className={styles.candles} viewBox="0 0 180 120" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M8 106Q34 88 61 103M119 103Q148 88 172 106M68 37h10v45H68zM102 37h10v45h-10zM73 13q-10 17 0 20q10-3 0-20ZM107 13q-10 17 0 20q10-3 0-20ZM73 33v4M107 33v4M64 82h18l-4 8H68zM98 82h18l-4 8h-10zM73 90v15l-12 7h24l-12-7M107 90v15l-12 7h24l-12-7" />
    </svg>
  </section>;
}
