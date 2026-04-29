'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './BannerSlotRenderer.module.css';

export default function BannerSlotRenderer({ slotSlug, slotId, className = '' }) {
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
      const identifier = slotId || slotSlug;
      if (!identifier) return;

      const response = await fetch(`/api/admin/banner-slots/${identifier}?activeOnly=true`);
      if (response.ok) {
        const data = await response.json();
        setSlot(data);
        setCurrentIndex(0);
        setAutoSlideTransition(true);
      }
    } catch (err) {
      console.error('Error fetching slot:', err);
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
      </div>
    );
  }

  // ===== CAROUSEL (dots/arrows): Push/slide transition effect =====
  if (isCarousel) {
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
      </div>
    );
  }

  // Fallback
  return null;
}
