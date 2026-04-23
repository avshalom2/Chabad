'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../form-editor.module.css';

export default function NewFormPage() {
  const router = useRouter();
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreateForm(e) {
    e.preventDefault();
    setError('');

    if (!formName.trim()) {
      setError('Form name is required');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          description: formDesc,
        }),
      });

      if (res.ok) {
        const form = await res.json();
        router.push(`/admin/forms/${form.id}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create form');
      }
    } catch (err) {
      console.error('Error creating form:', err);
      setError('Error creating form');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <Link href="/admin/forms" className={styles.backLink}>
        ← Back to Forms
      </Link>

      <h1 className={styles.title}>Create New Form</h1>

      <div className={styles.section}>
        <form onSubmit={handleCreateForm}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formGroup}>
            <label>Form Name *</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g., Contact Us, Support Request"
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Optional description of this form"
            />
          </div>

          <button type="submit" className={styles.saveBtn} disabled={loading}>
            {loading ? 'Creating...' : 'Create Form'}
          </button>
        </form>
      </div>
    </div>
  );
}
