'use client';

import { useState, useEffect } from 'react';
import styles from './ArticleImageGallery.module.css';

export default function ArticleImageGallery({ articleId, selectedImage, onSelectImage, disabled }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Load images
  useEffect(() => {
    const loadImages = async () => {
      if (!articleId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/admin/articles/${articleId}/images`);
        const data = await res.json();
        setImages(data.images || []);
      } catch (error) {
        console.error('Error loading images:', error);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [articleId]);

  const handleFileUpload = async (file) => {
    if (!articleId || !file) return;

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        setUploadError(uploadData.error || 'Upload failed');
        setUploading(false);
        return;
      }

      // Add to article images
      const res = await fetch(`/api/admin/articles/${articleId}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: uploadData.url,
          altText: '',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setImages([...images, data.image]);
      } else {
        setUploadError(data.error || 'Failed to add image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError('An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Handle all dropped files
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          handleFileUpload(file);
        }
      });
    }
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        handleFileUpload(file);
      });
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      const res = await fetch(`/api/admin/articles/${articleId}/images`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId }),
      });

      if (res.ok) {
        setImages(images.filter((img) => img.id !== imageId));
        // If deleted image was selected, clear selection
        if (selectedImage === imageId) {
          onSelectImage(null);
        }
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop2 = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === targetIndex) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedItem];
    newImages.splice(draggedItem, 1);
    newImages.splice(targetIndex, 0, draggedImage);

    // Update display_order
    const updated = newImages.map((img, idx) => ({
      ...img,
      display_order: idx,
    }));

    setImages(updated);
    setDraggedItem(null);

    // Save order to server
    try {
      await fetch(`/api/admin/articles/${articleId}/images`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reorder',
          images: updated.map((img) => ({ id: img.id, display_order: img.display_order })),
        }),
      });
    } catch (error) {
      console.error('Error reordering images:', error);
    }
  };

  if (!articleId) {
    return (
      <div className={styles.gallery}>
        <p className={styles.note}>Save the article first to upload images</p>
      </div>
    );
  }

  return (
    <div className={styles.gallery}>
      <div className={styles.uploadSection}>
        <h3>Upload Images</h3>
        
        <div
          className={`${styles.dropZone} ${dragActive ? styles.active : ''} ${uploading ? styles.uploading : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className={styles.uploadingState}>
              <div className={styles.spinner}></div>
              <p>Uploading...</p>
            </div>
          ) : (
            <>
              <p className={styles.icon}>📁</p>
              <p className={styles.dropText}>Drag images here or click to select</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleInputChange}
                disabled={disabled || uploading}
                className={styles.fileInput}
              />
            </>
          )}
        </div>

        {uploadError && <p className={styles.error}>{uploadError}</p>}
      </div>

      {loading ? (
        <p>Loading images...</p>
      ) : images.length === 0 ? (
        <p className={styles.empty}>No images yet. Upload one above.</p>
      ) : (
        <div className={styles.imagesList}>
          <h3>Images ({images.length})</h3>
          <p className={styles.hint}>Drag to reorder • Click radio to select for short description</p>
          
          <div className={styles.imagesGrid}>
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`${styles.imageCard} ${draggedItem === index ? styles.dragging : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop2(e, index)}
              >
                <div className={styles.imageWrapper}>
                  <img src={image.image_url} alt={image.alt_text || 'Article image'} />
                  <div className={styles.orderBadge}>{index + 1}</div>
                </div>

                <div className={styles.imageControls}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="short_description_image"
                      value={image.id}
                      checked={Number(selectedImage) === Number(image.id)}
                      onChange={() => onSelectImage(Number(image.id))}
                    />
                    <span>Use for description</span>
                  </label>

                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => handleDeleteImage(image.id)}
                    disabled={disabled || loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
