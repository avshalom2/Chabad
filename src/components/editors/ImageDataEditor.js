'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from 'react';
import styles from './editors.module.css';

const escapeHtmlAttr = (value) => (
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
);

export default function ImageDataEditor({ elementHtml, onSave, onClose }) {
  const [uploading, setUploading] = useState(false);
  const [loadingImages, setLoadingImages] = useState(true);
  const [uploadImages, setUploadImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');

  const fetchUploadImages = async () => {
    setLoadingImages(true);
    try {
      const response = await fetch('/api/admin/uploads');
      if (response.ok) {
        const data = await response.json();
        setUploadImages(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading uploaded images:', error);
    } finally {
      setLoadingImages(false);
    }
  };

  useEffect(() => {
    fetchUploadImages();
  }, []);

  useEffect(() => {
    if (!elementHtml) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(elementHtml, 'text/html');
    const image = doc.querySelector('img');

    if (image) {
      setImageUrl(image.getAttribute('src') || '');
      setAltText(image.getAttribute('alt') || '');
    }
  }, [elementHtml]);

  const filteredImages = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return uploadImages;

    return uploadImages.filter((image) => (
      image.name?.toLowerCase().includes(term) ||
      image.src?.toLowerCase().includes(term)
    ));
  }, [searchTerm, uploadImages]);

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
        await fetchUploadImages();
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

    const htmlContent = `<img src="${escapeHtmlAttr(imageUrl)}" alt="${escapeHtmlAttr(altText)}" style="max-width: 100%; height: auto;" />`;

    onSave(htmlContent);
  };

  const handleSelectImage = (src) => {
    setImageUrl(src);
  };

  const handleClear = () => {
    setImageUrl('');
    setAltText('');
  };

  return (
    <div className={styles.editor}>
      <div className={styles.formGroup}>
        <label>Select From Uploads</label>
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search uploaded images"
          className={styles.input}
        />

        {loadingImages ? (
          <p className={styles.loading}>Loading images...</p>
        ) : filteredImages.length > 0 ? (
          <div className={styles.imagePicker}>
            {filteredImages.map((image) => (
              <button
                key={image.src}
                type="button"
                className={`${styles.imageOption} ${imageUrl === image.src ? styles.selectedImageOption : ''}`}
                onClick={() => handleSelectImage(image.src)}
                title={image.name}
              >
                <img src={image.src} alt="" loading="lazy" />
                <span>{image.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className={styles.hint}>
            {searchTerm ? 'No matching images found. You can upload a new one below.' : 'No uploaded images found yet.'}
          </p>
        )}
      </div>

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
