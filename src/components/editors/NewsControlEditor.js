'use client';

import { useState, useEffect } from 'react';
import styles from './editors.module.css';

export default function NewsControlEditor({ onSave, onClose }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories?type=news');
        const data = await res.json();
        // Filter only categories that have a news-style layout (all categories eligible)
        const cats = Array.isArray(data) ? data : [];
        setCategories(cats);
      } catch (e) {
        console.error('Failed to fetch categories:', e);
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

    const selected = categories.find(c => String(c.id) === String(selectedCategory));
    
    const htmlContent = `<div class="content-placeholder" style="display: inline-block; padding: 1.5rem; margin: 1rem 0; background: linear-gradient(135deg, #e8eaf6 0%, #f3f4ff 100%); border: 2px dashed #1a3fa3; border-radius: 8px; text-align: center; color: #333; font-weight: 600; min-height: 100px; min-width: 300px;"><div style="font-size: 1.1rem; margin-bottom: 0.5rem;">📰</div><div style="font-size: 0.9rem;">${selected.name}</div><div style="font-size: 0.85rem; color: #666; margin-top: 0.5rem;">חדשות – ${selected.name}</div><newsbox category-id="${selected.id}" category-slug="${selected.slug}" category-name="${selected.name}"></newsbox></div>`;
    
    onSave(htmlContent);
  };

  return (
    <div className={styles.editor}>
      <div className={styles.formGroup}>
        <label>בחר קטגוריה לתצוגת חדשות</label>
        {loading ? (
          <p>טוען קטגוריות...</p>
        ) : (
          <div className={styles.controlOptions}>
            {categories.map(cat => (
              <label key={cat.id} className={styles.controlOption}>
                <input
                  type="radio"
                  name="newsCategory"
                  value={cat.id}
                  checked={String(selectedCategory) === String(cat.id)}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                />
                <div className={styles.controlInfo}>
                  <div className={styles.controlName}>{cat.name}</div>
                  {cat.parent_name && (
                    <div className={styles.controlDesc}>תת-קטגוריה של: {cat.parent_name}</div>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button className={styles.cancelBtn} onClick={onClose}>ביטול</button>
        <button className={styles.saveBtn} onClick={handleSave} disabled={!selectedCategory}>שמור</button>
      </div>
    </div>
  );
}
