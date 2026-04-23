'use client';
import { useEffect, useState } from 'react';
import styles from './ShabbatBox.module.css';

export default function ShabbatBox() {
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

        const candleTime = candles?.title?.split(': ').pop();
        const havdalahTime = havdalah?.title?.split(': ').pop();
        const parashatName = parashah?.hebrew || parashah?.title?.replace('Parashat ', '') || null;

        const rows = [];
        if (candleTime) rows.push({ label: 'הדלקת נרות', time: candleTime });
        if (havdalahTime) rows.push({ label: 'הבדלה / צאת חג', time: havdalahTime });

        setData({ rows, parashah: parashatName, location: json.location?.title || 'Tel Aviv' });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className={styles.box}>
      <div className={styles.loading}>טוען זמני שבת...</div>
    </div>
  );

  if (!data) return null;

  return (
    <div className={styles.box}>
      {/* Parashah */}
      {data.parashah && (
        <div className={styles.parashaRow}>
          <span className={styles.parashaName}>{data.parashah}</span>
          <span className={styles.parashaLabel}>פרשת השבוע:</span>
        </div>
      )}

      {/* Table */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>תפילה / זמן</th>
            <th>שעה</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, i) => (
            <tr key={i}>
              <td>{row.label}</td>
              <td className={styles.timeCell}>{row.time}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.locationBar}>{data.location}</div>
    </div>
  );
}
