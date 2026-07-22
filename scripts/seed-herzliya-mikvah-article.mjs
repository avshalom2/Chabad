import { getPool } from '../src/lib/db.js';

const article = {
  title: 'מקווה הרצליה פיתוח – שעות פתיחה ודרכי הגעה',
  slug: 'herzliya-pituach-mikvah-hours-location',
  description: 'כל המידע הדרוש לביקור במקווה הרצליה פיתוח: כתובת, שעת פתיחה, טלפון ומפת הגעה.',
  content: `
    <div class="article-content-box" style="--article-box-width:calc(100% - 1.5rem);--article-box-padding:32px 28px;--article-box-radius:24px;--article-box-bg:linear-gradient(135deg,#5d1022 0%,#8b263d 58%,#b77942 100%);--article-box-color:#fff3e8;--article-box-title-color:#ffffff;--article-box-title-size:1.8rem;">
      <p><strong>מקווה הרצליה פיתוח</strong></p>
      <p>מידע שימושי לקראת ההגעה למקווה: שעות פתיחה, כתובת וטלפון לבירורים.</p>
    </div>

    <h2>שעות פתיחה</h2>
    <div class="article-content-box" style="--article-box-width:calc(100% - 1.5rem);--article-box-padding:24px;--article-box-bg:#fff9f2;--article-box-title-color:#7a1428;--article-box-align:right;">
      <p><strong>פתיחה מדי ערב בשעה 18:00</strong></p>
      <p>שעות הפעילות עשויות להשתנות בהתאם לעונה, לשבתות ולחגים. מומלץ להתקשר ולוודא לפני ההגעה.</p>
    </div>

    <h2>כתובת ויצירת קשר</h2>
    <p><strong>כתובת:</strong> רחוב שלמה המלך 34, הרצליה</p>
    <p><strong>טלפון:</strong> <a href="tel:098352246">09-835-2246</a></p>
    <div class="article-content-box" style="--article-box-width:calc(100% - 1.5rem);--article-box-padding:20px 24px;--article-box-bg:#eef8ff;--article-box-title-color:#0877b9;--article-box-color:#334155;--article-box-shadow:none;">
      <p><strong>ניווט ישיר למקווה</strong></p>
      <p><a href="https://www.waze.com/ul?q=Shlomo%20HaMelekh%2034%2C%20Herzliya&amp;navigate=yes" target="_blank" rel="noopener noreferrer"><strong>פתיחת ניווט עם Waze</strong></a></p>
    </div>

    <h2>מפת הגעה</h2>
    <div class="article-map" src="https://maps.google.com/maps?q=Shlomo%20ha-Melekh%20St%2034%2C%20Herzliya&amp;t=&amp;z=16&amp;ie=UTF8&amp;iwloc=&amp;output=embed" title="מפת הגעה למקווה הרצליה פיתוח"><iframe src="https://maps.google.com/maps?q=Shlomo%20ha-Melekh%20St%2034%2C%20Herzliya&amp;t=&amp;z=16&amp;ie=UTF8&amp;iwloc=&amp;output=embed" title="מפת הגעה למקווה הרצליה פיתוח" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>

    <blockquote>לשמירה על פרטיות ונוחות, מומלץ לתאם או לוודא את שעות הפעילות בטלפון לפני היציאה.</blockquote>
  `,
};

const pool = await getPool();

try {
  await pool.query('BEGIN');

  const categoryResult = await pool.query(
    `SELECT id, name FROM categories
     WHERE name = $1 OR slug IN ($2, $3)
     LIMIT 1`,
    ['מקווה טהרה', 'מקווה-טהרה', 'mikvah-taharah']
  );
  const category = categoryResult.rows[0];
  if (!category) throw new Error('הקטגוריה "מקווה טהרה" לא נמצאה');

  const articleResult = await pool.query(
    `INSERT INTO articles
      (title, slug, excerpt, short_description, content, category_id, status,
       published_at, template, article_type, is_main_article, is_free_html)
     VALUES ($1, $2, $3, $3, $4, $5, 'published', NOW(), 'standard', 'article', FALSE, FALSE)
     ON CONFLICT (slug) DO UPDATE SET
       title = EXCLUDED.title,
       excerpt = EXCLUDED.excerpt,
       short_description = EXCLUDED.short_description,
       content = EXCLUDED.content,
       category_id = EXCLUDED.category_id,
       status = 'published',
       published_at = COALESCE(articles.published_at, NOW()),
       template = 'standard',
       article_type = 'article',
       is_free_html = FALSE,
       updated_at = NOW()
     RETURNING id, title, slug, category_id, status`,
    [article.title, article.slug, article.description, article.content, category.id]
  );

  const customUrl = `/articles/${article.slug}`;
  const updatedCategory = await pool.query(
    `UPDATE categories
     SET slug = $1, custom_url = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING id, name, slug, custom_url`,
    ['mikvah-taharah', customUrl, category.id]
  );

  await pool.query('COMMIT');
  console.log(JSON.stringify({ article: articleResult.rows[0], category: updatedCategory.rows[0] }, null, 2));
} catch (error) {
  await pool.query('ROLLBACK');
  throw error;
} finally {
  await pool.end?.();
}
