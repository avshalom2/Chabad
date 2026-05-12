'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './weekly-prayers.module.css';

const emptySchedule = {
  parasha_name: '',
  hebrew_date_from: '',
  hebrew_date_to: '',
  hebrew_month: '',
  gregorian_date_from: '',
  gregorian_date_to: '',
  times: [],
};

const prayers = [
  { key: 'shacharit', title: 'שחרית', icon: '☀', tone: 'shacharit' },
  { key: 'mincha', title: 'מנחה', icon: '◐', tone: 'mincha' },
  { key: 'maariv', title: 'ערבית', icon: '☾', tone: 'maariv' },
];

const dayGroups = [
  { key: 'sun_thu', label: "א׳ - ה׳" },
  { key: 'friday', label: 'שישי' },
  { key: 'shabbat', label: 'שבת' },
  { key: 'motzei_shabbat', label: 'מוצאי שבת' },
  { key: 'sunset', label: 'לפני שקיעה' },
];

const parashaOptions = [
  'בראשית', 'נח', 'לך לך', 'וירא', 'חיי שרה', 'תולדות', 'ויצא', 'וישלח',
  'וישב', 'מקץ', 'ויגש', 'ויחי', 'שמות', 'וארא', 'בא', 'בשלח', 'יתרו',
  'משפטים', 'תרומה', 'תצוה', 'כי תשא', 'ויקהל', 'פקודי', 'ויקרא', 'צו',
  'שמיני', 'תזריע', 'מצורע', 'אחרי מות', 'קדושים', 'אמור', 'בהר', 'בחוקותי',
  'במדבר', 'נשא', 'בהעלותך', 'שלח', 'קרח', 'חקת', 'בלק', 'פינחס', 'מטות',
  'מסעי', 'דברים', 'ואתחנן', 'עקב', 'ראה', 'שופטים', 'כי תצא', 'כי תבוא',
  'נצבים', 'וילך', 'האזינו', 'וזאת הברכה',
];

const hebrewMonths = [
  'תשרי',
  'חשוון',
  'כסלו',
  'טבת',
  'שבט',
  'אדר',
  'אדר א׳',
  'אדר ב׳',
  'ניסן',
  'אייר',
  'סיוון',
  'תמוז',
  'אב',
  'אלול',
];

export default function WeeklyPrayersAdminPage() {
  const [schedule, setSchedule] = useState(emptySchedule);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetch('/api/admin/weekly-prayers')
      .then((res) => res.json())
      .then((data) => setSchedule({ ...emptySchedule, ...(data.schedule || {}) }))
      .catch(() => setToast({ type: 'error', message: 'שגיאה בטעינת זמני התפילה' }))
      .finally(() => setLoading(false));
  }, []);

  const groupedTimes = useMemo(() => {
    const groups = {};
    prayers.forEach((prayer) => {
      groups[prayer.key] = {};
      dayGroups.forEach((day) => {
        groups[prayer.key][day.key] = [];
      });
    });

    (schedule.times || []).forEach((time, index) => {
      if (!groups[time.prayer_type]) return;
      if (!groups[time.prayer_type][time.day_group]) groups[time.prayer_type][time.day_group] = [];
      groups[time.prayer_type][time.day_group].push({ ...time, _index: index });
    });

    Object.values(groups).forEach((prayerGroups) => {
      Object.values(prayerGroups).forEach((times) => {
        times.sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
      });
    });

    return groups;
  }, [schedule.times]);

  const updateField = (field, value) => {
    setSchedule((current) => ({ ...current, [field]: value }));
  };

  const updateTime = (targetIndex, field, value) => {
    setSchedule((current) => ({
      ...current,
      times: (current.times || []).map((time, index) => (
        index === targetIndex ? { ...time, [field]: value } : time
      )),
    }));
  };

  const addTime = (prayerType, dayGroup) => {
    setSchedule((current) => {
      const siblings = (current.times || []).filter(
        (time) => time.prayer_type === prayerType && time.day_group === dayGroup
      );

      return {
        ...current,
        times: [
          ...(current.times || []),
          {
            prayer_type: prayerType,
            day_group: dayGroup,
            time_value: '08:00',
            note: '',
            sort_order: siblings.length,
          },
        ],
      };
    });
  };

  const deleteTime = (targetIndex) => {
    setSchedule((current) => ({
      ...current,
      times: (current.times || []).filter((_, index) => index !== targetIndex),
    }));
  };

  const saveSchedule = async () => {
    setSaving(true);
    setToast(null);

    try {
      const res = await fetch('/api/admin/weekly-prayers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');

      setSchedule({ ...emptySchedule, ...(data.schedule || {}) });
      setToast({ type: 'success', message: 'הנתונים נשמרו בהצלחה' });
    } catch (error) {
      console.error(error);
      setToast({ type: 'error', message: 'שגיאה בשמירת הנתונים' });
    } finally {
      setSaving(false);
    }
  };

  const clearSchedule = async () => {
    if (!window.confirm('למחוק את נתוני השבוע הנוכחי?')) return;

    setSaving(true);
    setToast(null);

    try {
      const res = await fetch('/api/admin/weekly-prayers', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');

      setSchedule({ ...emptySchedule, ...(data.schedule || {}) });
      setToast({ type: 'success', message: 'הנתונים נמחקו' });
    } catch (error) {
      console.error(error);
      setToast({ type: 'error', message: 'שגיאה במחיקת הנתונים' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>טוען זמני תפילה...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>ניהול נתוני הבית</p>
          <h1>זמני תפילה ופרשת השבוע</h1>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.secondaryBtn} onClick={clearSchedule} disabled={saving}>
            מחק נתונים
          </button>
          <button type="button" className={styles.primaryBtn} onClick={saveSchedule} disabled={saving}>
            {saving ? 'שומר...' : 'שמור עדכון'}
          </button>
        </div>
      </div>

      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.message}
        </div>
      )}

      <section className={styles.weekPanel}>
        <div className={styles.fieldGroup}>
          <label>שם הפרשה</label>
          <input
            list="parasha-options"
            value={schedule.parasha_name}
            onChange={(e) => updateField('parasha_name', e.target.value)}
            placeholder="לדוגמה: במדבר"
          />
          <datalist id="parasha-options">
            {parashaOptions.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>
        <div className={styles.fieldGroup}>
          <label>תאריך עברי מ...</label>
          <input
            value={schedule.hebrew_date_from}
            onChange={(e) => updateField('hebrew_date_from', e.target.value)}
            placeholder="כ״ג"
          />
        </div>
        <div className={styles.fieldGroup}>
          <label>תאריך עברי עד...</label>
          <input
            value={schedule.hebrew_date_to}
            onChange={(e) => updateField('hebrew_date_to', e.target.value)}
            placeholder="כ״ט"
          />
        </div>
        <div className={styles.fieldGroup}>
          <label>חודש עברי</label>
          <select
            value={schedule.hebrew_month}
            onChange={(e) => updateField('hebrew_month', e.target.value)}
          >
            <option value="">בחר חודש</option>
            {schedule.hebrew_month && !hebrewMonths.includes(schedule.hebrew_month) && (
              <option value={schedule.hebrew_month}>{schedule.hebrew_month}</option>
            )}
            {hebrewMonths.map((month) => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
        <div className={styles.fieldGroup}>
          <label>תאריך לועזי מ...</label>
          <input
            type="date"
            value={schedule.gregorian_date_from}
            onChange={(e) => updateField('gregorian_date_from', e.target.value)}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label>תאריך לועזי עד...</label>
          <input
            type="date"
            value={schedule.gregorian_date_to}
            onChange={(e) => updateField('gregorian_date_to', e.target.value)}
          />
        </div>
      </section>

      <section className={styles.prayerGrid}>
        {prayers.map((prayer) => (
          <article key={prayer.key} className={styles.prayerCard}>
            <header className={`${styles.cardHeader} ${styles[prayer.tone]}`}>
              <span>{prayer.icon}</span>
              <h2>{prayer.title}</h2>
            </header>

            <div className={styles.cardBody}>
              {dayGroups.map((day) => {
                const times = groupedTimes[prayer.key]?.[day.key] || [];

                return (
                  <div key={day.key} className={styles.dayGroup}>
                    <div className={styles.dayLabel}>{day.label}</div>
                    <div className={styles.timeRows}>
                      {times.map((time) => (
                        <div key={`${time.prayer_type}-${time.day_group}-${time._index}`} className={styles.timeRow}>
                          <input
                            type="time"
                            value={time.time_value}
                            onChange={(e) => updateTime(time._index, 'time_value', e.target.value)}
                          />
                          <input
                            value={time.note}
                            onChange={(e) => updateTime(time._index, 'note', e.target.value)}
                            placeholder="הערה"
                          />
                          <button type="button" onClick={() => deleteTime(time._index)} className={styles.deleteTimeBtn}>
                            מחק
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addTime(prayer.key, day.key)} className={styles.addTimeBtn}>
                        + הוסף שעה
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
