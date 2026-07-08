'use client';

import { useMemo, useState } from 'react';
import { useAdminFeedback } from '@/components/AdminFeedbackProvider.js';
import styles from './categories.module.css';

export default function CategoriesGrid({ categories }) {
  const { confirm, notify } = useAdminFeedback();
  const [items, setItems] = useState(categories);
  const [savingIds, setSavingIds] = useState([]);
  const [error, setError] = useState('');

  const tree = useMemo(() => buildTree(items), [items]);

  async function updateMenuFlag(categoryId, checked) {
    const previousItems = items;

    setError('');
    setItems((currentItems) =>
      currentItems.map((cat) =>
        cat.id === categoryId ? { ...cat, is_menu: checked } : cat
      )
    );
    setSavingIds((ids) => [...ids, categoryId]);

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_menu: checked }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update category');
      }
    } catch (err) {
      setItems(previousItems);
      setError(err.message || 'Failed to update category');
    } finally {
      setSavingIds((ids) => ids.filter((id) => id !== categoryId));
    }
  }

  async function deleteCategoryItem(category) {
    const confirmed = await confirm({
      title: 'Delete category?',
      description: `${category.name} will be permanently deleted. Categories with subcategories or articles cannot be deleted.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      tone: 'danger',
    });

    if (!confirmed) return;

    setError('');
    setSavingIds((ids) => [...ids, category.id]);

    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'DELETE',
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete category');
      }

      setItems((currentItems) => currentItems.filter((cat) => cat.id !== category.id));
      notify({
        title: 'Category deleted',
        description: category.name,
        tone: 'success',
      });
    } catch (err) {
      const message = err.message || 'Failed to delete category';
      setError(message);
      notify({
        title: 'Delete failed',
        description: message,
        tone: 'danger',
        autoClose: false,
      });
    } finally {
      setSavingIds((ids) => ids.filter((id) => id !== category.id));
    }
  }

  if (items.length === 0) {
    return (
      <p className={styles.empty}>
        No categories yet. <a href="/admin/categories/new">Add your first one</a>
      </p>
    );
  }

  return (
    <>
      {error && <div className={styles.gridError}>{error}</div>}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Slug</th>
            <th>Type</th>
            <th>Children</th>
            <th>Menu</th>
            <th>Status</th>
            <th>Sort</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tree.map((cat) => (
            <TreeItem
              key={cat.id}
              cat={cat}
              level={0}
              savingIds={savingIds}
              onMenuChange={updateMenuFlag}
              onDelete={deleteCategoryItem}
            />
          ))}
        </tbody>
      </table>
    </>
  );
}

function TreeItem({ cat, level, savingIds, onMenuChange, onDelete }) {
  const indent = level * 30;
  const isSaving = savingIds.includes(cat.id);

  return (
    <>
      <tr style={{ backgroundColor: level > 0 ? '#f9fafb' : 'transparent' }}>
        <td style={{ paddingLeft: `${indent + 16}px` }}>
          {level > 0 && <span className={styles.treeIcon}>└ </span>}
          {cat.name}
        </td>
        <td><code>{cat.slug}</code></td>
        <td>{cat.type_name}</td>
        <td>{cat.children.length > 0 ? `${cat.children.length} sub` : '-'}</td>
        <td>
          <label className={styles.menuToggle}>
            <input
              type="checkbox"
              checked={Boolean(cat.is_menu)}
              disabled={isSaving}
              onChange={(event) => onMenuChange(cat.id, event.target.checked)}
              aria-label={`Use ${cat.name} as menu item`}
            />
            {isSaving && <span>Saving</span>}
          </label>
        </td>
        <td>
          <span className={cat.is_active ? styles.active : styles.inactive}>
            {cat.is_active ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>{cat.sort_order}</td>
        <td className={styles.actions}>
          <a href={`/admin/categories/${cat.id}/edit`} className={styles.editBtn} title="Edit">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </a>
          <button
            type="button"
            className={styles.deleteBtn}
            title="Delete"
            disabled={isSaving}
            onClick={() => onDelete(cat)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </td>
      </tr>
      {cat.children.map((child) => (
        <TreeItem
          key={child.id}
          cat={child}
          level={level + 1}
          savingIds={savingIds}
          onMenuChange={onMenuChange}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}

function buildTree(categories) {
  const map = {};
  const roots = [];

  categories.forEach((cat) => {
    map[cat.id] = { ...cat, children: [] };
  });

  categories.forEach((cat) => {
    if (cat.parent_id && map[cat.parent_id]) {
      map[cat.parent_id].children.push(map[cat.id]);
    } else {
      roots.push(map[cat.id]);
    }
  });

  return roots;
}
