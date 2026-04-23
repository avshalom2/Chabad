import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getArticleBySlug, getRelatedArticles } from '@/lib/articles';
import RelatedArticles from '@/components/RelatedArticles';
import styles from './article.module.css';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'כתבה לא נמצאה' };
  return { title: article.title };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  const related = await getRelatedArticles(article.category_id, article.id, 5);

  return (
    <main className={styles.container} dir="rtl">
      <div className={styles.layout}>
      <article className={styles.article}>

        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link href="/">ראשי</Link>
          <span> « </span>
          <Link href={`/category/${article.category_slug}`}>{article.category_name}</Link>
          <span> « </span>
          <span>{article.title}</span>
        </div>

        {/* Category Badge */}
        <div className={styles.categoryBadge}>{article.category_name}</div>

        {/* Title */}
        <h1 className={styles.title}>{article.title}</h1>

        {/* Short Description with Featured Image */}
        <div className={styles.descriptionSection}>
          <div className={styles.descriptionContent}>
            {/* Meta: Date */}
            {article.published_at && (
              <p className={styles.date}>
                {new Date(article.published_at).toLocaleDateString('he-IL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>

        </div>

        {/* Page Content (from PageBuilder) */}
        {article.content && (
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        )}

        {/* Author */}
        {article.author_name && (
          <div className={styles.author}>כתב: <strong>{article.author_name}</strong></div>
        )}

        {/* Back Link */}
        <div className={styles.backLink}>
          <Link href={`/category/${article.category_slug}`}>
            « חזרה ל{article.category_name}
          </Link>
        </div>
      </article>
      <RelatedArticles
        articles={related}
        categoryName={article.category_name}
        categorySlug={article.category_slug}
      />
      </div>
    </main>
  );
}
