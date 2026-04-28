'use client';

import { useState } from 'react';
import Link from 'next/link';
import NewsLayout from './NewsLayout.js';
import styles from './category.module.css';
import productStyles from './products.module.css';

export default function CategoryContent({ category, mainArticle, articles, total, subcategoryOverview }) {
  // Use default_columns from category if available, otherwise 3
  const defaultColumns = category.default_columns ? parseInt(category.default_columns) : 3;

  // ── NEWS CATEGORY LAYOUT ──
  if (category.type_slug === 'news') {
    return <NewsLayout category={category} articles={articles} />;
  }

  // ── PARENT CATEGORY OVERVIEW ──
  if (subcategoryOverview && subcategoryOverview.subcategories.length > 0) {
    const cols = category.default_columns ? parseInt(category.default_columns) : 3;
    return (
      <div
        className={styles.parentOverviewGrid}
        style={{ '--grid-columns': cols }}
      >
        {subcategoryOverview.subcategories.map((sub) => (
          <div key={sub.id} className={styles.subcatCard}>
            {sub.firstArticle ? (
              <>
                {/* Article image */}
                {sub.firstArticle.short_description_image_url && (
                  <Link href={`/category/${sub.slug}`} className={styles.subcatImageLink}>
                    <img
                      src={sub.firstArticle.short_description_image_url}
                      alt={sub.firstArticle.title}
                      className={styles.subcatImage}
                    />
                  </Link>
                )}

                {/* Card body */}
                <div className={styles.subcatBody}>
                  <h2 className={styles.subcatArticleTitle}>
                    <Link href={`/category/${sub.slug}`}>{sub.firstArticle.title}</Link>
                  </h2>
                  {sub.firstArticle.short_description && (
                    <p className={styles.subcatArticleDesc}>{sub.firstArticle.short_description}</p>
                  )}
                </div>

                {/* Card footer */}
                <div className={styles.subcatFooter}>
                  <Link href={`/category/${sub.slug}`} className={styles.subcatCategoryLink}>
                    עבור ל{sub.name} »
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Subcategory with no articles — just the link */}
                <div className={styles.subcatBody}>
                  <p className={styles.subcatEmpty}>אין כתבות עדיין</p>
                </div>
                <div className={styles.subcatFooter}>
                  <Link href={`/category/${sub.slug}`} className={styles.subcatCategoryLink}>
                    עבור ל{sub.name} »
                  </Link>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* ── FEATURED/MAIN ARTICLE ── */}
      {mainArticle && category.type_slug !== 'products' && (
        <div className={`${styles.featuredArticle} ${styles[`featured-${mainArticle.template}`]}`}>
          {mainArticle.template === 'featured-banner' ? (
            // Featured banner template: large image left, banner + title + desc right
            <div className={styles.featuredBannerContent}>
              {mainArticle.short_description_image_url && (
                <Link href={`/articles/${mainArticle.slug}`} className={styles.bannerImageContainer}>
                  <img src={mainArticle.short_description_image_url} alt={mainArticle.title} className={styles.bannerImage} />
                </Link>
              )}
              <div className={styles.bannerTextSection}>
               
                <h2 className={styles.bannerTitle}>
                  <Link href={`/articles/${mainArticle.slug}`}>{mainArticle.title}</Link>
                </h2>
                {mainArticle.short_description && (
                  <p className={styles.bannerDesc}>{mainArticle.short_description}</p>
                )}
                <Link href={`/articles/${mainArticle.slug}`} className={styles.bannerLink}>
                  קרא עוד
                </Link>
              </div>
            </div>
          ) : (
            // Standard template as featured (still one per row)
            <div className={styles.standardFeatured}>
              {mainArticle.short_description_image_url && (
                <Link href={`/articles/${mainArticle.slug}`} className={styles.standardFeaturedImageLink}>
                  <img
                    src={mainArticle.short_description_image_url}
                    alt={mainArticle.title}
                    className={styles.standardFeaturedImage}
                  />
                </Link>
              )}
              <div className={styles.articleBody}>
                <h2 className={styles.articleTitle}>
                  <Link href={`/articles/${mainArticle.slug}`}>{mainArticle.title}</Link>
                </h2>
                {mainArticle.short_description && (
                  <p className={styles.articleDesc}>{mainArticle.short_description}</p>
                )}
              </div>
              <div className={styles.articleFooter}>
                <Link href={`/articles/${mainArticle.slug}`} className={styles.readMore}>לכתבה</Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── REGULAR ARTICLES/PRODUCTS GRID ── */}
      {articles.length === 0 && !mainArticle ? (
        <div className={styles.empty}>אין פריטים בקטגוריה זו עדיין.</div>
      ) : (
        <div
          className={category.type_slug === 'products' ? productStyles.productsGrid : styles.articlesGrid}
          style={{ '--grid-columns': defaultColumns }}
        >
          {articles.map((article) => (
            <div
              key={article.id}
              className={category.type_slug === 'products' ? productStyles.productCard : styles.articleCard}
            >
              {category.type_slug === 'products' ? (
                // ── PRODUCT CARD ──
                <>
                  {/* Sale badge */}
                  {article.stock !== null && article.stock < 10 && article.stock > 0 && (
                    <span className={productStyles.saleBadge}>מבצע!</span>
                  )}

                  {/* Product image */}
                  <Link href={`/articles/${article.slug}`} className={productStyles.imageContainer}>
                    {article.short_description_image_url ? (
                      <img
                        src={article.short_description_image_url}
                        alt={article.title}
                      />
                    ) : (
                      <div className={productStyles.imagePlaceholder}>
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                          <path d="M21 15l-5-5L5 21"/>
                        </svg>
                      </div>
                    )}
                  </Link>

                  {/* Product info */}
                  <div className={productStyles.productInfo}>
                    <h2 className={productStyles.productTitle}>
                      <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                    </h2>

                    {article.price && (
                      <div className={productStyles.priceRow}>
                        <span className={productStyles.price}>{Number(article.price).toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Action button */}
                  <div className={productStyles.productActions}>
                    {article.stock === 0 ? (
                      <span className={`${productStyles.addToCartBtn} ${productStyles.outOfStock}`}>
                        אזל המלאי
                      </span>
                    ) : article.is_purchasable ? (
                      <Link href={`/articles/${article.slug}`} className={`${productStyles.addToCartBtn} ${productStyles.addToCartBtnPrimary}`}>
                        הוספה לסל
                      </Link>
                    ) : (
                      <Link href={`/articles/${article.slug}`} className={productStyles.addToCartBtn}>
                        מידע נוסף
                      </Link>
                    )}
                  </div>
                </>
              ) : (
                // ── ARTICLE CARD ──
                <>
                  <div className={styles.articleBody}>
                    <h2 className={styles.articleTitle}>
                      <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                    </h2>
                    <div className={styles.descriptionRow}>
                      {article.short_description_image_url && (
                        <Link href={`/articles/${article.slug}`} className={styles.imageLink}>
                          <img src={article.short_description_image_url} alt={article.title} className={styles.articleImage} />
                        </Link>
                      )}
                      {article.short_description && (
                        <p className={styles.articleDesc}>{article.short_description}</p>
                      )}
                    </div>
                  </div>
                  <div className={styles.articleFooter}>
                    <button className={styles.shareBtn} aria-label="שתף">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                      </svg>
                    </button>
                    <Link href={`/articles/${article.slug}`} className={styles.readMore}>לכתבה</Link>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
