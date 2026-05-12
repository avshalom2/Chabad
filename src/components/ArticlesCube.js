'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './ArticlesCube.module.css';

export default function ArticlesCube({ categoryId, categorySlug, categoryName, categoryDefaultColumns }) {
  const [articles, setArticles] = useState([]);
  const [columns, setColumns] = useState(Number(categoryDefaultColumns) || 3);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryId && !categorySlug) {
      setLoading(false);
      return;
    }

    async function fetchArticles() {
      try {
        const param = categoryId ? `categoryId=${categoryId}` : `categorySlug=${categorySlug}`;
        const [articlesRes, categoriesRes] = await Promise.all([
          fetch(`/api/articles/by-category?${param}&limit=12`),
          fetch('/api/categories?type=articles-cube'),
        ]);
        const data = await articlesRes.json();
        const categories = await categoriesRes.json();
        const selectedCategory = Array.isArray(categories)
          ? categories.find((cat) => (
            (categoryId && String(cat.id) === String(categoryId)) ||
            (categorySlug && cat.slug === categorySlug)
          ))
          : null;

        if (selectedCategory?.default_columns) {
          setColumns(Math.max(1, Math.min(6, Number(selectedCategory.default_columns) || 3)));
        }

        setArticles(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch articles cube:', error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, [categoryId, categorySlug]);

  if (loading) {
    return (
      <section className={styles.section} dir="rtl">
        <div className={styles.status}>טוען כתבות...</div>
      </section>
    );
  }

  if (articles.length === 0) {
    return (
      <section className={styles.section} dir="rtl">
        <div className={styles.status}>אין כתבות להצגה</div>
      </section>
    );
  }

  return (
    <section
      className={styles.section}
      dir="rtl"
      aria-label={categoryName || 'Articles Cube'}
      style={{ '--cube-columns': columns }}
    >
      {categoryName && <h2 className={styles.heading}>{categoryName}</h2>}
      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {articles.map((article, index) => {
          const imageUrl = article.short_description_image_url || article.featured_image;

          return (
            <Link key={article.id} href={`/articles/${article.slug}`} className={styles.card}>
              <div className={styles.media}>
                {imageUrl ? (
                  <img src={imageUrl} alt={article.title} className={styles.image} />
                ) : (
                  <span className={styles.fallbackIcon} aria-hidden="true">
                    {['✦', '◆', '●', '✧'][index % 4]}
                  </span>
                )}
              </div>

              <h3>{article.title}</h3>
              {(article.short_description || article.excerpt) && (
                <p>{article.short_description || article.excerpt}</p>
              )}

              <div className={styles.more}>
                <span>←</span>
                <span>לפרטים</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
