'use client';

import { useMemo, useState } from 'react';
import styles from './shiurim.module.css';

const PAGE_SIZE = 12;

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function getChapter(title) {
  const match = String(title || '').match(/פרק\s+([^|,]+)/);
  return match ? `פרק ${match[1].trim()}` : 'שיעור';
}

function getSummary(video) {
  const description = String(video.description || '').replace(/\s+/g, ' ').trim();
  if (description) return description.slice(0, 190);
  return 'שיעור מתוך סדרת הלימוד, לצפייה מלאה ביוטיוב.';
}

export default function ShiurimGallery({ videos }) {
  const [activeRabbi, setActiveRabbi] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [page, setPage] = useState(1);

  const rabbis = useMemo(() => {
    const byId = new Map();
    videos.forEach((video) => {
      if (!byId.has(video.rabbiId)) {
        byId.set(video.rabbiId, {
          id: video.rabbiId,
          name: video.rabbiName,
          playlistIndex: video.playlistIndex,
        });
      }
    });
    return Array.from(byId.values()).sort((a, b) => a.playlistIndex - b.playlistIndex);
  }, [videos]);

  const sortedVideos = useMemo(() => {
    const selectedVideos =
      activeRabbi === 'all'
        ? videos
        : videos.filter((video) => video.rabbiId === activeRabbi);

    return [...selectedVideos].sort((a, b) => {
      if (activeRabbi === 'all' && a.playlistIndex !== b.playlistIndex) {
        return a.playlistIndex - b.playlistIndex;
      }

      return sortOrder === 'newest'
        ? b.position - a.position
        : a.position - b.position;
    });
  }, [activeRabbi, sortOrder, videos]);

  const totalPages = Math.max(1, Math.ceil(sortedVideos.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageVideos = sortedVideos.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (!videos.length) {
    return (
      <section className={styles.emptyState}>
        <h2>אין שיעורים להצגה כרגע</h2>
      </section>
    );
  }

  return (
    <section className={styles.gallery} aria-label="רשימת שיעורי תורה">
      <div className={styles.toolbar}>
        <div className={styles.filters} aria-label="סינון לפי רב">
          <button
            type="button"
            className={activeRabbi === 'all' ? styles.activeFilter : ''}
            onClick={() => {
              setActiveRabbi('all');
              setPage(1);
            }}
          >
            כל השיעורים
          </button>
          {rabbis.map((rabbi) => (
            <button
              type="button"
              key={rabbi.id}
              className={activeRabbi === rabbi.id ? styles.activeFilter : ''}
              onClick={() => {
                setActiveRabbi(rabbi.id);
                setPage(1);
              }}
            >
              {rabbi.name}
            </button>
          ))}
        </div>

        <div className={styles.sortControl} aria-label="סידור שיעורים">
          <button
            type="button"
            className={sortOrder === 'newest' ? styles.activeSort : ''}
            onClick={() => {
              setSortOrder('newest');
              setPage(1);
            }}
          >
            חדש לישן
          </button>
          <button
            type="button"
            className={sortOrder === 'oldest' ? styles.activeSort : ''}
            onClick={() => {
              setSortOrder('oldest');
              setPage(1);
            }}
          >
            ישן לחדש
          </button>
        </div>
      </div>

      <div className={styles.lessonList}>
        {pageVideos.map((video, index) => {
          const isFirst = index === 0;

          return (
            <article
              key={video.id}
              className={`${styles.lessonCard} ${isFirst ? styles.firstLesson : ''}`}
            >
              <a className={styles.thumbWrap} href={video.url} target="_blank" rel="noopener noreferrer">
                {video.thumbnail ? (
                  <span
                    className={styles.thumbnail}
                    style={{ backgroundImage: `url(${video.thumbnail})` }}
                    aria-hidden="true"
                  />
                ) : (
                  <span className={styles.noThumb}>שיעור תורה</span>
                )}
                <span className={styles.playMark}>▶</span>
              </a>

              <div className={styles.lessonContent}>
                <div className={styles.metaRow}>
                  <span className={styles.date}>{formatDate(video.publishedAt)}</span>
                  <span className={styles.badgeGroup}>
                    <span className={styles.pill}>{getChapter(video.title)}</span>
                    {isFirst && (
                      <span className={styles.firstPill}>
                        {sortOrder === 'newest' ? 'אחרון בסדרה' : 'ראשון בסדרה'}
                      </span>
                    )}
                  </span>
                </div>

                <h2>{video.title}</h2>
                <p>{getSummary(video)}</p>

                <div className={styles.lessonFooter}>
                  <span>{video.rabbiName}</span>
                  <a href={video.url} target="_blank" rel="noopener noreferrer">
                    צפייה בשיעור המלא
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {totalPages > 1 && (
        <nav className={styles.pagination} aria-label="עמודי שיעורים">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={currentPage === 1}
          >
            הקודם
          </button>
          <span>
            עמוד {currentPage} מתוך {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={currentPage === totalPages}
          >
            הבא
          </button>
        </nav>
      )}
    </section>
  );
}
