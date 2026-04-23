'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../qna-editor.module.css';

export default function QnaEditorPage({ params }) {
  const [qnaId, setQnaId] = useState(null);
  const [qnaSet, setQnaSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qnaName, setQnaName] = useState('');
  const [qnaDesc, setQnaDesc] = useState('');
  const [newItem, setNewItem] = useState({
    question: '',
    answer: '',
  });

  useEffect(() => {
    (async () => {
      const p = await params;
      setQnaId(p.id);
      await fetchQnaSet(p.id);
    })();
  }, []);

  async function fetchQnaSet(id) {
    try {
      const res = await fetch(`/api/admin/qna/${id}`);
      const data = await res.json();
      setQnaSet(data);
      setQnaName(data.name);
      setQnaDesc(data.description || '');
    } catch (error) {
      console.error('Error fetching Q&A set:', error);
      alert('Error loading Q&A set');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateQna() {
    if (!qnaName.trim()) {
      alert('Q&A set name is required');
      return;
    }

    try {
      const res = await fetch(`/api/admin/qna/${qnaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: qnaName,
          description: qnaDesc,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setQnaSet(updated);
        alert('Q&A set updated successfully');
      }
    } catch (error) {
      console.error('Error updating Q&A set:', error);
      alert('Error updating Q&A set');
    }
  }

  async function handleAddItem() {
    if (!newItem.question.trim() || !newItem.answer.trim()) {
      alert('Question and answer are required');
      return;
    }

    try {
      const res = await fetch(`/api/admin/qna/${qnaId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newItem,
          itemOrder: (qnaSet.items?.length || 0) + 1,
        }),
      });

      if (res.ok) {
        await fetchQnaSet(qnaId);
        setNewItem({ question: '', answer: '' });
        alert('Q&A item added successfully');
      }
    } catch (error) {
      console.error('Error adding Q&A item:', error);
      alert('Error adding Q&A item');
    }
  }

  async function handleDeleteItem(itemId) {
    if (!confirm('Delete this Q&A item?')) return;

    try {
      const res = await fetch(`/api/admin/qna/${qnaId}/items/${itemId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchQnaSet(qnaId);
      } else {
        alert('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item');
    }
  }

  if (loading) return <div className={styles.container}>Loading...</div>;
  if (!qnaSet) return <div className={styles.container}>Q&A set not found</div>;

  return (
    <div className={styles.container}>
      <Link href="/admin/qna" className={styles.backLink}>
        ← Back to Q&A Sets
      </Link>

      <h1 className={styles.title}>Edit Q&A Set: {qnaSet.name}</h1>

      {/* Q&A Set Details */}
      <div className={styles.section}>
        <h2>Q&A Set Details</h2>
        <div className={styles.formGroup}>
          <label>Q&A Set Name</label>
          <input
            type="text"
            value={qnaName}
            onChange={(e) => setQnaName(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Description</label>
          <textarea
            value={qnaDesc}
            onChange={(e) => setQnaDesc(e.target.value)}
            placeholder="Optional description"
          />
        </div>

        <button onClick={handleUpdateQna} className={styles.saveBtn}>
          Save Q&A Set Details
        </button>
      </div>

      {/* Q&A Items */}
      <div className={styles.section}>
        <h2>Q&A Items ({qnaSet.items?.length || 0})</h2>

        {qnaSet.items && qnaSet.items.length > 0 && (
          <div className={styles.itemsList}>
            {qnaSet.items.map((item) => (
              <div key={item.id} className={styles.itemBox}>
                <div className={styles.itemContent}>
                  <div className={styles.question}>
                    <strong>{item.question}</strong>
                  </div>
                  <div className={styles.answer}>{item.answer}</div>
                </div>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className={styles.deleteItemBtn}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {!qnaSet.items || qnaSet.items.length === 0 && (
          <p className={styles.noItems}>No Q&A items yet.</p>
        )}
      </div>

      {/* Add New Item */}
      <div className={styles.section}>
        <h2>Add New Q&A Item</h2>

        <div className={styles.formGroup}>
          <label>Question</label>
          <input
            type="text"
            value={newItem.question}
            onChange={(e) => setNewItem({ ...newItem, question: e.target.value })}
            placeholder="Enter question"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Answer</label>
          <textarea
            value={newItem.answer}
            onChange={(e) => setNewItem({ ...newItem, answer: e.target.value })}
            placeholder="Enter answer"
            rows={6}
          />
        </div>

        <button onClick={handleAddItem} className={styles.addItemBtn}>
          + Add Q&A Item
        </button>
      </div>
    </div>
  );
}
