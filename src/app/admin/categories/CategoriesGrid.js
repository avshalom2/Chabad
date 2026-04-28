'use client';

import { useMemo, useState } from 'react';
import styles from './categories.module.css';

export default function CategoriesGrid({ categories }) {
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
            />
          ))}
        </tbody>
      </table>
    </>
  );
}

function TreeItem({ cat, level, savingIds, onMenuChange }) {
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
          <a href={`/admin/categories/${cat.id}/edit`} className={styles.editBtn}>Edit</a>
        </td>
      </tr>
      {cat.children.map((child) => (
        <TreeItem
          key={child.id}
          cat={child}
          level={level + 1}
          savingIds={savingIds}
          onMenuChange={onMenuChange}
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
