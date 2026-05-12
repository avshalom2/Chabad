import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config({ path: '.env.local' });

const { Pool } = pkg;

const services = [
  {
    title: 'הכנת לבר מצווה',
    slug: 'hachanah-lebar-mitzvah',
    short_description: 'ליווי אישי ומקצועי של הבחור ומשפחתו — לימוד פרשה, תפילה, הנחת תפילין ועוד.',
  },
  {
    title: 'תיקון ומכירת תפילין',
    slug: 'tefillin-checking-and-sales',
    short_description: 'בדיקת סת"ם מוסמכת, תיקון תפילין ומזוזות, ומכירת תפילין חדשים באיכות גבוהה.',
  },
  {
    title: 'שירותים לעסקים',
    slug: 'business-services',
    short_description: 'עמדות תפילין ברחבה, שיעורי תורה במקום העבודה, וסיוע מותאם לפתיחת משרד.',
  },
  {
    title: 'התקנת מזוזות',
    slug: 'mezuzah-installation',
    short_description: 'בדיקה, כתיבה והתקנת מזוזות לבתים ועסקים — עם ברכה ולפי ההלכה.',
  },
  {
    title: 'עריכת חופות',
    slug: 'chuppah-services',
    short_description: 'עריכת חופה וקידושין על ידי הרב, לכלל הזוגות — ביחד עם הכנה וליווי אישי.',
  },
  {
    title: 'טהרת המשפחה',
    slug: 'family-purity',
    short_description: 'הרצאות, ייעוץ אישי ומידע מלא על הלכות טהרת המשפחה — בצנעה ובחינוך.',
  },
];

const pool = new Pool({
  connectionString: process.env.PG_CONNECTION_STRING || process.env.DATABASE_URL,
  ssl: process.env.PG_SSLMODE === 'require' ? { rejectUnauthorized: false } : false,
});

async function main() {
  await pool.query(
    `SELECT setval(
      pg_get_serial_sequence('articles', 'id'),
      COALESCE((SELECT MAX(id) FROM articles), 1)
    )`
  );

  const categoryResult = await pool.query(
    `SELECT id, name, slug
     FROM categories
     WHERE id = $1
     LIMIT 1`,
    [8]
  );

  const category = categoryResult.rows[0];

  if (!category) {
    throw new Error('Category not found: #8');
  }

  for (const service of services) {
    const existing = await pool.query(
      'SELECT id FROM articles WHERE slug = $1 LIMIT 1',
      [service.slug]
    );

    if (existing.rows[0]) {
      await pool.query(
        `UPDATE articles
         SET title = $1,
             short_description = $2,
             excerpt = $2,
             category_id = $3,
             status = 'published',
             published_at = COALESCE(published_at, NOW()),
             updated_at = NOW()
         WHERE id = $4`,
        [service.title, service.short_description, category.id, existing.rows[0].id]
      );
      console.log(`Updated: ${service.title}`);
    } else {
      await pool.query(
        `INSERT INTO articles
          (title, slug, short_description, excerpt, content, category_id, status, published_at, template, article_type, is_main_article)
         VALUES
          ($1, $2, $3, $3, $4, $5, 'published', NOW(), 'standard', 'article', FALSE)`,
        [
          service.title,
          service.slug,
          service.short_description,
          `<p>${service.short_description}</p>`,
          category.id,
        ]
      );
      console.log(`Inserted: ${service.title}`);
    }
  }

  console.log(`Seeded ${services.length} service articles into category ${category.name} (#${category.id}).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
