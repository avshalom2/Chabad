'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './ArticlesSlider.module.css';

const ITEM_WIDTH = 150;
const ITEM_GAP = 16;
const ITEM_STEP = ITEM_WIDTH + ITEM_GAP;
const DRAG_THRESHOLD = 5;

export default function ArticlesSlider({ categoryId, categorySlug, categoryName }) {
  const [articles, setArticles] = useState([]);
  const [scrollX, setScrollX] = useState(0);       // single persistent offset
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const pointerStartX = useRef(null);
  const startScrollX = useRef(0);                   // scrollX at drag start
  const hasDragged = useRef(false);
  const trackRef = useRef(null);

  useEffect(() => {
    if (!categoryId && !categorySlug) return;
    async function fetchArticles() {
      try {
        const param = categoryId ? `categoryId=${categoryId}` : `categorySlug=${categorySlug}`;
        const res = await fetch(`/api/articles/by-category?${param}&limit=20`);
        const data = await res.json();
        setArticles((Array.isArray(data) ? data : []).filter(a => a.short_description_image_url));
      } catch (e) {
        console.error('Failed to fetch articles for slider:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, [categoryId, categorySlug]);

  const getMaxScroll = (count) => Math.max(0, (count - 1) * ITEM_STEP);

  const moveSlide = (direction) => {
    setScrollX(prev => {
      const next = prev + direction * ITEM_STEP;
      return Math.max(0, Math.min(next, getMaxScroll(articles.length)));
    });
  };

  const onPointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    pointerStartX.current = e.clientX;
    startScrollX.current = scrollX;
    hasDragged.current = false;
    setIsDragging(true);
    trackRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (pointerStartX.current === null) return;
    const delta = e.clientX - pointerStartX.current;
    if (Math.abs(delta) > DRAG_THRESHOLD) {
      hasDragged.current = true;
      // Move with the pointer — clamp within valid bounds
      const raw = startScrollX.current + delta;
      setScrollX(Math.max(-50, Math.min(raw, getMaxScroll(articles.length) + 50)));
    }
  };

  const onPointerUp = (e) => {
    if (pointerStartX.current === null) return;
    // Clamp to valid range on release
    setScrollX(prev => Math.max(0, Math.min(prev, getMaxScroll(articles.length))));
    pointerStartX.current = null;
    setIsDragging(false);
  };

  const onClickCapture = (e) => {
    if (hasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
      hasDragged.current = false;
    }
  };

  if (loading) {
    return (
      <div className={styles.sliderContainer}>
        <div className={styles.sliderHeader}>
          <span className={styles.title}>{categoryName || 'כתבות'}</span>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>טוען כתבות...</div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className={styles.sliderContainer}>
        <div className={styles.sliderHeader}>
          <span className={styles.title}>{categoryName || 'כתבות'}</span>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>אין כתבות להצגה</div>
      </div>
    );
  }

  const maxScroll = getMaxScroll(articles.length);
  const categoryHref = categorySlug ? `/category/${categorySlug}` : '#';

  return (
    <div className={styles.sliderContainer}>
      {/* Header */}
      <div className={styles.sliderHeader}>
        <span className={styles.title}>{categoryName}</span>
        <Link href={categoryHref} className={styles.moreLink}>
          עוד ב{categoryName}
        </Link>
      </div>

      {/* Slider */}
      <div className={styles.sliderWrapper}>
        {/* Draggable track */}
        <div
          ref={trackRef}
          className={styles.sliderTrack}
          style={{
            transform: `translateX(${scrollX}px)`,
            transition: isDragging ? 'none' : 'transform 0.25s ease-out',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClickCapture={onClickCapture}
        >
          {articles.map((article) => (
            <div key={article.id} className={styles.slide}>
              <Link href={`/articles/${article.slug}`} className={styles.slideLink} draggable={false}>
                <div className={styles.articleImageWrapper}>
                  <img
                    src={article.short_description_image_url}
                    alt={article.title}
                    className={styles.articleImage}
                    draggable={false}
                  />
                </div>
                <div className={styles.articleContent}>
                  <h3 className={styles.articleTitle}>{article.title}</h3>
                  {article.short_description && (
                    <p className={styles.articleDescription}>{article.short_description}</p>
                  )}
                  {article.author_name && (
                    <div className={styles.articleMeta}>
                      <span className={styles.author}>{article.author_name}</span>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {articles.length > 1 && (
          <>
            <button
              className={`${styles.navBtn} ${styles.prevBtn}`}
              onClick={() => moveSlide(-1)}
              disabled={scrollX <= 0}
              aria-label="כתבה קודמת"
            >
              ❮
            </button>
            <button
              className={`${styles.navBtn} ${styles.nextBtn}`}
              onClick={() => moveSlide(1)}
              disabled={scrollX >= maxScroll}
              aria-label="כתבה הבאה"
            >
              ❯
            </button>
          </>
        )}
      </div>
    </div>
  );
}

