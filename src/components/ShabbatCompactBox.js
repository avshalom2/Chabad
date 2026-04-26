'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './ShabbatCompactBox.module.css';

function getTimeFromTitle(title) {
  if (!title) return null;
  return title.split(': ').pop();
}

export default function ShabbatCompactBox() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://www.hebcal.com/shabbat?cfg=json&city=Tel+Aviv')
      .then(r => r.json())
      .then(json => {
        const items = json.items || [];
        const candles = items.find(i => i.category === 'candles');
        const havdalah = items.find(i => i.category === 'havdalah');
        const parashah = items.find(i => i.category === 'parashat');

        setData({
          candleTime: getTimeFromTitle(candles?.title),
          havdalahTime: getTimeFromTitle(havdalah?.title),
          parashah: parashah?.hebrew || parashah?.title?.replace('Parashat ', '') || null,
        });
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.box} dir="rtl">
        <div className={styles.loading}>טוען זמני שבת...</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={styles.box} dir="rtl">
      <div className={styles.identity}>
        <span className={styles.icon} aria-hidden="true">
          <span />
          <span />
        </span>
        <div className={styles.titleGroup}>
          <div className={styles.title}>שבת הקרובה</div>
          {data.parashah && <div className={styles.parashah}>{data.parashah}</div>}
        </div>
      </div>

      <div className={styles.timeGroup}>
        <div className={styles.timeBlock}>
          <div className={styles.label}>כניסת שבת</div>
          <div className={styles.time}>{data.candleTime || '--:--'}</div>
        </div>

        <div className={styles.divider} aria-hidden="true" />

        <div className={styles.timeBlock}>
          <div className={styles.label}>יציאת שבת</div>
          <div className={styles.time}>{data.havdalahTime || '--:--'}</div>
        </div>
      </div>

      <Link className={styles.allTimes} href="/shabbat-times">
        <span className={styles.arrow} aria-hidden="true">‹</span>
        <span>לכל הזמנים</span>
      </Link>
    </div>
  );
}
