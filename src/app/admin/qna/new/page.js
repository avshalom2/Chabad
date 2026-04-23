'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../qna-editor.module.css';

export default function NewQnaPage() {
  const router = useRouter();
  const [qnaName, setQnaName] = useState('');
  const [qnaDesc, setQnaDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreateQna(e) {
    e.preventDefault();
    setError('');

    if (!qnaName.trim()) {
      setError('Q&A set name is required');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/qna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: qnaName,
          description: qnaDesc,
        }),
      });

      if (res.ok) {
        const qnaSet = await res.json();
        router.push(`/admin/qna/${qnaSet.id}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create Q&A set');
      }
    } catch (err) {
      console.error('Error creating Q&A set:', err);
      setError('Error creating Q&A set');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <Link href="/admin/qna" className={styles.backLink}>
        ← Back to Q&A Sets
      </Link>

      <h1 className={styles.title}>Create New Q&A Set</h1>

      <div className={styles.section}>
        <form onSubmit={handleCreateQna}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formGroup}>
            <label>Q&A Set Name *</label>
            <input
              type="text"
              value={qnaName}
              onChange={(e) => setQnaName(e.target.value)}
              placeholder="e.g., Common Questions, FAQ"
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              value={qnaDesc}
              onChange={(e) => setQnaDesc(e.target.value)}
              placeholder="Optional description of this Q&A set"
            />
          </div>

          <button type="submit" className={styles.saveBtn} disabled={loading}>
            {loading ? 'Creating...' : 'Create Q&A Set'}
          </button>
        </form>
      </div>
    </div>
  );
}
