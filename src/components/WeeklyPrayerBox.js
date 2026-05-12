'use client';

import { useEffect, useState } from 'react';
import styles from './WeeklyPrayerBox.module.css';

const prayerLabels = {
  shacharit: { title: 'שחרית', icon: '🌅', tone: 'shacharit' },
  mincha: { title: 'מנחה', icon: '☀️', tone: 'mincha' },
  maariv: { title: 'ערבית', icon: '🌙', tone: 'maariv' },
};

const groupLabels = {
  sun_thu: "א׳-ה׳",
  friday: 'שישי',
  shabbat: 'שבת',
  motzei_shabbat: 'מוצאי שבת',
  sunset: 'מנחה (לפני שקיעה)',
};

const displayOrder = {
  shacharit: ['sun_thu', 'friday', 'shabbat'],
  mincha: ['sun_thu', 'friday', 'shabbat'],
  maariv: ['sun_thu', 'motzei_shabbat'],
};

const columnOrder = ['shacharit', 'mincha', 'maariv'];

function groupTimes(times) {
  return (times || []).reduce((acc, time) => {
    if (!acc[time.prayer_type]) acc[time.prayer_type] = {};
    if (!acc[time.prayer_type][time.day_group]) acc[time.prayer_type][time.day_group] = [];
    acc[time.prayer_type][time.day_group].push(time);
    return acc;
  }, {});
}

function formatDateRange(schedule) {
  const hebrewFrom = schedule.hebrew_date_from;
  const hebrewTo = schedule.hebrew_date_to;
  const month = schedule.hebrew_month;

  if (hebrewFrom && hebrewTo && month) return `${hebrewFrom}-${hebrewTo} ${month}`;
  if (hebrewFrom && month) return `${hebrewFrom} ${month}`;
  return '';
}

function formatGregorianRange(schedule) {
  const formatter = new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const shortFormatter = new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
  });

  if (schedule.gregorian_date_from && schedule.gregorian_date_to) {
    const from = new Date(schedule.gregorian_date_from);
    const to = new Date(schedule.gregorian_date_to);

    if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime())) {
      const sameMonth = from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear();
      return sameMonth
        ? `${shortFormatter.format(from)}-${formatter.format(to)}`
        : `${formatter.format(from)} - ${formatter.format(to)}`;
    }
  }

  if (schedule.gregorian_date_from) {
    const from = new Date(schedule.gregorian_date_from);
    if (!Number.isNaN(from.getTime())) return formatter.format(from);
  }

  return '';
}

function sortPrayerTimes(times) {
  return [...(times || [])].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
}

function formatUpdatedAt(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function buildShareText(schedule, grouped, sunsetTimes) {
  const lines = [
    `זמני תפילה - פרשת ${schedule.parasha_name || 'השבוע'}`,
  ];

  const dateRange = formatDateRange(schedule);
  const gregorianRange = formatGregorianRange(schedule);
  if (dateRange || gregorianRange) {
    lines.push([dateRange, gregorianRange].filter(Boolean).join(' | '));
  }

  columnOrder.forEach((prayerKey) => {
    const prayer = prayerLabels[prayerKey];
    const groups = grouped[prayerKey] || {};
    const groupLines = (displayOrder[prayerKey] || [])
      .filter((groupKey) => groups[groupKey]?.length)
      .map((groupKey) => {
        const times = sortPrayerTimes(groups[groupKey])
          .map((time) => `${time.time_value}${time.note ? ` ${time.note}` : ''}`)
          .join(', ');
        return `${groupLabels[groupKey]}: ${times}`;
      });

    if (groupLines.length) {
      lines.push('', prayer.title, ...groupLines);
    }
  });

  if (sunsetTimes.length) {
    lines.push('', `${groupLabels.sunset}: ${sunsetTimes.map((time) => time.time_value).join(', ')}`);
  }

  return lines.join('\n');
}

export default function WeeklyPrayerBox() {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/weekly-prayers')
      .then((res) => res.json())
      .then((data) => setSchedule(data.schedule || null))
      .catch((error) => {
        console.error('Error rendering weekly prayer box:', error);
        setSchedule(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!schedule) return null;

  const grouped = groupTimes(schedule.times);
  const sunsetTimes = sortPrayerTimes(grouped.mincha?.sunset);
  const updatedTime = formatUpdatedAt(schedule.updated_at);
  const hasTimes = (schedule.times || []).length > 0;
  if (!hasTimes && !schedule.parasha_name) return null;

  const handleShare = () => {
    const text = buildShareText(schedule, grouped, sunsetTimes);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className={styles.section} dir="rtl" aria-label="זמני תפילה לשבוע הקרוב">
      <div className={styles.card}>
        <header className={styles.header}>
          <div className={styles.headerMeta}>
            <h2>זמני תפילה</h2>
            <p className={styles.dateLine}>
              {formatDateRange(schedule)}
              {formatDateRange(schedule) && formatGregorianRange(schedule) ? '  |  ' : ''}
              {formatGregorianRange(schedule)}
            </p>
          </div>
          <div className={styles.badge}>
            פרשת {schedule.parasha_name || 'השבוע'}
          </div>
          <div className={styles.star} aria-hidden="true">✡</div>
        </header>

        <div className={styles.prayers}>
          {columnOrder.map((prayerKey) => {
            const prayer = prayerLabels[prayerKey];
            const groups = grouped[prayerKey] || {};
            const orderedGroups = (displayOrder[prayerKey] || []).filter((groupKey) => groups[groupKey]?.length);

            if (orderedGroups.length === 0) return null;

            return (
              <div className={styles.prayerColumn} key={prayerKey}>
                <h3 className={styles[prayer.tone]}>
                  <span>{prayer.title}</span>
                  <span className={styles.prayerIcon} aria-hidden="true">{prayer.icon}</span>
                </h3>
                {orderedGroups.map((groupKey) => {
                  const times = sortPrayerTimes(groups[groupKey]);

                  return (
                    <div className={styles.timeGroup} key={groupKey}>
                      <div className={styles.groupLabel}>{groupLabels[groupKey]}</div>
                      {times.map((time) => (
                        <div className={styles.timeItem} key={`${time.time_value}-${time.note}-${time.sort_order}`}>
                          <strong>{time.time_value}</strong>
                          {time.note && <span>{time.note}</span>}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {sunsetTimes.length > 0 && (
          <div className={styles.sunsetRow}>
            <div className={styles.sunsetLabel}>
              <span aria-hidden="true">🌇</span>
              <span>{groupLabels.sunset}</span>
            </div>
            <strong>{sunsetTimes.map((time) => time.time_value).join(', ')}</strong>
          </div>
        )}

        <footer className={styles.footer}>
          <button type="button" className={styles.share} onClick={handleShare}>
            שתף ←
          </button>
          <span className={styles.updated}>
            <span className={styles.statusDot} aria-hidden="true" />
            {updatedTime ? `עודכן היום, ${updatedTime}` : 'מעודכן לשבוע הנוכחי'}
          </span>
        </footer>
      </div>
    </section>
  );
}
