import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getArticlesByCategorySlug, getParentCategoryOverview } from '@/lib/articles.js';
import CategoryContent from './CategoryContent.js';
import styles from './category.module.css';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { category } = await getArticlesByCategorySlug(slug);
  if (!category) return { title: 'קטגוריה לא נמצאה' };
  return { title: category.name };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const { category, mainArticle, articles, total } = await getArticlesByCategorySlug(slug);

  if (!category) notFound();

  // For parent categories (no parent_id), fetch subcategory overview
  let subcategoryOverview = null;
  if (!category.parent_id) {
    subcategoryOverview = await getParentCategoryOverview(slug);
  }

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/">ראשי</Link>
        {category.parentCategory && (
          <>
            <span> « </span>
            <Link href={`/category/${category.parentCategory.slug}`}>
              {category.parentCategory.name}
            </Link>
          </>
        )}
        <span> « </span>
        <span>{category.name}</span>
      </div>

      {/* Category Header */}
      <div className={styles.categoryHeader}>
        <h1>{category.name}</h1>
        {category.description && (
          <p className={styles.categoryDesc}>{category.description}</p>
        )}
        <span className={styles.articleCount}>
          {total} {
            category.type_slug === 'products' ? 'מוצרים' : 
            category.type_slug === 'news' ? 'חדשות' : 
            'כתבות'
          }
        </span>
      </div>

      {/* Content - with column selector for products */}
      <CategoryContent category={category} mainArticle={mainArticle} articles={articles} total={total} subcategoryOverview={subcategoryOverview} />
    </div>
  );
}
