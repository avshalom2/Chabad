'use client';

import { useState } from 'react';
import styles from './ContactForm.module.css';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  company: '',
};

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('sending');
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Failed to send message');

      setForm(initialForm);
      setStatus('sent');
    } catch (sendError) {
      setError(sendError.message || 'Failed to send message');
      setStatus('error');
    }
  };

  return (
    <section className={styles.section} dir="rtl" aria-label="טופס יצירת קשר">
      <form className={styles.form} onSubmit={handleSubmit}>
        <header className={styles.header}>
          <h2>יצירת קשר</h2>
          <p>נשמח לחזור אליכם בהקדם</p>
        </header>

        <div className={styles.grid}>
          <label>
            <span>שם מלא</span>
            <input
              required
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              autoComplete="name"
            />
          </label>

          <label>
            <span>אימייל</span>
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              autoComplete="email"
            />
          </label>

          <label>
            <span>טלפון</span>
            <input
              value={form.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              autoComplete="tel"
              inputMode="tel"
            />
          </label>

          <label>
            <span>נושא</span>
            <input
              value={form.subject}
              onChange={(event) => updateField('subject', event.target.value)}
            />
          </label>
        </div>

        <label className={styles.messageField}>
          <span>הודעה</span>
          <textarea
            required
            rows={5}
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

        <div className={styles.footer}>
          <button type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'שולח...' : 'שליחה'}
          </button>
          {status === 'sent' && <span className={styles.success}>ההודעה נשלחה בהצלחה</span>}
          {status === 'error' && <span className={styles.error}>{error}</span>}
        </div>
      </form>
    </section>
  );
}
