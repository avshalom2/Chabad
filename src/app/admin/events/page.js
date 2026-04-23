'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

const emptyForm = {
  title: '',
  description: '',
  event_type: 'other',
  event_date: '',
  event_time: '',
  location: '',
  days_of_week: [],
  is_active: true,
};

export default function AdminEventsPage() {
  const [activeTab, setActiveTab] = useState('recurring');
  const [events, setEvents] = useState([]);
  const [recurringEvents, setRecurringEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [toast, setToast] = useState(null); // { message, type: 'success'|'error'|'warning' }
  const formRef = useRef(null);
  const toastTimer = useRef(null);

  const showToast = (message, type = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/events');
      const data = await response.json();
      setEvents(data.events || []);
      setRecurringEvents(data.recurringEvents || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleDayToggle = (dayIndex) => {
    setFormData(prev => {
      const updated = prev.days_of_week.includes(dayIndex)
        ? prev.days_of_week.filter(d => d !== dayIndex)
        : [...prev.days_of_week, dayIndex];
      return { ...prev, days_of_week: updated };
    });
  };

  const openAddForm = () => {
    setEditingId(null);
    setEditingType(null);
    setFormData(emptyForm);
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const handleEditEvent = (event) => {
    setEditingId(event.id);
    setEditingType('single');
    setFormData({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      event_date: event.event_date ? event.event_date.toString().slice(0, 10) : '',
      event_time: event.event_time,
      location: event.location || '',
      days_of_week: [],
      is_active: true,
    });
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const handleEditRecurringEvent = (event) => {
    setEditingId(event.id);
    setEditingType('recurring');
    let rawDays = event.days_of_week;
    if (typeof rawDays === 'string') { try { rawDays = JSON.parse(rawDays); } catch { rawDays = []; } }
    const numericDays = Array.isArray(rawDays)
      ? rawDays.map(d => typeof d === 'string' ? parseInt(d, 10) : d).filter(d => !isNaN(d))
      : [];
    setFormData({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      event_date: '',
      event_time: event.event_time,
      location: event.location || '',
      days_of_week: numericDays,
      is_active: event.is_active === 1 || event.is_active === true,
    });
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setEditingType(null);
    setFormData(emptyForm);
  };

  const handleSubmitSingle = async (e) => {
    e.preventDefault();
    const isEdit = !!editingId;
    const url = isEdit ? `/api/admin/events/${editingId}` : '/api/admin/events';
    const method = isEdit ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type: 'single' }),
      });
      if (res.ok) {
        showToast(isEdit ? 'האירוע עודכן בהצלחה' : 'האירוע נוסף בהצלחה');
        if (!isEdit) handleCancelForm();
        fetchEvents();
      } else {
        const err = await res.json();
        console.error(err);
        showToast('שגיאה בשמירת האירוע', 'error');
      }
    } catch (e) { console.error(e); showToast('שגיאה בשמירת האירוע', 'error'); }
  };

  const handleSubmitRecurring = async (e) => {
    e.preventDefault();
    if (formData.days_of_week.length === 0) { showToast('אנא בחר לפחות יום אחד', 'warning'); return; }
    const isEdit = !!editingId;
    const url = isEdit ? `/api/admin/events/recurring/${editingId}` : '/api/admin/events';
    const method = isEdit ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type: 'recurring' }),
      });
      if (res.ok) {
        showToast(isEdit ? 'האירוע החוזר עודכן בהצלחה' : 'האירוע החוזר נוסף בהצלחה');
        if (!isEdit) handleCancelForm();
        fetchEvents();
      } else {
        const err = await res.json();
        console.error(err);
        showToast('שגיאה בשמירת האירוע החוזר', 'error');
      }
    } catch (e) { console.error(e); showToast('שגיאה בשמירת האירוע החוזר', 'error'); }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק אירוע זה?')) return;
    const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
    if (res.ok) { showToast('האירוע נמחק בהצלחה'); fetchEvents(); }
    else { showToast('שגיאה במחיקת האירוע', 'error'); }
  };

  const handleDeleteRecurring = async (id) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק אירוע חוזר זה?')) return;
    const res = await fetch(`/api/admin/events/recurring/${id}`, { method: 'DELETE' });
    if (res.ok) { showToast('האירוע החוזר נמחק בהצלחה'); fetchEvents(); }
    else { showToast('שגיאה במחיקת האירוע החוזר', 'error'); }
  };

  const handleToggleStatus = async (id) => {
    const res = await fetch(`/api/admin/events/recurring/${id}/toggle`, { method: 'PATCH' });
    if (res.ok) { fetchEvents(); } else { showToast('שגיאה בעדכון הסטטוס', 'error'); }
  };

  const getDaysLabel = (days_of_week) => {
    let d = days_of_week;
    if (typeof d === 'string') { try { d = JSON.parse(d); } catch { return ''; } }
    if (!Array.isArray(d)) return '';
    return d.map(i => days[typeof i === 'string' ? parseInt(i, 10) : i]).join(', ');
  };

  const isSingleTab = activeTab === 'single';

  return (
    <div className={styles.container}>
      <h1>ניהול אירועים</h1>

      {/* Toast notification */}
      {toast && (
        <div className={`${styles.toast} ${styles[`toast_${toast.type}`]}`}>
          {toast.message}
          <button className={styles.toastClose} onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tab} ${activeTab === 'recurring' ? styles.active : ''}`}
          onClick={() => { setActiveTab('recurring'); handleCancelForm(); }}
        >
          אירועים חוזרים
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'single' ? styles.active : ''}`}
          onClick={() => { setActiveTab('single'); handleCancelForm(); }}
        >
          אירועים חד פעמיים
        </button>
      </div>

      {/* Inline form — shown when adding or editing */}
      {showForm && (
        <div className={styles.formContainer} ref={formRef}>
          {isSingleTab ? (
            <form onSubmit={handleSubmitSingle} className={styles.form}>
              <h2>{editingId ? 'עריכת אירוע חד פעמי' : 'הוספת אירוע חד פעמי'}</h2>
              <div className={styles.formGroup}>
                <label>כותרת *</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="כותרת האירוע" required />
              </div>
              <div className={styles.formGroup}>
                <label>תיאור</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="תיאור האירוע" rows="3" />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>סוג אירוע</label>
                  <select name="event_type" value={formData.event_type} onChange={handleInputChange}>
                    <option value="other">אחר</option>
                    <option value="prayer">תפילה</option>
                    <option value="lecture">הרצאה</option>
                    <option value="class">שיעור</option>
                    <option value="service">שירות</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>תאריך *</label>
                  <input type="date" name="event_date" value={formData.event_date} onChange={handleInputChange} required />
                </div>
                <div className={styles.formGroup}>
                  <label>שעה *</label>
                  <input type="time" name="event_time" value={formData.event_time} onChange={handleInputChange} required />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>מיקום</label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="מיקום האירוע" />
              </div>
              <div className={styles.formActions}>
                <button type="submit" className={styles.submitBtn}>{editingId ? 'עדכן אירוע' : 'הוסף אירוע'}</button>
                <button type="button" className={styles.cancelBtn} onClick={handleCancelForm}>בטל</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitRecurring} className={styles.form}>
              <h2>{editingId ? 'עריכת אירוע חוזר' : 'הוספת אירוע חוזר'}</h2>
              <div className={styles.formGroup}>
                <label>כותרת *</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="כותרת האירוע" required />
              </div>
              <div className={styles.formGroup}>
                <label>תיאור</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="תיאור האירוע" rows="3" />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>סוג אירוע</label>
                  <select name="event_type" value={formData.event_type} onChange={handleInputChange}>
                    <option value="other">אחר</option>
                    <option value="prayer">תפילה</option>
                    <option value="lecture">הרצאה</option>
                    <option value="class">שיעור</option>
                    <option value="service">שירות</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>שעה *</label>
                  <input type="time" name="event_time" value={formData.event_time} onChange={handleInputChange} required />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>מיקום</label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="מיקום האירוע" />
              </div>
              <div className={styles.formGroup}>
                <label>בחר ימים בשבוע *</label>
                <div className={styles.daysGrid}>
                  {days.map((day, idx) => (
                    <label key={idx} className={styles.dayCheckbox}>
                      <input type="checkbox" checked={formData.days_of_week.includes(idx)} onChange={() => handleDayToggle(idx)} />
                      {day}
                    </label>
                  ))}
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} />
                  האירוע פעיל (יוצג בעמוד הבית)
                </label>
              </div>
              <div className={styles.formActions}>
                <button type="submit" className={styles.submitBtn}>{editingId ? 'עדכן אירוע חוזר' : 'הוסף אירוע חוזר'}</button>
                <button type="button" className={styles.cancelBtn} onClick={handleCancelForm}>בטל</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Events list */}
      <div className={styles.listSection}>
        <div className={styles.listHeader}>
          <h2>{isSingleTab ? 'אירועים חד פעמיים' : 'אירועים חוזרים'}</h2>
          {!showForm && (
            <button className={styles.addBtn} onClick={openAddForm}>
              + הוספת אירוע
            </button>
          )}
        </div>

        {isSingleTab ? (
          events.length === 0 ? (
            <p className={styles.emptyMsg}>אין אירועים חד פעמיים</p>
          ) : (
            <table className={styles.eventsTable}>
              <thead>
                <tr>
                  <th>כותרת</th>
                  <th>תאריך</th>
                  <th>שעה</th>
                  <th>סוג</th>
                  <th>מיקום</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id} className={editingId === event.id ? styles.editingRow : ''}>
                    <td>{event.title}</td>
                    <td>{event.event_date ? new Date(event.event_date).toLocaleDateString('he-IL') : ''}</td>
                    <td>{event.event_time}</td>
                    <td>{event.event_type}</td>
                    <td>{event.location}</td>
                    <td className={styles.actionCell}>
                      <button className={styles.editBtn} onClick={() => handleEditEvent(event)}>ערוך</button>
                      <button className={styles.deleteBtn} onClick={() => handleDeleteEvent(event.id)}>מחק</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          recurringEvents.length === 0 ? (
            <p className={styles.emptyMsg}>אין אירועים חוזרים</p>
          ) : (
            <table className={styles.eventsTable}>
              <thead>
                <tr>
                  <th>כותרת</th>
                  <th>שעה</th>
                  <th>ימים</th>
                  <th>סוג</th>
                  <th>מיקום</th>
                  <th>סטטוס</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {recurringEvents.map(event => (
                  <tr key={event.id} className={editingId === event.id ? styles.editingRow : ''}>
                    <td>{event.title}</td>
                    <td>{event.event_time}</td>
                    <td>{getDaysLabel(event.days_of_week)}</td>
                    <td>{event.event_type}</td>
                    <td>{event.location}</td>
                    <td>
                      <span className={event.is_active ? styles.statusActive : styles.statusInactive}>
                        {event.is_active ? 'פעיל' : 'לא פעיל'}
                      </span>
                    </td>
                    <td className={styles.actionCell}>
                      <button className={styles.editBtn} onClick={() => handleEditRecurringEvent(event)}>ערוך</button>
                      <button className={styles.toggleBtn} onClick={() => handleToggleStatus(event.id)}>
                        {event.is_active ? 'השבת' : 'הפעל'}
                      </button>
                      <button className={styles.deleteBtn} onClick={() => handleDeleteRecurring(event.id)}>מחק</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}
