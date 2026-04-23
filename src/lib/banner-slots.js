/**
 * Get a banner slot and its banners
 */
export async function getBannerSlotWithBanners(identifier, activeOnly = false) {
  const slot = await getBannerSlot(identifier);
  if (!slot) return null;
  const banners = await getBannersBySlot(slot.id, activeOnly);
  return { ...slot, banners };
}
import { getPool } from './db.js';

/**
 * Get all banner slots with optional active filter
 */
export async function getBannerSlots(activeOnly = false) {
  try {
    const pool = await getPool();
    let query = 'SELECT * FROM banner_slots';
    let params = [];
    
    if (activeOnly) {
      query += ' WHERE is_active = TRUE'; // ב-Postgres עדיף TRUE
    }
    
    query += ' ORDER BY sort_order ASC, created_at DESC';
    const result = await pool.query(query);
    return result.rows; // ב-Postgres התוצאה בתוך rows
  } catch (error) {
    console.error('Error fetching banner slots:', error);
    throw error;
  }
}

/**
 * Get a single banner slot by ID or slug
 */
export async function getBannerSlot(identifier) {
  try {
    const pool = await getPool();
    // שינוי ל-$1 ו-$2
    const query = 'SELECT * FROM banner_slots WHERE id = $1 OR slug = $2';
    const result = await pool.query(query, [identifier, identifier]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching banner slot:', error);
    throw error;
  }
}

/**
 * Create a new banner slot
 */
export async function createBannerSlot(data, userId) {
  try {
    const pool = await getPool();
    const {
      name, slug, description, location, max_width, max_height,
      aspect_ratio, rotation_delay, design_type, is_active, sort_order,
    } = data;

    // ב-Postgres משתמשים ב-RETURNING id כדי לקבל את ה-ID שנוצר
    const query = `
      INSERT INTO banner_slots (
        name, slug, description, location, max_width, max_height,
        aspect_ratio, rotation_delay, design_type, is_active, sort_order, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `;

    const result = await pool.query(query, [
      name, slug, description, location,
      max_width || 1200, max_height || 300,
      aspect_ratio || '16:9', rotation_delay || 5000,
      design_type || 'auto-slide', is_active !== false,
      sort_order || 0, userId,
    ]);

    return { id: result.rows[0].id, ...data, created_by: userId };
  } catch (error) {
    console.error('Error creating banner slot:', error);
    throw error;
  }
}

/**
 * Update a banner slot
 */
export async function updateBannerSlot(id, data) {
  try {
    const pool = await getPool();
    const {
      name, description, location, max_width, max_height,
      aspect_ratio, rotation_delay, design_type, is_active, sort_order,
    } = data;

    const query = `
      UPDATE banner_slots SET
        name = $1, description = $2, location = $3, max_width = $4,
        max_height = $5, aspect_ratio = $6, rotation_delay = $7,
        design_type = $8, is_active = $9, sort_order = $10
      WHERE id = $11
    `;

    await pool.query(query, [
      name, description, location, max_width, max_height,
      aspect_ratio, rotation_delay, design_type || 'auto-slide',
      is_active !== undefined ? is_active : true, sort_order, id,
    ]);

    return { id, ...data };
  } catch (error) {
    console.error('Error updating banner slot:', error);
    throw error;
  }
}

/**
 * Delete a banner slot
 */
export async function deleteBannerSlot(id) {
  try {
    const pool = await getPool();
    await pool.query('DELETE FROM banner_slots WHERE id = $1', [id]);
    return { success: true };
  } catch (error) {
    console.error('Error deleting banner slot:', error);
    throw error;
  }
}

/**
 * Get all banners for a specific slot
 */
export async function getBannersBySlot(slotId, activeOnly = false) {
  try {
    const pool = await getPool();
    let query = 'SELECT * FROM banners WHERE banner_slot_id = $1';
    if (activeOnly) {
      query += ' AND is_active = TRUE';
    }
    query += ' ORDER BY sort_order ASC, created_at DESC';
    const result = await pool.query(query, [slotId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching banners:', error);
    throw error;
  }
}

/**
 * Get a single banner
 */
export async function getBanner(id) {
  try {
    const pool = await getPool();
    const result = await pool.query('SELECT * FROM banners WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching banner:', error);
    throw error;
  }
}

/**
 * Create a new banner
 */
export async function createBanner(data, userId) {
  try {
    const pool = await getPool();
    const {
      banner_slot_id, title, image_url, link_url, alt_text,
      description, is_active, sort_order,
    } = data;

    const query = `
      INSERT INTO banners (
        banner_slot_id, title, image_url, link_url, alt_text,
        description, is_active, sort_order, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;

    const result = await pool.query(query, [
      banner_slot_id, title || null, image_url, link_url || null,
      alt_text || null, description || null, is_active !== false,
      sort_order || 0, userId,
    ]);
    return { id: result.rows[0].id, ...data, created_by: userId };
  } catch (error) {
    console.error('Error creating banner:', error);
    throw error;
  }
}

/**
 * Record a banner click
 */
export async function recordBannerClick(bannerId) {
  try {
    const pool = await getPool();
    await pool.query(
      'UPDATE banners SET click_count = click_count + 1 WHERE id = $1',
      [bannerId]
    );
    return { success: true };
  } catch (error) {
    console.error('Error recording banner click:', error);
    throw error;
  }
}

/**
 * Reorder banners within a slot
 */
export async function reorderBanners(bannerIds) {
  try {
    const pool = await getPool();
    // ב-Postgres, כדאי להשתמש בשיטה בטוחה יותר לעדכון מרובה
    for (let i = 0; i < bannerIds.length; i++) {
      await pool.query('UPDATE banners SET sort_order = $1 WHERE id = $2', [i, bannerIds[i]]);
    }
    return { success: true };
  } catch (error) {
    console.error('Error reordering banners:', error);
    throw error;
  }
}