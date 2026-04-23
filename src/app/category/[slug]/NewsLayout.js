'use client';

import Link from 'next/link';
import styles from './news.module.css';

export default function NewsLayout({ category, articles }) {
  if (articles.length === 0) {
    return <div className={styles.empty}>אין כתבות בחדשות עדיין.</div>;
  }

  const mainArticle = articles[0];
  const otherArticles = articles.slice(1);

  return (
    <div className={styles.newsContainer}>
      {/* Header bar */}
      <div className={styles.newsHeader}>
        <span className={styles.moreLabel}>עוד ב{category.name}</span>
        <span className={styles.headerLabel}>{category.name}</span>
      </div>

      <div className={styles.newsContent}>
        {/* RIGHT: image with caption — first in DOM so it sits on the right in RTL */}
        {mainArticle.short_description_image_url && (
          <div className={styles.featuredImageWrap}>
            <Link href={`/articles/${mainArticle.slug}`}>
              <img
                src={mainArticle.short_description_image_url}
                alt={mainArticle.title}
                className={styles.featuredImage}
              />
            </Link>
            <p className={styles.featuredCaption}>
              <Link href={`/articles/${mainArticle.slug}`}>{mainArticle.title}</Link>
            </p>
          </div>
        )}

        {/* LEFT: Titles-only list — all articles */}
        <div className={styles.articlesList}>
          {/* Main article (only if no image, to avoid duplicate) */}
          {!mainArticle.short_description_image_url && (
            <>
              <div className={styles.articleItem}>
                <h3 className={styles.mainTitle}>
                  <Link href={`/articles/${mainArticle.slug}`}>{mainArticle.title}</Link>
                </h3>
                <p className={styles.meta}>
                  {mainArticle.author_name && <span>{mainArticle.author_name}</span>}
                  {mainArticle.author_name && mainArticle.published_at && <span className={styles.sep}> | </span>}
                  {mainArticle.published_at && (
                    <span>{new Date(mainArticle.published_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
                  )}
                </p>
              </div>
              <div className={styles.divider} />
            </>
          )}

          {/* Other articles */}
          {otherArticles.map((article) => (
            <div key={article.id} className={styles.articleItem}>
              <h4 className={styles.articleTitle}>
                <Link href={`/articles/${article.slug}`}>{article.title}</Link>
              </h4>
              <p className={styles.meta}>
                {article.author_name && <span>{article.author_name}</span>}
                {article.author_name && article.published_at && <span className={styles.sep}> | </span>}
                {article.published_at && (
                  <span>{new Date(article.published_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
