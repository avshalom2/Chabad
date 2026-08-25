'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './TorahVideosSlider.module.css';

export default function TorahVideosSlider({ onVisibilityChange }) {
  const [videos, setVideos] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const visibilityCallback = useRef(onVisibilityChange);

  useEffect(() => {
    visibilityCallback.current = onVisibilityChange;
  }, [onVisibilityChange]);

  useEffect(() => {
    let active = true;

    fetch('/api/shiurim')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Failed to load videos')))
      .then((data) => {
        if (!active) return;
        const nextVideos = Array.isArray(data.videos) ? data.videos : [];
        setVideos(nextVideos);
        visibilityCallback.current?.(nextVideos.length > 0);
      })
      .catch(() => {
        if (active) visibilityCallback.current?.(false);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  if (loading) return <div className={styles.loading}>טוען שיעורי תורה...</div>;
  if (!videos.length) return null;

  const video = videos[current];
  const move = (step) => setCurrent((index) => (index + step + videos.length) % videos.length);

  return (
    <section className={styles.slider} aria-label="שיעורי תורה אחרונים">
      <header className={styles.header}>
        <h2>שיעורי תורה</h2>
        <Link href="/shiurim">לכל השיעורים</Link>
      </header>

      <div className={styles.videoWrap}>
        <iframe
          key={video.videoId}
          src={`${video.embedUrl}?rel=0`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
        {videos.length > 1 && (
          <>
            <button type="button" className={`${styles.arrow} ${styles.previous}`} onClick={() => move(-1)} aria-label="השיעור הקודם">❮</button>
            <button type="button" className={`${styles.arrow} ${styles.next}`} onClick={() => move(1)} aria-label="השיעור הבא">❯</button>
          </>
        )}
      </div>

      <div className={styles.details}>
        <strong>{video.title}</strong>
        <span>{video.rabbiName}</span>
        <span className={styles.counter}>{current + 1} / {videos.length}</span>
      </div>
    </section>
  );
}
