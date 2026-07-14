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
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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
      if (!response.ok) throw new Error(data.error || 'לא הצלחנו לשלוח את ההודעה');

      setForm(initialForm);
      setStatus('sent');
    } catch (sendError) {
      setError(sendError.message || 'לא הצלחנו לשלוח את ההודעה');
      setStatus('error');
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label>
        <span>שם</span>
        <input
          required
          value={form.name}
          onChange={(event) => updateField('name', event.target.value)}
          autoComplete="name"
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
        <span>אימייל</span>
        <input
          required
          type="email"
          value={form.email}
          onChange={(event) => updateField('email', event.target.value)}
          autoComplete="email"
        />
      </label>

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

      <div className={styles.formActions}>
        <button type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'שולח...' : 'שלח'}
        </button>
        {status === 'sent' && <p className={styles.success}>ההודעה נשלחה בהצלחה.</p>}
        {status === 'error' && <p className={styles.error}>{error}</p>}
      </div>
    </form>
  );
}
