'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAdminFeedback } from '@/components/AdminFeedbackProvider.js';
import styles from './users.module.css';

const EMPTY_FORM = {
  username: '', email: '', display_name: '', password: '', access_level_id: '', is_active: true,
};

export default function UsersPage() {
  const { notify } = useAdminFeedback();
  const [users, setUsers] = useState([]);
  const [accessLevels, setAccessLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/users', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'טעינת המשתמשים נכשלה');
      setUsers(data.users || []);
      setAccessLevels(data.accessLevels || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, access_level_id: String(accessLevels[0]?.id || '') });
  }

  function openEdit(user) {
    const level = accessLevels.find((item) => item.name === user.access_level);
    setEditingId(user.id);
    setForm({
      username: user.username || '', email: user.email || '', display_name: user.display_name || '',
      password: '', access_level_id: String(level?.id || ''), is_active: Boolean(user.is_active),
    });
  }

  function closeEditor() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const isEditing = editingId !== null;
      const response = await fetch(isEditing ? `/api/admin/users/${editingId}` : '/api/admin/users', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, access_level_id: Number(form.access_level_id) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'שמירת המשתמש נכשלה');
      notify({ title: isEditing ? 'המשתמש עודכן' : 'המשתמש נוצר', tone: 'success' });
      closeEditor();
      await loadUsers();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  const editorOpen = editingId !== null || form.access_level_id !== '';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div><h1>ניהול משתמשים</h1><p>ניהול משתמשי האדמין, תפקידים והרשאות גישה.</p></div>
        <button type="button" className={styles.addButton} onClick={openCreate}>+ משתמש חדש</button>
      </div>

      {error && <div className={styles.error} role="alert">{error}</div>}

      {editorOpen && (
        <form className={styles.editor} onSubmit={handleSubmit}>
          <div className={styles.editorTitle}>
            <h2>{editingId === null ? 'יצירת משתמש' : 'עריכת משתמש'}</h2>
            <button type="button" onClick={closeEditor} aria-label="סגירה">×</button>
          </div>
          <div className={styles.fields}>
            <label>שם משתמש<input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></label>
            <label>שם לתצוגה<input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} /></label>
            <label>אימייל<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label>תפקיד<select required value={form.access_level_id} onChange={(e) => setForm({ ...form, access_level_id: e.target.value })}>
              <option value="" disabled>בחירת תפקיד</option>
              {accessLevels.map((level) => <option key={level.id} value={level.id}>{level.name}</option>)}
            </select></label>
            <label>סיסמה {editingId !== null && <small>(להשאיר ריק ללא שינוי)</small>}<input required={editingId === null} minLength={8} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
            {editingId !== null && <label className={styles.checkbox}><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> משתמש פעיל</label>}
          </div>
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelButton} onClick={closeEditor}>ביטול</button>
            <button type="submit" className={styles.saveButton} disabled={saving}>{saving ? 'שומר…' : 'שמירה'}</button>
          </div>
        </form>
      )}

      {loading ? <div className={styles.state}>טוען משתמשים…</div> : (
        <div className={styles.tableShell}>
          <table className={styles.table}>
            <thead><tr><th>משתמש</th><th>אימייל</th><th>תפקיד</th><th>הרשאות</th><th>מצב</th><th>פעולות</th></tr></thead>
            <tbody>{users.map((user) => (
              <tr key={user.id}>
                <td><strong>{user.display_name || user.username}</strong><small>@{user.username}</small></td>
                <td>{user.email}</td>
                <td><span className={styles.role}>{user.access_level}</span></td>
                <td className={styles.permissions}>{[
                  user.can_create && 'יצירה', user.can_update && 'עריכה', user.can_delete && 'מחיקה', user.can_publish && 'פרסום',
                ].filter(Boolean).join(' · ') || 'צפייה בלבד'}</td>
                <td><span className={user.is_active ? styles.active : styles.inactive}>{user.is_active ? 'פעיל' : 'מושבת'}</span></td>
                <td><button type="button" className={styles.editButton} onClick={() => openEdit(user)}>עריכה</button></td>
              </tr>
            ))}</tbody>
          </table>
          {!users.length && <div className={styles.state}>לא נמצאו משתמשים.</div>}
        </div>
      )}
    </div>
  );
}
