import { getPool } from './db.js';

/**
 * Get a single setting by key
 * @param {string} key - The setting key
 * @returns {Promise<any>} - The parsed value or null if not found
 */
export async function getSetting(key) {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT `value` FROM site_settings WHERE `key` = ?', [key]);
    if (rows.length === 0) return null;
    try {
      return JSON.parse(rows[0].value);
    } catch {
      return rows[0].value;
    }
  } catch (err) {
    console.error(`Error fetching setting "${key}":`, err);
    throw err;
  }
}

/**
 * Get multiple settings
 * @param {string[]} keys - Array of setting keys
 * @returns {Promise<Object>} - Object with keys mapped to values
 */
export async function getSettings(keys) {
  try {
    const pool = await getPool();
    let rows;
    if (process.env.DB_TYPE === 'postgres' || process.env.DB_TYPE === 'pg') {
      // PostgreSQL: use $1, $2, ... and double quotes
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(',');
      const query = `SELECT "key", "value" FROM site_settings WHERE "key" IN (${placeholders})`;
      const result = await pool.query(query, keys);
      rows = result.rows;
    } else {
      // MySQL: use ? and backticks
      const query = `SELECT \`key\`, \`value\` FROM site_settings WHERE \`key\` IN (${keys.map(() => '?').join(',')})`;
      const [mysqlRows] = await pool.query(query, keys);
      rows = mysqlRows;
    }
    const result = {};
    rows.forEach(row => {
      try {
        result[row.key] = JSON.parse(row.value);
      } catch {
        result[row.key] = row.value;
      }
    });
    return result;
  } catch (err) {
    console.error('Error fetching settings:', err);
    throw err;
  }
}

/**
 * Get all settings
 * @returns {Promise<Object>} - Object with all settings
 */
export async function getAllSettings() {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT `key`, `value` FROM site_settings');
    const result = {};
    rows.forEach(row => {
      try {
        result[row.key] = JSON.parse(row.value);
      } catch {
        result[row.key] = row.value;
      }
    });
    return result;
  } catch (err) {
    console.error('Error fetching all settings:', err);
    throw err;
  }
}

/**
 * Set a setting value
 * @param {string} key - The setting key
 * @param {any} value - The value (will be JSON stringified if it's an object)
 * @returns {Promise<void>}
 */
export async function setSetting(key, value) {
  try {
    const pool = await getPool();
    const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
    await pool.query(
      'INSERT INTO site_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?, updated_at = CURRENT_TIMESTAMP',
      [key, jsonValue, jsonValue]
    );
  } catch (err) {
    console.error(`Error setting "${key}":`, err);
    throw err;
  }
}

/**
 * Delete a setting
 * @param {string} key - The setting key
 * @returns {Promise<void>}
 */
export async function deleteSetting(key) {
  try {
    const pool = await getPool();
    await pool.query('DELETE FROM site_settings WHERE `key` = ?', [key]);
  } catch (err) {
    console.error(`Error deleting setting "${key}":`, err);
    throw err;
  }
}
