'use client';
import { useEffect, useState } from 'react';
import styles from './TorahReadingBox.module.css';

export default function TorahReadingBox() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://www.hebcal.com/shabbat?cfg=json&city=Tel+Aviv')
      .then(r => r.json())
      .then(json => {
        const items = json.items || [];

        // Prefer a parashat item, fallback to first holiday with leyning
        const parasha = items.find(i => i.category === 'parashat');
        const holidayWithLeyning = items.find(
          i => i.category === 'holiday' && i.leyning
        );
        const source = parasha || holidayWithLeyning;

        if (!source) { setLoading(false); return; }

        const leyning = source.leyning || {};
        setData({
          name: source.hebrew || source.title_orig || source.title,
          hdate: source.hdate || null,
          isHoliday: source.category === 'holiday',
          torah: leyning.torah || null,
          haftarah: leyning.haftarah || null,
          maftir: leyning.maftir || null,
          aliyot: [1,2,3,4,5,6,7]
            .filter(n => leyning[n])
            .map(n => ({ num: n, ref: leyning[n] })),
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className={styles.box}>
      <div className={styles.loading}>טוען קריאת התורה...</div>
    </div>
  );

  if (!data) return null;

  const aliyotLabels = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שביעי'];

  return (
    <div className={styles.box}>
      <div className={styles.header}>
        <span className={styles.icon}>📖</span>
        <h3 className={styles.title}>
          {data.isHoliday ? 'קריאת חג' : 'פרשת השבוע'}
        </h3>
      </div>

      <p className={styles.parashaName}>{data.name}</p>
      {data.hdate && <p className={styles.hdate}>{data.hdate}</p>}

      {data.torah && (
        <div className={styles.readingRow}>
          <span className={styles.readingLabel}>קריאת התורה</span>
          <span className={styles.readingValue}>{data.torah}</span>
        </div>
      )}

      {data.haftarah && (
        <div className={styles.readingRow}>
          <span className={styles.readingLabel}>הפטרה</span>
          <span className={styles.readingValue}>{data.haftarah}</span>
        </div>
      )}

      {data.maftir && (
        <div className={styles.readingRow}>
          <span className={styles.readingLabel}>מפטיר</span>
          <span className={styles.readingValue}>{data.maftir}</span>
        </div>
      )}

      {data.aliyot.length > 0 && (
        <div className={styles.aliyotSection}>
          <p className={styles.aliyotTitle}>עליות</p>
          <div className={styles.aliyotGrid}>
            {data.aliyot.map(a => (
              <div key={a.num} className={styles.aliyaRow}>
                <span className={styles.aliyaLabel}>{aliyotLabels[a.num - 1]}</span>
                <span className={styles.aliyaRef}>{a.ref}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
