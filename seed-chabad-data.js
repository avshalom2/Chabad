#!/usr/bin/env node
/**
 * Seed script for Chabad website
 * Inserts 7 parent categories with sub-categories and 10 articles per sub-category
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chabad_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const categories = [
  {
    name: 'חגים',
    slug: 'chagim',
    description: 'מידע והנושאות הקשורות לחגי ישראל ומועדים',
    subs: [
      { name: 'חגי תשרי', slug: 'tishrei-holidays' },
      { name: 'חנוכה', slug: 'hanukkah' },
      { name: 'פורים', slug: 'purim' },
      { name: 'פסח', slug: 'passover' },
      { name: 'ל"ג בעומר', slug: 'lag-baomer' },
      { name: 'שבועות', slug: 'shavuot' },
    ]
  },
  {
    name: 'מעגל החיים',
    slug: 'lifecycle',
    description: 'הדרכה ותמיכה בכל שלבי החיים החשובים',
    subs: [
      { name: 'לאמא ולתינוק', slug: 'mother-baby' },
      { name: 'חינוך יהודי', slug: 'jewish-education' },
      { name: 'מועדון ילדים', slug: 'kids-club' },
      { name: 'בת מצווה', slug: 'bat-mitzvah' },
      { name: 'הכנה לבר מצווה', slug: 'bar-mitzvah-prep' },
      { name: 'הדרכת זוגות', slug: 'couples-guidance' },
    ]
  },
  {
    name: 'לבית ולעסק',
    slug: 'home-business',
    description: 'יהדות בבית ובעסק - טיפים והדרכות',
    subs: [
      { name: 'בשבילך - יהדות בבית ובמשפחה', slug: 'for-you' },
      { name: 'הכשרת מטבח', slug: 'kitchen-kosher' },
      { name: 'חנוכת בית ומזוזות', slug: 'home-mitzvot' },
      { name: 'הדלקת נרות שבת', slug: 'shabbat-candles' },
      { name: 'ספרים', slug: 'books' },
      { name: 'תפילין ומזוזות', slug: 'tefillin-mezuzah' },
    ]
  },
  {
    name: 'זיכוי הרבים',
    slug: 'merit-masses',
    description: 'פעילויות להפצת יהדות והעלאת עמדות תפילין',
    subs: [
      { name: 'עמדת תפילין לעסקים', slug: 'tefillin-station' },
      { name: 'תפילין ליד כל אחד', slug: 'tefillin-outreach' },
      { name: 'עלוני פרשה', slug: 'parsha-pamphlet' },
      { name: 'עלוני שיחת השבוע', slug: 'weekly-talk' },
      { name: 'נרות שבת לחלוקה', slug: 'shabbat-candles-dist' },
      { name: 'עמדת תהלים', slug: 'psalms-station' },
    ]
  },
  {
    name: 'לקרוא וללמוד',
    slug: 'learn-read',
    description: 'חומרי לימוד, עלונים ומידע על יהדות',
    subs: [
      { name: 'עלונים שבועיים', slug: 'weekly-articles' },
      { name: 'הרמב"ם היומי', slug: 'rambam-daily' },
      { name: 'תהילים', slug: 'psalms' },
    ]
  },
  {
    name: 'על הרבי',
    slug: 'about-rebbe',
    description: 'מידע על הרבי השלום דובער במלובביץ',
    subs: [
      { name: 'אתר הרבי', slug: 'rebbe-site' },
      { name: 'ביקור אצל הרבי', slug: 'visit-rebbe' },
      { name: 'בקשת ברכה מהרבי', slug: 'blessing-request' },
    ]
  },
  {
    name: 'פרויקטים מיוחדים',
    slug: 'special-projects',
    description: 'פרויקטים מיוחדים ויוזמות חברתיות',
    subs: [
      { name: 'כוחות הבטחון', slug: 'idf-support' },
      { name: 'Хабад бе Алия', slug: 'chabad-ailem' },
    ]
  },
];

// Sample article content generator
function generateArticles(categoryName, subCategoryName, count = 10) {
  const articles = [];
  const topics = [
    `הבנת משמעות ${subCategoryName} ביהדות`,
    `${subCategoryName} - הגדרה והלכות`,
    `טיפים וחכמה לגבי ${subCategoryName}`,
    `סיפורים ודוגמאות מחיי הרבי בנוגע ${subCategoryName}`,
    `${subCategoryName} - הכנה וביצוע`,
    `אהלות מה"ת בעניין ${subCategoryName}`,
    `${subCategoryName} - שאלות ותשובות`,
    `המשמעות הרוחנית של ${subCategoryName}`,
    `${subCategoryName} דרך הדורות`,
    `${subCategoryName} בזמנו של הרבי`,
  ];

  const summaries = [
    `בפעם הראשונה בחיינו אנו מתמודדים עם ${subCategoryName}. במאמר זה נלמד על הדברים החשובים שצריך לדעת כדי להתמודד בהצלחה. גם נבין את ההיסטוריה והמשמעות העמוקה של נושא זה בתרבות היהודית.`,
    `${subCategoryName} זה לא רק הלכה, אלא גם ביטוי של אמונה והקשר שלנו ל-הק״ב. בשיעור זה נכיר את הפרטים המעשיים וגם את הרוח שמאחוריהם.`,
    `מה עושים כשאנו מתעסקים עם ${subCategoryName}? אילו טעויות נפוצות יש להימנע מהן? מה אומר לנו הרבי בעניין זה? כל התשובות כאן.`,
    `${subCategoryName} היא מצווה עתיקה שנעשתה במשך דורות רבים. גם בימינו היא חשובה כמו בעבר, ואולי עוד יותר. בואו נגלה יחד למה זה כל כך משמעותי.`,
    `לכל אחד מאיתנו יש שאלות בנוגע ל${subCategoryName}. האם אנו עושים זאת בצורה נכונה? מה הם הכללים והמנהגים? בקרו אצלנו כדי לקבל תשובות.`,
    `${subCategoryName} היא לא רק מצווה אלא מנהג שחיבר את כל הקהילה היהודית במשך מאות שנים. בואו נלמד על המסורת ועל איך אנחנו יכולים להמשיך אותה היום.`,
    `הרבי תמיד דגש על החשיבות של ${subCategoryName} בחיינו היומיומיים. כאן תמצאו את הדברים שאמר על זה וכיצד אנחנו יכולים ליישם זאת.`,
    `${subCategoryName} לא קל, אבל זה אפשרי! בכתבה זו נתמך אתכם עם ידע מעשי וטיפים שיעזרו לכם להצליח. נתחיל מהן הבעיות הנפוצות ביותר.`,
    `בדור שלנו, ${subCategoryName} לוקח צורה חדשה ומעניינת. כיצד אנחנו יכולים להשתמש בטכנולוגיה מודרנית כדי להשאר קרובים לערכים הקדומים? בואו נדברנו על זה.`,
    `אתם תמיד רציתם לדעת יותר על ${subCategoryName}? הנה הוא המקום לעשות זאת! מאמר זה מכסה את כל הנושאים החשובים מתחילה עד סוף.`,
  ];

  for (let i = 0; i < count; i++) {
    const title = topics[i % topics.length] + (i > 9 ? ` - חלק ${Math.floor(i / 10) + 1}` : '');
    const shortDesc = summaries[i % summaries.length];
    
    const content = `<div style="direction: rtl; text-align: right; padding: 20px; color: #333;">
      <h2>${title}</h2>
      <p>${shortDesc}</p>
      <p>זהו שיעור בנושא ${subCategoryName} שעוסק בהבנת הנושא העמוק והיישום המעשי שלו בחיי היום-יום.</p>
      <p>במסגרת של ${categoryName} אנו מציעים הדרכה מקצועית וחכמונית לגבי איך ללמוד, להבין ולהשתמש במידע זה בדרך טובה ויעילה.</p>
      <h3>נקודות עיקריות:</h3>
      <ol style="text-align: right;">
        <li>הבנת הרקע ההיסטורי והלכתי של ${subCategoryName}</li>
        <li>יישום מעשי בחיי השגרה</li>
        <li>טיפים וטריקים לקיום טוב יותר</li>
        <li>שאלות נפוצות וחידושים</li>
        <li>קישורים למידע נוסף והעמקה</li>
      </ol>
      <p>אנו מאמינים שהבנה עמוקה של ${subCategoryName} תעזור לך לחיות חיים יותר מעוררי תשומת לב וקרובים לתורה.</p>
    </div>`;

    articles.push({
      title,
      excerpt: shortDesc,
      short_description: shortDesc,
      content,
      category_id: null, // Will be set later
      status: 'published',
      published_at: new Date(),
    });
  }
  return articles;
}

async function seedData() {
  const conn = await pool.getConnection();

  try {
    console.log('🌱 Starting seed...');

    // Clear ONLY articles and subcategories we're about to create (not existing ones)
    console.log('🗑️  Clearing old articles and subcategories...');
    // Delete articles from categories that have IDs > 4 (we keep the first 4 existing)
    await conn.query('DELETE FROM articles WHERE category_id IN (SELECT id FROM categories WHERE id > 4)');
    await conn.query('DELETE FROM categories WHERE id > 4 AND parent_id IS NOT NULL');
    await conn.query('DELETE FROM categories WHERE id > 4');  

    // Insert parent categories and articles
    let articleCount = 0;
    for (let catIdx = 0; catIdx < categories.length; catIdx++) {
      const cat = categories[catIdx];

      // Check if parent category already exists
      const [existing] = await conn.query(
        'SELECT id FROM categories WHERE slug = ? AND parent_id IS NULL',
        [cat.slug]
      );
      
      let parentId;
      if (existing.length > 0) {
        parentId = existing[0].id;
        console.log(`🔄 Using existing parent: "${cat.name}" (ID: ${parentId})`);
      } else {
        // Insert parent category
        const [parentResult] = await conn.query(
          `INSERT INTO categories (name, slug, description, category_type_id, parent_id, is_active, sort_order)
           VALUES (?, ?, ?, 1, NULL, 1, ?)`,
          [cat.name, cat.slug, cat.description, catIdx]
        );
        parentId = parentResult.insertId;
        console.log(`✅ Created parent: "${cat.name}" (ID: ${parentId})`);
      }

      // Insert sub-categories and articles
      for (let subIdx = 0; subIdx < cat.subs.length; subIdx++) {
        const sub = cat.subs[subIdx];

        // Insert sub-category
        const [subResult] = await conn.query(
          `INSERT INTO categories (name, slug, description, category_type_id, parent_id, is_active, sort_order)
           VALUES (?, ?, ?, 1, ?, 1, ?)`,
          [sub.name, sub.slug, `${sub.name} - קטגוריה`, parentId, subIdx]
        );
        const subCatId = subResult.insertId;
        console.log(`   └─ Sub: "${sub.name}" (ID: ${subCatId})`);

        // Generate and insert 10 articles for this sub-category
        const articles = generateArticles(cat.name, sub.name, 10);
        for (let artIdx = 0; artIdx < articles.length; artIdx++) {
          const art = articles[artIdx];
          const slug = `${sub.slug}-${artIdx + 1}`.replace(/[^a-z0-9-]/g, '').replace(/--+/g, '-');

          await conn.query(
            `INSERT INTO articles (title, slug, excerpt, short_description, content, category_id, status, published_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [art.title, slug, art.excerpt, art.short_description, art.content, subCatId, art.status, art.published_at]
          );
          articleCount++;
        }
        console.log(`      📝 Added 10 articles`);
      }
    }

    console.log(`\n✅ Seed complete!`);
    console.log(`   Created ${categories.length} parent categories`);
    const subTotal = categories.reduce((sum, cat) => sum + cat.subs.length, 0);
    console.log(`   Created ${subTotal} sub-categories`);
    console.log(`   Created ${articleCount} articles`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await conn.release();
    await pool.end();
  }
}

seedData();
