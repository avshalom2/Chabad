#!/usr/bin/env node
/**
 * Assigns placeholder product image as short_description_image
 * to all articles under subcategories of חנות חב"ד
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

const PLACEHOLDER_URL = '/uploads/placeholder-product.svg';

async function assignPlaceholderImages() {
  const conn = await pool.getConnection();

  try {
    console.log('🔍 Finding חנות חב"ד and its subcategories...');

    // Find the חנות חב"ד parent category
    const [parentRows] = await conn.query(
      `SELECT id, name FROM categories WHERE name LIKE '%חנות%'`
    );

    if (parentRows.length === 0) {
      console.error('❌ Could not find חנות חב"ד category');
      process.exit(1);
    }

    const parent = parentRows[0];
    console.log(`✓ Found parent: ${parent.name} (id: ${parent.id})`);

    // Find all subcategories under it
    const [subCats] = await conn.query(
      `SELECT id, name FROM categories WHERE parent_id = ?`,
      [parent.id]
    );

    if (subCats.length === 0) {
      console.error('❌ No subcategories found under חנות חב"ד');
      process.exit(1);
    }

    console.log(`✓ Found ${subCats.length} subcategories: ${subCats.map(c => c.name).join(', ')}`);

    const subCatIds = subCats.map(c => c.id);

    // Find all articles under those subcategories
    const [articles] = await conn.query(
      `SELECT id, title FROM articles WHERE category_id IN (?)`,
      [subCatIds]
    );

    console.log(`✓ Found ${articles.length} articles to update`);

    if (articles.length === 0) {
      console.log('No articles to update.');
      process.exit(0);
    }

    let updated = 0;

    for (const article of articles) {
      // Check if article already has a placeholder image
      const [existing] = await conn.query(
        `SELECT id FROM article_images WHERE article_id = ? AND image_url = ?`,
        [article.id, PLACEHOLDER_URL]
      );

      let imageId;

      if (existing.length > 0) {
        // Already has placeholder
        imageId = existing[0].id;
      } else {
        // Insert placeholder into article_images
        const [insertResult] = await conn.query(
          `INSERT INTO article_images (article_id, image_url, alt_text, display_order)
           VALUES (?, ?, ?, ?)`,
          [article.id, PLACEHOLDER_URL, 'תמונת מוצר', 0]
        );
        imageId = insertResult.insertId;
      }

      // Set as short_description_image on the article
      await conn.query(
        `UPDATE articles SET short_description_image = ? WHERE id = ?`,
        [imageId, article.id]
      );

      updated++;
    }

    console.log(`\n✅ Done! Assigned placeholder image to ${updated} articles.`);
    console.log(`   Placeholder: ${PLACEHOLDER_URL}`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

assignPlaceholderImages();
