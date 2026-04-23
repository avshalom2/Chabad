'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './qna.module.css';

export default function QnaPage() {
  const [qnaSets, setQnaSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQnaSets();
  }, []);

  async function fetchQnaSets() {
    try {
      const res = await fetch('/api/admin/qna');
      const data = await res.json();
      setQnaSets(data);
    } catch (error) {
      console.error('Error fetching Q&A sets:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this Q&A set?')) return;

    try {
      const res = await fetch(`/api/admin/qna/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setQnaSets(qnaSets.filter(q => q.id !== id));
      } else {
        alert('Failed to delete Q&A set');
      }
    } catch (error) {
      console.error('Error deleting Q&A set:', error);
      alert('Error deleting Q&A set');
    }
  }

  if (loading) return <div className={styles.container}>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Q&A Sets</h1>
        <Link href="/admin/qna/new" className={styles.addButton}>
          + Create Q&A Set
        </Link>
      </div>

      {qnaSets.length === 0 ? (
        <p className={styles.empty}>
          No Q&A sets yet.{' '}
          <Link href="/admin/qna/new">Create your first Q&A set</Link>
        </p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Description</th>
              <th>Questions</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {qnaSets.map((qna) => (
              <tr key={qna.id}>
                <td className={styles.titleCell}>
                  <strong>{qna.name}</strong>
                </td>
                <td className={styles.slug}>{qna.slug}</td>
                <td>{qna.description || '-'}</td>
                <td>{qna.items ? qna.items.length : 0}</td>
                <td>{new Date(qna.created_at).toLocaleDateString()}</td>
                <td className={styles.actions}>
                  <Link href={`/admin/qna/${qna.id}`} className={styles.editBtn}>
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(qna.id)}
                    className={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
