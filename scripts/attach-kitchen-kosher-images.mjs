import { getPool } from '../src/lib/db.js';

const images = [
  { articleId: 454, file: 'kitchen-kosher-meaning-v3.jpg', alt: 'הבנת משמעות הכשרת מטבח ביהדות' },
  { articleId: 455, file: 'kitchen-kosher-halacha-v3.jpg', alt: 'הכשרת מטבח - הגדרה והלכות' },
  { articleId: 458, file: 'kitchen-kosher-preparation-v3.jpg', alt: 'הכשרת מטבח - הכנה וביצוע' },
  { articleId: 460, file: 'kitchen-kosher-qa-v3.jpg', alt: 'הכשרת מטבח - שאלות ותשובות' },
  { articleId: 461, file: 'kitchen-kosher-spiritual-v3.jpg', alt: 'המשמעות הרוחנית של הכשרת מטבח' },
];

const pool = await getPool();
const client = await pool.connect();

try {
  await client.query('BEGIN');

  for (const image of images) {
    const imageUrl = `/uploads/home-business/${image.file}`;
    let imageId;
    const existing = await client.query(
      'SELECT id FROM article_images WHERE article_id = $1 AND image_url = $2 LIMIT 1',
      [image.articleId, imageUrl],
    );

    if (existing.rows.length > 0) {
      imageId = existing.rows[0].id;
    } else {
      const inserted = await client.query(
        `INSERT INTO article_images (article_id, image_url, alt_text, display_order)
         VALUES ($1, $2, $3, 0)
         RETURNING id`,
        [image.articleId, imageUrl, image.alt],
      );
      imageId = inserted.rows[0].id;
    }

    await client.query(
      'UPDATE articles SET short_description_image = $1 WHERE id = $2',
      [String(imageId), image.articleId],
    );
  }

  await client.query('COMMIT');
  const verification = await client.query(`
    SELECT COUNT(*)::integer AS image_count
    FROM articles a
    JOIN categories c ON c.id = a.category_id
    JOIN article_images ai ON ai.id = a.short_description_image::integer
    WHERE c.slug = 'kitchen-kosher'
  `);
  console.log(`Verified images on ${verification.rows[0].image_count} kitchen-kosher articles.`);
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
  await pool.end();
}
