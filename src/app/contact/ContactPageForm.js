'use client';

import { useState } from 'react';
import styles from './contact.module.css';

const initialForm = {
  name: '',
  phone: '',
  email: '',
  message: '',
  company: '',
};

export default function ContactPageForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (status === 'sent' || status === 'error') { setStatus('idle'); setError(''); }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          subject: 'פנייה מעמוד צור קשר',
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error('ההודעה לא נשלחה. נסו שוב או צרו איתנו קשר בטלפון.');
      if (!data.success) throw new Error('לא התקבל אישור שליחה. נסו שוב.');

      setForm(initialForm);
      setStatus('sent');
    } catch (sendError) {
      setError(sendError instanceof TypeError ? 'לא הצלחנו להתחבר. בדקו את החיבור ונסו שוב.' : sendError.message || 'לא הצלחנו לשלוח את ההודעה');
      setStatus('error');
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-busy={status === 'sending'}>
      <label>
        <span>שם מלא <small>(חובה)</small></span>
        <input
          required
          name="name"
          placeholder="איך קוראים לכם?"
          maxLength={120}
          value={form.name}
          onChange={(event) => updateField('name', event.target.value)}
          autoComplete="name"
        />
      </label>

      <label>
        <span>טלפון <small>(לא חובה)</small></span>
        <input
          type="tel"
          name="phone"
          dir="ltr"
          placeholder="מספר לחזרה"
          maxLength={80}
          value={form.phone}
          onChange={(event) => updateField('phone', event.target.value)}
          autoComplete="tel"
          inputMode="tel"
        />
      </label>

      <label className={styles.emailField}>
        <span>כתובת אימייל <small>(חובה)</small></span>
        <input
          required
          type="email"
          name="email"
          dir="ltr"
          placeholder="name@example.com"
          maxLength={180}
          value={form.email}
          onChange={(event) => updateField('email', event.target.value)}
          autoComplete="email"
        />
      </label>

      <label className={styles.messageField}>
        <span>במה נוכל לעזור? <small>(חובה)</small></span>
        <textarea
          required
          name="message"
          placeholder="מוזמנים לכתוב לנו שאלה, בקשה או כל דבר שתרצו לשתף..."
          maxLength={4000}
          rows={4}
          value={form.message}
          onChange={(event) => updateField('message', event.target.value)}
        />
      </label>

      <label className={styles.honeypot} aria-hidden="true">
        Company
        <input
          tabIndex={-1}
          value={form.company}
          onChange={(event) => updateField('company', event.target.value)}
          autoComplete="off"
        />
      </label>

      <div className={styles.formActions}>
        <button type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'שולחים את ההודעה...' : 'שליחת הודעה'}<span aria-hidden="true">←</span>
        </button>
        <p className={styles.formNote}>השדות המסומנים „חובה” נדרשים לשליחה.</p>
        <div className={styles.formStatus} role="status" aria-live="polite">{status === 'sent' && <p className={styles.success}>תודה שפניתם אלינו! ההודעה נשלחה בהצלחה.</p>}</div>
        {status === 'error' && <p className={styles.error} role="alert">{error}</p>}
      </div>
    </form>
  );
}
