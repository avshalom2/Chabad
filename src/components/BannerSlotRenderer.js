'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './BannerSlotRenderer.module.css';

const MAX_BANNER_FILE_SIZE = 500 * 1024;

function InlineBannerEditor({ banner, onSaved }) {
  const inputRef = useRef(null);
  const [canEdit, setCanEdit] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/auth/admin-status', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setCanEdit(data?.canEditBanner === true))
      .catch(() => setCanEdit(false));
  }, []);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const resetSelection = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl('');
    setEditingBannerId(null);
    setMessage('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const chooseFile = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
      setMessage('יש לבחור תמונת JPEG, PNG או WebP');
      event.target.value = '';
      return;
    }

    if (selectedFile.size > MAX_BANNER_FILE_SIZE) {
      setMessage('התמונה גדולה מדי. הגודל המרבי הוא 500 KB');
      event.target.value = '';
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selectedFile);
    setEditingBannerId(banner.id);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setMessage('');
  };

  const save = async () => {
    if (!file || !editingBannerId) return;
    setSaving(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`/api/admin/banners/${editingBannerId}/image`, {
        method: 'PUT',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'שמירת הבאנר נכשלה');

      onSaved(editingBannerId, data.url);
      resetSelection();
    } catch (error) {
      setMessage(error.message || 'שמירת הבאנר נכשלה');
    } finally {
      setSaving(false);
    }
  };

  if (!canEdit || !banner) return null;

  return (
    <div className={styles.inlineEditor} onPointerDown={(event) => event.stopPropagation()}>
      <input
        ref={inputRef}
        className={styles.fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={chooseFile}
      />

      {!previewUrl ? (
        <button type="button" className={styles.editButton} onClick={() => inputRef.current?.click()}>
          עריכת באנר
        </button>
      ) : (
        <>
          <div className={styles.previewOverlay}>
            <img src={previewUrl} alt="תצוגה מקדימה של הבאנר" />
          </div>
          <div className={styles.editActions}>
            <button type="button" className={styles.saveButton} onClick={save} disabled={saving}>
              {saving ? 'שומר...' : 'שמירה'}
            </button>
            <button type="button" className={styles.cancelButton} onClick={resetSelection} disabled={saving}>
              ביטול
            </button>
          </div>
        </>
      )}

      {message && <div className={styles.editorMessage} role="alert">{message}</div>}
    </div>
  );
}

export default function BannerSlotRenderer({ slotSlug, slotId, className = '', onVisibilityChange }) {
  const [slot, setSlot] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoSlideTransition, setAutoSlideTransition] = useState(true);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const dragStartX = useRef(0);

  useEffect(() => {
    fetchSlot();
  }, [slotSlug, slotId]);

  const fetchSlot = async () => {
    try {
      setLoading(true);
      setSlot(null);
      const identifier = slotId || slotSlug;
      if (!identifier) return;

      const response = await fetch(`/api/banner-slots/${identifier}`, {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        const isActive = data.is_active === true || data.is_active === 1 || data.is_active === '1';
        if (!isActive || !data.banners?.length) {
          onVisibilityChange?.(false);
          return;
        }

        setSlot(data);
        onVisibilityChange?.(true);
        setCurrentIndex(0);
        setAutoSlideTransition(true);
      } else {
        onVisibilityChange?.(false);
      }
    } catch (err) {
      console.error('Error fetching slot:', err);
      onVisibilityChange?.(false);
    } finally {
      setLoading(false);
    }
  };

  // Auto-rotate for auto-slide design only
  useEffect(() => {
    if (!slot?.banners?.length || slot.design_type !== 'auto-slide' || isDragging) return;

    const interval = setInterval(() => {
      setAutoSlideTransition(true);
      setCurrentIndex((prev) => prev + 1);
    }, slot.rotation_delay || 5000);

    return () => clearInterval(interval);
  }, [slot, isDragging]);

  const handleAutoSlideTransitionEnd = () => {
    if (!slot?.banners?.length || currentIndex !== slot.banners.length) return;

    setAutoSlideTransition(false);
    setCurrentIndex(0);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setAutoSlideTransition(true));
    });
  };

  const moveSlide = (direction) => {
    if (!slot?.banners?.length) return;
    setAutoSlideTransition(true);
    setCurrentIndex((prev) => {
      let newIndex = prev + direction;
      if (newIndex >= slot.banners.length) newIndex = 0;
      if (newIndex < 0) newIndex = slot.banners.length - 1;
      return newIndex;
    });
  };

  const handlePointerDown = (e) => {
    if (!slot?.banners || slot.banners.length < 2) return;

    dragStartX.current = e.clientX;
    setIsDragging(true);
    setDragOffset(0);
    setAutoSlideTransition(false);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;

    const nextOffset = e.clientX - dragStartX.current;
    setDragOffset(nextOffset);
  };

  const handlePointerEnd = (e) => {
    if (!isDragging) return;

    const finalOffset = e.clientX - dragStartX.current;
    const threshold = 45;

    setIsDragging(false);
    setDragOffset(0);
    setAutoSlideTransition(true);
    e.currentTarget.releasePointerCapture?.(e.pointerId);

    if (Math.abs(finalOffset) < threshold) return;
    moveSlide(finalOffset < 0 ? 1 : -1);
  };

  const handlePointerCancel = (e) => {
    if (!isDragging) return;

    setIsDragging(false);
    setDragOffset(0);
    setAutoSlideTransition(true);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  if (loading || !slot?.banners?.length) return null;

  const isAutoSlide = slot.design_type === 'auto-slide';
  const isManualSlider = slot.design_type === 'manual-slider';
  const isCarousel = slot.design_type === 'carousel-dots' || slot.design_type === 'carousel-arrows';
  const offset = -currentIndex * 100;
  const dragTransform = dragOffset ? ` translateX(${dragOffset}px)` : '';

  // ===== AUTO-SLIDE / MANUAL SLIDER: Same strip, optional automatic rotation =====
  if (isAutoSlide || isManualSlider) {
    const autoSlides = slot.banners.length > 1
      ? [...slot.banners, slot.banners[0]]
      : slot.banners;
    const activeDotIndex = currentIndex % slot.banners.length;
    const activeBanner = slot.banners[activeDotIndex];

    return (
      <div
        className={`${styles.container} ${className}`}
        style={{
          maxWidth: slot.max_width ? `${slot.max_width}px` : undefined,
        }}
      >
        <div
          className={`${styles.bannerWrapperAutoSlide} ${isDragging ? styles.dragging : ''}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerCancel}
        >
          <div
            className={styles.bannerTrackAutoSlide}
            style={{
              transform: `translateX(${-currentIndex * 100}%)${dragTransform}`,
              transition: autoSlideTransition && !isDragging ? undefined : 'none',
            }}
            onTransitionEnd={handleAutoSlideTransitionEnd}
          >
            {autoSlides.map((banner, idx) => (
              <div key={`${banner.id || banner.image_url}-${idx}`} className={styles.slideAutoSlide}>
                <img
                  src={banner.image_url}
                  alt={banner.alt_text || `Banner ${idx + 1}`}
                  className={styles.bannerImageAutoSlide}
                />
              </div>
            ))}
          </div>

          {/* Dots for navigation */}
          {slot.banners.length > 1 && (
            <div className={styles.dots}>
              {slot.banners.map((_, idx) => (
                <button
                  key={idx}
                  className={`${styles.dot} ${idx === activeDotIndex ? styles.active : ''}`}
                  onClick={() => {
                    setAutoSlideTransition(true);
                    setCurrentIndex(idx);
                  }}
                />
              ))}
            </div>
          )}
        </div>
        {slot.slug === 'homepage-1' && (
          <InlineBannerEditor
            banner={activeBanner}
            onSaved={(bannerId, imageUrl) => setSlot((current) => ({
              ...current,
              banners: current.banners.map((banner) => (
                banner.id === bannerId ? { ...banner, image_url: imageUrl } : banner
              )),
            }))}
          />
        )}
      </div>
    );
  }

  // ===== CAROUSEL (dots/arrows): Push/slide transition effect =====
  if (isCarousel) {
    const activeBanner = slot.banners[currentIndex];
    return (
      <div
        className={`${styles.container} ${className}`}
        style={{
          maxWidth: slot.max_width ? `${slot.max_width}px` : undefined,
        }}
      >
        <div
          className={`${styles.bannerContainer} ${isDragging ? styles.dragging : ''}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerCancel}
        >
          {/* Track holds all slides in a row */}
          <div
            className={styles.bannerTrack}
            style={{
              transform: `translateX(${offset}%)${dragTransform}`,
              transition: isDragging ? 'none' : undefined,
            }}
          >
            {slot.banners.map((banner, idx) => (
              <div key={idx} className={styles.slide}>
                <img
                  src={banner.image_url}
                  alt={banner.alt_text || `Banner ${idx + 1}`}
                  className={styles.slideImage}
                />
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          {slot.banners.length > 1 && (
            <>
              <button
                className={`${styles.navBtn} ${styles.prevBtn}`}
                onClick={() => moveSlide(-1)}
                aria-label="Previous banner"
              >
                ❮
              </button>
              <button
                className={`${styles.navBtn} ${styles.nextBtn}`}
                onClick={() => moveSlide(1)}
                aria-label="Next banner"
              >
                ❯
              </button>
            </>
          )}

          {/* Dots */}
          {slot.banners.length > 1 && (
            <div className={styles.dots}>
              {slot.banners.map((_, idx) => (
                <button
                  key={idx}
                  className={`${styles.dot} ${idx === currentIndex ? styles.active : ''}`}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Banner ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
        {slot.slug === 'homepage-1' && (
          <InlineBannerEditor
            banner={activeBanner}
            onSaved={(bannerId, imageUrl) => setSlot((current) => ({
              ...current,
              banners: current.banners.map((banner) => (
                banner.id === bannerId ? { ...banner, image_url: imageUrl } : banner
              )),
            }))}
          />
        )}
      </div>
    );
  }

  // Fallback
  return null;
}
