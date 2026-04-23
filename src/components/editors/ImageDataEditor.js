'use client';

import { useState } from 'react';
import styles from './editors.module.css';

export default function ImageDataEditor({ onSave, onClose }) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/hp-templates/upload-image', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setImageUrl(data.url);
      } else {
        alert('Error uploading image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!imageUrl) {
      alert('Please select an image');
      return;
    }

    const htmlContent = `<img src="${imageUrl}" alt="${altText}" style="max-width: 100%; height: auto;" />`;

    onSave(htmlContent);
  };

  const handleClear = () => {
    setImageUrl('');
    setAltText('');
  };

  return (
    <div className={styles.editor}>
      <div className={styles.formGroup}>
        <label>Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={uploading}
          className={styles.fileInput}
        />
        {uploading && <p className={styles.loading}>Uploading...</p>}
      </div>

      {imageUrl && (
        <>
          <div className={styles.preview}>
            <img src={imageUrl} alt="Preview" style={{ maxWidth: '100%' }} />
          </div>

          <div className={styles.formGroup}>
            <label>Alt Text</label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Image description"
              className={styles.input}
            />
          </div>
        </>
      )}

      <div className={styles.actions}>
        <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
        {imageUrl && <button className={styles.clearBtn} onClick={handleClear}>Clear</button>}
        <button className={styles.saveBtn} onClick={handleSave} disabled={!imageUrl}>Save</button>
      </div>
    </div>
  );
}
