'use client';

import { useState } from 'react';
import styles from './editors.module.css';

export default function HtmlDataEditor({ onSave, onClose }) {
  const [content, setContent] = useState('');

  const handleSave = () => {
    if (!content.trim()) {
      alert('Please enter some content');
      return;
    }

    const htmlContent = content;
    onSave(htmlContent);
  };

  return (
    <div className={styles.editor}>
      <div className={styles.formGroup}>
        <label>HTML Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter HTML or plain text content..."
          className={styles.textarea}
          rows="12"
        />
        <p className={styles.hint}>You can use HTML tags like &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, etc.</p>
      </div>

      <div className={styles.actions}>
        <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
        <button className={styles.saveBtn} onClick={handleSave}>Save</button>
      </div>
    </div>
  );
}
