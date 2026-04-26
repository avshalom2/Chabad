'use client';

import { useEffect, useState } from 'react';
import styles from './EventsBox.module.css';
import { formatHebrewDate } from '@/lib/hebrew-calendar';

const EVENT_TYPE_ICONS = {
  prayer: '🕍',
  lecture: '📖',
  class: '🎓',
  service: '🏛️',
  other: '📅',
};

export default function EventsBox() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('today');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [datesWithEvents, setDatesWithEvents] = useState(new Set());

  const fetchEventsForDate = async (date) => {
    setLoading(true);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await fetch(`/api/events?date=${dateStr}`);
      const data = await response.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventsForMonth = async (date) => {
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const response = await fetch(`/api/events/month?year=${year}&month=${month}`);
      const data = await response.json();

      const dates = new Set();
      data.forEach(event => {
        const d = new Date(event.event_date).getDate();
        dates.add(d);
      });
      setDatesWithEvents(dates);
    } catch (error) {
      console.error('Error fetching month events:', error);
    }
  };

  useEffect(() => {
    const today = new Date();

    if (mode === 'today') {
      fetchEventsForDate(today);
    } else if (mode === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      fetchEventsForDate(tomorrow);
    } else {
      fetchEventsForDate(selectedDate);
      fetchEventsForMonth(currentMonth);
    }
  }, [mode, selectedDate, currentMonth]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
  };

  const handleDateSelect = (day) => {
    const newDate = new Date(currentMonth);
    newDate.setDate(day);
    setSelectedDate(newDate);
  };

  const handlePrevMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentMonth(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonth(next);
  };

  const getDisplayDate = () => {
    const today = new Date();
    if (mode === 'today') return today;
    if (mode === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    return selectedDate;
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(day);

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className={styles.calendarContainer}>
        <div className={styles.calendarHeader}>
          <button onClick={handlePrevMonth} className={styles.navBtn}>{'>'}</button>
          <span className={styles.monthYear}>
            {currentMonth.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={handleNextMonth} className={styles.navBtn}>{'<'}</button>
        </div>

        <div className={styles.weekDays}>
          {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map(day => (
            <div key={day} className={styles.weekDay}>{day}</div>
          ))}
        </div>

        <div className={styles.calendarGrid}>
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className={styles.week}>
              {week.map((day, dayIdx) => (
                <button
                  key={dayIdx}
                  type="button"
                  className={`${styles.dayCell} ${
                    day === null ? styles.emptyDay : ''
                  } ${
                    day === selectedDate.getDate() &&
                    selectedDate.getMonth() === currentMonth.getMonth() &&
                    selectedDate.getFullYear() === currentMonth.getFullYear()
                      ? styles.selectedDay
                      : ''
                  } ${
                    datesWithEvents.has(day) ? styles.hasEvents : ''
                  }`}
                  onClick={() => day !== null && handleDateSelect(day)}
                  disabled={day === null}
                >
                  {day}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEventsList = () => {
    if (loading) {
      return <div className={styles.loading}>טוען אירועים...</div>;
    }

    if (events.length === 0) {
      return <div className={styles.noEvents}>אין אירועים ביום זה</div>;
    }

    return (
      <div className={styles.eventsList}>
        {events.map((event, idx) => (
          <div key={idx} className={styles.eventItem}>
            <div className={styles.eventTime}>{event.event_time.slice(0, 5)}</div>
            <div className={styles.eventDetails}>
              <div className={styles.eventIcon}>
                {EVENT_TYPE_ICONS[event.event_type] || EVENT_TYPE_ICONS.other}
              </div>
              <div className={styles.eventInfo}>
                <div className={styles.eventTitle}>{event.title}</div>
                {event.description && (
                  <div className={styles.eventDesc}>{event.description}</div>
                )}
                {event.location && (
                  <div className={styles.eventLocation}>{event.location}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const displayDate = getDisplayDate();
  const dateTitle = mode === 'today' ? 'אירועי היום' : mode === 'tomorrow' ? 'אירועי מחר' : 'אירועים ביום בחירה';

  return (
    <div className={styles.box}>
      <div className={styles.header}>
        <div className={styles.dateDisplay}>
          <div className={styles.dateLabel}>{dateTitle}</div>
          <div className={styles.hebrewDate}>{formatHebrewDate(displayDate)}</div>
        </div>

        <div className={styles.modeTabs}>
          <button
            className={`${styles.modeBtn} ${mode === 'today' ? styles.active : ''}`}
            onClick={() => handleModeChange('today')}
          >
            היום
          </button>
          <button
            className={`${styles.modeBtn} ${mode === 'tomorrow' ? styles.active : ''}`}
            onClick={() => handleModeChange('tomorrow')}
          >
            מחר
          </button>
          <button
            className={`${styles.modeBtn} ${mode === 'calendar' ? styles.active : ''}`}
            onClick={() => handleModeChange('calendar')}
          >
            בחר תאריך
            <span className={styles.calendarIcon}>📅</span>
          </button>
        </div>
      </div>

      {mode === 'calendar' && renderCalendar()}
      {renderEventsList()}
    </div>
  );
}
