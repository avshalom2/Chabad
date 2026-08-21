import { getPool } from '../src/lib/db.js';

const TITLE = 'הבנת משמעות בר מצווה ביהדות';
const SLUG = 'bar-mitzvah-prep-1';
const CATEGORY_ID = 56;
const DESCRIPTION = 'בר מצווה היא הרגע שבו נער יהודי נכנס לעולם של אחריות, מצוות ושליחות אישית מתוך שמחה ובגרות.';
const CONTENT = `<h2>מה חשוב לדעת?</h2><p>בר מצווה מציינת את השלב שבו נער יהודי נעשה מחויב במצוות ומקבל אחריות אישית על הקשר שלו עם הקב&quot;ה. זו נקודת פתיחה לחיים של תורה, תפילה, חסד והשפעה טובה על הבית והסביבה.</p><ul><li><p>המשמעות העיקרית היא קבלת אחריות יהודית אישית, ולא רק אירוע משפחתי.</p></li><li><p>זהו זמן מתאים להתחזק בהנחת תפילין, בתפילה, בלימוד תורה ובנתינת צדקה.</p></li><li><p>החגיגה מקבלת עומק כאשר היא מחוברת ללימוד, להחלטה טובה ולמעשה של נתינה.</p></li></ul><h3>איך בית חב&quot;ד יכול לעזור?</h3><ul><li><p>הדרכה לנער ולמשפחה על משמעות היום ועל מבנה אירוע יהודי ומכובד.</p></li><li><p>לימוד הנחת תפילין, הכנה לתפילה, לעלייה לתורה ולאמירת דבר תורה.</p></li><li><p>סיוע בבניית תוכנית הכנה אישית לנער לקראת בר המצווה.</p></li></ul><div class="article-content-box" style="--article-box-width: 100%; --article-box-align: right;"><p><strong>נקודה לחיים:</strong> כאשר בר מצווה הופכת לרגע של בחירה טובה וקבלת אחריות, היא נשארת עם הנער הרבה אחרי שהאירוע מסתיים.</p></div>`;

const pool = await getPool();
const client = await pool.connect();

try {
  await client.query('BEGIN');

  const existing = await client.query(
    'SELECT id FROM articles WHERE slug = $1 OR (category_id = $2 AND title = $3) LIMIT 1',
    [SLUG, CATEGORY_ID, TITLE],
  );

  if (existing.rows.length > 0) {
    await client.query('ROLLBACK');
    console.log(`Article already exists with id ${existing.rows[0].id}; no changes made.`);
    process.exitCode = 0;
  } else {
    await client.query(
      'UPDATE articles SET sort_order = sort_order + 1, is_main_article = false WHERE category_id = $1',
      [CATEGORY_ID],
    );

    const inserted = await client.query(
      `INSERT INTO articles
        (title, slug, excerpt, short_description, content, category_id, article_type,
         featured_image, status, template, is_main_article, published_at, is_free_html,
         show_contact_form, sort_order, show_whatsapp_button)
       VALUES ($1, $2, $3, $3, $4, $5, 'article', '', 'published', 'standard',
               true, NOW(), false, false, 1, true)
       RETURNING id`,
      [TITLE, SLUG, DESCRIPTION, CONTENT, CATEGORY_ID],
    );

    const articleId = inserted.rows[0].id;
    const image = await client.query(
      `INSERT INTO article_images (article_id, image_url, alt_text, display_order)
       VALUES ($1, '/uploads/lifecycle/bar-mitzvah-halacha.png', $2, 0)
       RETURNING id`,
      [articleId, TITLE],
    );

    await client.query(
      'UPDATE articles SET short_description_image = $1 WHERE id = $2',
      [String(image.rows[0].id), articleId],
    );

    await client.query('COMMIT');
    console.log(JSON.stringify({ id: articleId, title: TITLE, slug: SLUG, category_id: CATEGORY_ID }));
  }
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
  await pool.end();
}
