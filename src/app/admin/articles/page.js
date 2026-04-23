'use client';

import { useEffect, useState } from 'react';
import styles from './articles.module.css';

const CategoryIcon = ({ name }) => {
  const icons = {
    'חגים': '🎁', 'חדשות': '📰', 'שאלות ותשובות': '❓',
    'מוצרים': '🛍️', 'לקרוא וללמוד': '📖', 'מעגל החיים': '🔄',
    'על הרבי': '👤', 'לבית ולעסק': '🏠', 'חנות חב"ד': '🏪',
    'זיכוי הרבים': '⭐', 'פרויקטים מיוחדים': '🚀',
  };
  return <span className={styles.categoryIcon}>{icons[name] || '📄'}</span>;
};

const ArticleRow = ({ article }) => (
  <tr key={article.id} className={styles.tableRow}>
    <td>
      <div className={styles.titleCell}>
        <span className={styles.titleText}>{article.title}</span>
      </div>
    </td>
    <td>
      <span className={`${styles.status} ${article.status === 'published' ? styles.statusPublished : article.status === 'draft' ? styles.statusDraft : styles.statusArchived}`}>
        {article.status === 'published' ? 'מפורסם' : article.status === 'draft' ? 'טיוטה' : article.status}
      </span>
    </td>
    <td className={styles.centerCell}>{article.price ? `₪${parseFloat(article.price).toFixed(2)}` : '—'}</td>
    <td className={styles.centerCell}>
      <span className={article.is_purchasable ? styles.yes : styles.no}>
        {article.is_purchasable ? '✓' : '–'}
      </span>
    </td>
    <td className={styles.centerCell}>{article.is_purchasable && article.stock !== null ? article.stock : '—'}</td>
    <td className={styles.centerCell}>{article.published_at ? new Date(article.published_at).toLocaleDateString('he-IL') : '—'}</td>
    <td className={styles.actions}>
      <a href={`/admin/articles/${article.id}/edit`} className={styles.editBtn} title="עריכה">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </a>
      <a href={`/admin/articles/${article.id}/delete`} className={styles.deleteBtn} title="מחיקה">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
      </a>
    </td>
  </tr>
);

const ArticleTable = ({ articles }) => (
  <table className={styles.table}>
    <thead>
      <tr>
        <th>כותרת</th>
        <th>סטטוס</th>
        <th className={styles.centerCell}>מחיר</th>
        <th className={styles.centerCell}>למכירה</th>
        <th className={styles.centerCell}>מלאי</th>
        <th className={styles.centerCell}>פורסם</th>
        <th>פעולות</th>
      </tr>
    </thead>
    <tbody>
      {articles.map((article) => <ArticleRow key={article.id} article={article} />)}
    </tbody>
  </table>
);

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      const res = await fetch('/api/admin/articles');
      const data = await res.json();
      setArticles(Array.isArray(data) ? data : []);
      setLoading(false);
    }
    fetchArticles();
  }, []);

  const grouped = (articles || []).reduce((acc, article) => {
    const parentName = article.parent_category_name || article.category_name;
    const categoryName = article.parent_category_name ? article.category_name : null;
    if (!acc[parentName]) acc[parentName] = {};
    const key = categoryName || '__direct__';
    if (!acc[parentName][key]) acc[parentName][key] = [];
    acc[parentName][key].push(article);
    return acc;
  }, {});

  const sortedParents = Object.keys(grouped).sort();

  const toggleGroup = (key) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const countArticles = (parentName) => {
    return Object.values(grouped[parentName] || {}).reduce((sum, arr) => sum + arr.length, 0);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>טוען כתבות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>כתבות</h1>
        <a href="/admin/articles/new" className={styles.addButton}>
          + הוספת כתבה
        </a>
      </div>

      {articles.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📄</div>
          <p>אין כתבות עדיין.</p>
          <a href="/admin/articles/new" className={styles.addButton}>צור את הראשונה →</a>
        </div>
      ) : (
        <div className={styles.accordionView}>
          {sortedParents.map((parentName) => {
            const parentKey = `parent-${parentName}`;
            const subCategories = Object.keys(grouped[parentName]).sort();
            const isExpanded = expandedGroups[parentKey];
            const count = countArticles(parentName);

            return (
              <div key={parentKey} className={`${styles.accordionItem} ${isExpanded ? styles.accordionItemOpen : ''}`}>
                <button className={styles.accordionHeader} onClick={() => toggleGroup(parentKey)}>
                  <div className={styles.accordionHeaderRight}>
                    <CategoryIcon name={parentName} />
                    <span className={styles.accordionTitle}>{parentName}</span>
                  </div>
                  <span className={`${styles.accordionChevron} ${isExpanded ? styles.chevronOpen : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                  </span>
                </button>

                {isExpanded && (
                  <div className={styles.accordionContent}>
                    {subCategories.length === 1 && subCategories[0] === '__direct__' ? (
                      <ArticleTable articles={grouped[parentName]['__direct__']} />
                    ) : (
                      subCategories.filter(c => c !== '__direct__').map((categoryName) => {
                        const categoryKey = `category-${categoryName}`;
                        const isCatExpanded = expandedGroups[categoryKey];
                        return (
                          <div key={categoryKey} className={styles.nestedAccordionItem}>
                            <button className={styles.nestedAccordionHeader} onClick={() => toggleGroup(categoryKey)}>
                              <div className={styles.accordionHeaderRight}>
                                <span className={styles.nestedAccordionTitle}>{categoryName}</span>
                              </div>
                              <span className={`${styles.accordionChevron} ${isCatExpanded ? styles.chevronOpen : ''}`}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                              </span>
                            </button>
                            {isCatExpanded && (
                              <div className={styles.nestedAccordionContent}>
                                <ArticleTable articles={grouped[parentName][categoryName]} />
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
