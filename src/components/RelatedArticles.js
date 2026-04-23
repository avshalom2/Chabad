import Link from 'next/link';
import styles from './RelatedArticles.module.css';

export default function RelatedArticles({ articles, categoryName, categorySlug }) {
  if (!articles || articles.length === 0) return null;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.title}>{categoryName} – כתבות נוספות</span>
      </div>
      <ul className={styles.list}>
        {articles.map((article) => (
          <li key={article.id} className={styles.item}>
            <Link href={`/articles/${article.slug}`} className={styles.itemLink}>
              {article.short_description_image_url && (
                <div className={styles.thumb}>
                  <img
                    src={article.short_description_image_url}
                    alt={article.title}
                    className={styles.thumbImg}
                  />
                </div>
              )}
              <div className={styles.itemContent}>
                <span className={styles.itemTitle}>{article.title}</span>
                {article.short_description && (
                  <span className={styles.itemDesc}>{article.short_description}</span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <Link href={`/category/${categorySlug}`} className={styles.moreLink}>
        לכל הכתבות ב{categoryName} »
      </Link>
    </aside>
  );
}
