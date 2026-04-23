#!/usr/bin/env node
/**
 * Seed script for shop items
 * Adds 30 items to each of these categories:
 * - ספרים (Books)
 * - יודייקה (Judaica)
 * - תפילים ומזוזות (Tefillin & Mezuzot)
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

// Hebrew product names and descriptions
const bookTitles = [
  'תניא - ספר הבסיסי של החסידות חב"ד',
  'סידור עם הערות',
  'משנה יומית - קורא ודורשה',
  'אמונה ובטחון - ספר קדשיות',
  'קוביץ שיחות חסידיות',
  'המרובה לא מצא תועלת - הגדות',
  'חיי המלך - עדויות וזכרונות',
  'ספר הזוהר - קדמונים המה',
  'מצוות וחוקים יהודיים',
  'אבות הטהורה - היסודות הראשונים',
  'אוצר חסידות - אמרות וסדורים',
  'דברים גנוזים מרבותינו',
  'תעודות וזיכרונות קדומים',
  'מורה נבוכים לדור זה',
  'פרקי אבות עם פירושים',
];

const judaicaTitles = [
  'מצוות עץ מתכת',
  'קנקן קדש מעוטר',
  'דגל השבט - סמל המשפחה',
  'פמוטות יפות מעוטרות',
  'צלחת לוליביט מפוזל',
  'קדוש כסף מעוטר',
  'פמוט חנוכה עם כיתוב',
  'כלים קדושים לשולחן',
  'תמונה של צדיקים',
  'נר נצחי לזכרון',
  'טבעת כסף עם כיתוב',
  'קישוטי שולחן שבת',
  'מטבע זיכרון לברכה',
  'מפית חג עם זהב',
  'קישוט קיר זכרוני',
];

const tefillinTitles = [
  'תפילין כשר מעוטר',
  'תפילים מכתב גדול',
  'תפילים מכתב קטן',
  'מזוזה כשרה בקליפ',
  'מזוזה בעטיפה פוליקלר',
  'בגדי תפילה לבנים',
  'טלית כשרה עם זקנים',
  'כיסוי ראש לתפילה',
  'מזוזה דקורטיבית לדלת',
  'אחסון תפילים מגן',
  'תיק לתפילים ומזוזה',
  'מעמד לתפילים מעוצב',
  'מזוזה משובצת זהב',
  'תפילים כלי זהב חלק',
  'סט תפילים למתחילים',
];

const descriptions = [
  'מוצר איכותי ופרטי מומלץ',
  'תוצר ידי אומנים חכמים',
  'כשר לפי כל ההלכות הקפדניות',
  'גימור מעולה ויפה מראה',
  'כולל הנחיות שימוש מתורגמות',
  'הגיע עם אריזה מיוחדת',
  'מתאים כמתנה ערוכה ויקרה',
  'משך חיים ארוך וטיבי',
  'משמור למשך שנים רבות',
  'מומלץ על ידי רבנים וגדולים',
];

const prices = [25, 35, 45, 55, 65, 75, 85, 95, 120, 150, 175, 200, 250, 300, 350];

function generateSlug(title, categoryId, index) {
  // Create unique slug: category-id-item-number
  return `item-${categoryId}-${index}`;
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedShopItems() {
  const conn = await pool.getConnection();

  try {
    console.log('🔍 Looking up shop categories...');

    // Find the three shop categories
    const [categories] = await conn.query(
      `SELECT id, name FROM categories WHERE slug IN ('books', 'יודייקה', 'tefillin-mezuzot') OR name IN ('ספרים', 'יודייקה', 'תפילים ומזוזות')`
    );

    if (categories.length === 0) {
      console.error('❌ Shop categories not found. Please ensure these categories exist:');
      console.error('  - ספרים (books)');
      console.error('  - יודייקה (judaica)');
      console.error('  - תפילים ומזוזות (tefillin-mezuzot)');
      process.exit(1);
    }

    console.log(`✓ Found ${categories.length} shop categories`);

    let totalInserted = 0;

    for (const category of categories) {
      let titles;
      if (category.name === 'ספרים' || category.name === 'Books') {
        titles = bookTitles;
      } else if (category.name === 'יודייקה') {
        titles = judaicaTitles;
      } else if (category.name.includes('תפילים') || category.name.includes('מזוזות')) {
        titles = tefillinTitles;
      } else {
        titles = bookTitles; // fallback
      }
      const items = [];

      // Generate 30 items for this category
      for (let i = 1; i <= 30; i++) {
        const baseTitle = titles[(i - 1) % titles.length];
        const title = i > titles.length ? `${baseTitle} - גרסה ${i}` : baseTitle;
        const slug_item = generateSlug(title, category.id, i);
        const shortDesc = getRandomItem(descriptions);
        const price = getRandomItem(prices);

        items.push([
          title,
          slug_item,
          shortDesc,
          `<p>${shortDesc}</p>`,
          category.id,
          price,
          1, // is_purchasable = true
          30, // stock
          'published',
          new Date(),
        ]);
      }

      // Insert all items for this category
      const [result] = await conn.query(
        `INSERT INTO articles 
         (title, slug, short_description, content, category_id, price, is_purchasable, stock, status, published_at)
         VALUES ?`,
        [items]
      );

      const inserted = result.affectedRows;
      totalInserted += inserted;
      console.log(`✓ Added ${inserted} items to ${category.name}`);
    }

    console.log(`\n✅ Successfully added ${totalInserted} shop items!`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding shop items:', error);
    process.exit(1);
  } finally {
    await conn.end();
    await pool.end();
  }
}

seedShopItems();
