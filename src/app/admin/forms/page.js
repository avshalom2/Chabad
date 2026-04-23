'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './forms.module.css';

export default function FormsPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForms();
  }, []);

  async function fetchForms() {
    try {
      const res = await fetch('/api/admin/forms');
      const data = await res.json();
      setForms(data);
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this form?')) return;

    try {
      const res = await fetch(`/api/admin/forms/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setForms(forms.filter(f => f.id !== id));
      } else {
        alert('Failed to delete form');
      }
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Error deleting form');
    }
  }

  if (loading) return <div className={styles.container}>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Forms</h1>
        <Link href="/admin/forms/new" className={styles.addButton}>
          + Create Form
        </Link>
      </div>

      {forms.length === 0 ? (
        <p className={styles.empty}>
          No forms yet.{' '}
          <Link href="/admin/forms/new">Create your first form</Link>
        </p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Description</th>
              <th>Fields</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((form) => (
              <tr key={form.id}>
                <td className={styles.titleCell}>
                  <strong>{form.name}</strong>
                </td>
                <td className={styles.slug}>{form.slug}</td>
                <td>{form.description || '-'}</td>
                <td>{form.fields ? form.fields.length : 0}</td>
                <td>{new Date(form.created_at).toLocaleDateString()}</td>
                <td className={styles.actions}>
                  <Link href={`/admin/forms/${form.id}`} className={styles.editBtn}>
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(form.id)}
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
