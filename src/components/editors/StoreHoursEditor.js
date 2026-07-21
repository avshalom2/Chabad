'use client';

import { useEffect, useState } from 'react';
import styles from './editors.module.css';

const defaults = { title: 'שעות פתיחת החנות', days: "ימים א׳-ה׳", hours: '10:00–19:00', badge: 'מיקום מומלץ' };

export default function StoreHoursEditor({ onSave, onClose }) {
  const [values, setValues] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings?keys=store_hours').then((response) => response.json())
      .then((data) => setValues({ ...defaults, ...(data.data?.store_hours || {}) }))
      .catch((error) => console.error('Error loading store hours:', error)).finally(() => setLoading(false));
  }, []);

  const update = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }));
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings/store_hours', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value: values }) });
      if (!response.ok) throw new Error('Failed to save store hours');
      onSave('<storehours></storehours>');
    } catch (error) {
      console.error('Error saving store hours:', error);
      alert('לא ניתן לשמור את שעות הפתיחה. נסו שוב.');
    } finally { setSaving(false); }
  };

  if (loading) return <div className={styles.loading}>טוען שעות פתיחה...</div>;
  return <div className={styles.editor}>
    <div className={styles.formGroup}><label htmlFor="store-hours-title">כותרת</label><input id="store-hours-title" className={styles.input} value={values.title} onChange={update('title')} /></div>
    <div className={styles.formGroup}><label htmlFor="store-hours-days">ימי פעילות</label><input id="store-hours-days" className={styles.input} value={values.days} onChange={update('days')} placeholder="לדוגמה: ימים א׳-ה׳" /></div>
    <div className={styles.formGroup}><label htmlFor="store-hours-time">שעות</label><input id="store-hours-time" className={styles.input} value={values.hours} onChange={update('hours')} placeholder="לדוגמה: 10:00–19:00" /></div>
    <div className={styles.formGroup}><label htmlFor="store-hours-badge">טקסט בתגית (אפשר להשאיר ריק)</label><input id="store-hours-badge" className={styles.input} value={values.badge} onChange={update('badge')} /></div>
    <div className={styles.actions}><button type="button" className={styles.cancelBtn} onClick={onClose}>ביטול</button><button type="button" className={styles.saveBtn} onClick={handleSave} disabled={saving}>{saving ? 'שומר...' : 'שמירת שעות והוספת הרכיב'}</button></div>
  </div>;
}
