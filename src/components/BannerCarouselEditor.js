'use client';
import { useState } from 'react';
import styles from './banner-carousel-editor.module.css';

export default function BannerCarouselEditor({ banners = [], onChange }) {
  const [bannerList, setBannerList] = useState(banners);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('Upload failed');
        const { url } = await res.json();

        setBannerList(prev => [...prev, { image_url: url, title: '' }]);
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const updateBannerTitle = (idx, title) => {
    const updated = [...bannerList];
    updated[idx].title = title;
    setBannerList(updated);
    onChange(updated);
  };

  const removeBanner = (idx) => {
    const updated = bannerList.filter((_, i) => i !== idx);
    setBannerList(updated);
    onChange(updated);
  };

  const moveBanner = (idx, direction) => {
    if ((direction === -1 && idx === 0) || (direction === 1 && idx === bannerList.length - 1)) {
      return;
    }
    const updated = [...bannerList];
    const temp = updated[idx];
    updated[idx] = updated[idx + direction];
    updated[idx + direction] = temp;
    setBannerList(updated);
    onChange(updated);
  };

  return (
    <div className={styles.editor}>
      <h3>עריכת קרוסלת הבנר הראשי</h3>

      {/* Upload Section */}
      <div className={styles.uploadSection}>
        <label className={styles.uploadLabel}>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          <span className={styles.uploadBtn}>
            {uploading ? 'מעלה...' : '+ הוסף תמונה'}
          </span>
        </label>
        <p className={styles.helpText}>בחר תמונה אחת או יותר</p>
      </div>

      {/* Banners List */}
      <div className={styles.bannersList}>
        {bannerList.map((banner, idx) => (
          <div key={idx} className={styles.bannerItem}>
            {/* Image Preview */}
            <div className={styles.imagePreview}>
              <img src={banner.image_url} alt={`Banner ${idx + 1}`} />
            </div>

            {/* Title Input */}
            <div className={styles.bannerContent}>
              <input
                type="text"
                placeholder="שם הבנר (אופציונלי)"
                value={banner.title || ''}
                onChange={(e) => updateBannerTitle(idx, e.target.value)}
                className={styles.titleInput}
              />
            </div>

            {/* Controls */}
            <div className={styles.controls}>
              <button
                onClick={() => moveBanner(idx, -1)}
                disabled={idx === 0}
                className={styles.moveBtn}
                title="הזז למעלה"
              >
                ↑
              </button>
              <button
                onClick={() => moveBanner(idx, 1)}
                disabled={idx === bannerList.length - 1}
                className={styles.moveBtn}
                title="הזז למטה"
              >
                ↓
              </button>
              <button
                onClick={() => removeBanner(idx)}
                className={styles.deleteBtn}
                title="מחק"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {bannerList.length === 0 && (
        <p className={styles.emptyState}>אין תמונות בנר. הוסף את הראשון!</p>
      )}
    </div>
  );
}
