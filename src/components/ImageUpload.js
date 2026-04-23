'use client';
import { useState } from 'react';
import styles from './image-upload.module.css';

export default function ImageUpload({ imageUrl, onImageChange, disabled = false }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  async function uploadFile(file) {
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Upload failed');
        setUploading(false);
        return;
      }

      onImageChange(data.url);
      setUploading(false);
    } catch (err) {
      setError('An error occurred during upload');
      setUploading(false);
    }
  }

  function handleChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  }

  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.previewSection}>
        <label>Featured Image</label>
        {imageUrl ? (
          <div className={styles.preview}>
            <img src={imageUrl} alt="Featured" />
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => onImageChange('')}
              disabled={uploading || disabled}
            >
              Remove
            </button>
          </div>
        ) : (
          <div
            className={`${styles.dropZone} ${dragActive ? styles.active : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className={styles.uploading}>
                <div className={styles.spinner}></div>
                <p>Uploading...</p>
              </div>
            ) : (
              <>
                <p className={styles.icon}>📸</p>
                <p className={styles.text}>
                  Drag and drop an image here, or click to select
                </p>
                <p className={styles.hint}>
                  Supported: JPG, PNG, GIF, WebP (max 5MB)
                </p>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleChange}
              disabled={uploading || disabled}
              className={styles.input}
            />
          </div>
        )}
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
}
