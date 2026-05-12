'use client';

import { useEffect, useState } from 'react';
import styles from './editors.module.css';

export default function ArticlesCubeEditor({ onSave, onClose }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories?type=articles-cube');
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch articles-cube categories:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  const handleSave = () => {
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }

    const selected = categories.find((cat) => String(cat.id) === String(selectedCategory));

    const htmlContent = `<div class="content-placeholder" style="display: inline-block; padding: 1.5rem; margin: 1rem 0; background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border: 2px dashed #c47a1d; border-radius: 8px; text-align: center; color: #333; font-weight: 600; min-height: 100px; min-width: 300px;"><div style="font-size: 1.1rem; margin-bottom: 0.5rem;">◼</div><div style="font-size: 0.9rem;">${selected.name}</div><div style="font-size: 0.85rem; color: #666; margin-top: 0.5rem;">Articles Cube - ${selected.name}</div><articlescube category-id="${selected.id}" category-slug="${selected.slug}" category-name="${selected.name}" category-columns="${selected.default_columns || 3}"></articlescube></div>`;

    onSave(htmlContent);
  };

  return (
    <div className={styles.editor}>
      <div className={styles.formGroup}>
        <label>Select Articles Cube category</label>
        {loading ? (
          <p>Loading categories...</p>
        ) : categories.length === 0 ? (
          <p style={{ color: '#d32f2f', fontWeight: 600 }}>No active categories of type Articles Cube were found.</p>
        ) : (
          <div className={styles.controlOptions}>
            {categories.map((cat) => (
              <label key={cat.id} className={styles.controlOption}>
                <input
                  type="radio"
                  name="articlesCubeCategory"
                  value={cat.id}
                  checked={String(selectedCategory) === String(cat.id)}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                />
                <div className={styles.controlInfo}>
                  <div className={styles.controlName}>{cat.name}</div>
                  {cat.parent_name && (
                    <div className={styles.controlDesc}>Sub-category of: {cat.parent_name}</div>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
        <button className={styles.saveBtn} onClick={handleSave} disabled={!selectedCategory || loading}>Save</button>
      </div>
    </div>
  );
}
