'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '@/app/category/[slug]/news.module.css';

export default function NewsBox({ categoryId, categorySlug, categoryName }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryId && !categorySlug) return;

    async function fetchArticles() {
      try {
        const param = categoryId ? `categoryId=${categoryId}` : `categorySlug=${categorySlug}`;
        const res = await fetch(`/api/articles/by-category?${param}&limit=6`);
        const data = await res.json();
        setArticles(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to fetch news articles:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, [categoryId, categorySlug]);

  if (loading) {
    return (
      <div className={styles.newsContainer}>
        <div className={styles.newsHeader}>
          <span className={styles.moreLabel}></span>
          <span className={styles.headerLabel}>{categoryName || 'חדשות'}</span>
        </div>
        <div style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>טוען...</div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className={styles.newsContainer}>
        <div className={styles.newsHeader}>
          <span className={styles.moreLabel}></span>
          <span className={styles.headerLabel}>{categoryName || 'חדשות'}</span>
        </div>
        <div style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>אין כתבות</div>
      </div>
    );
  }

  const mainArticle = articles[0];
  const otherArticles = articles.slice(1);
  const categoryHref = categorySlug ? `/category/${categorySlug}` : '#';

  return (
    <div className={styles.newsContainer}>
      <div className={styles.newsHeader}>
        <Link href={categoryHref} style={{ color: 'white', fontSize: '0.8rem', textDecoration: 'none', opacity: 0.88 }}>
          עוד ב{categoryName}
        </Link>
        <span className={styles.headerLabel}>{categoryName}</span>
      </div>

      <div className={styles.newsContent}>
        {mainArticle.short_description_image_url && (
          <div className={styles.featuredImageWrap}>
            <Link href={`/articles/${mainArticle.slug}`}>
              <img
                src={mainArticle.short_description_image_url}
                alt={mainArticle.title}
                className={styles.featuredImage}
              />
            </Link>
          </div>
        )}

        <div className={styles.articlesList}>
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
