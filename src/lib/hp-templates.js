import { getPool } from './db.js';

// Helper to rewrite ? placeholders to $1, $2, ... for PostgreSQL
function adaptPlaceholders(query, params) {
  if (process.env.DB_TYPE === 'postgres' || process.env.DB_TYPE === 'pg') {
    let idx = 0;
    return [
      query.replace(/\?/g, () => `$${++idx}`),
      params
    ];
  }
  return [query, params];
}

/**
 * Get all homepage templates
 */
export async function getAllTemplates() {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, template_name, template_html, homepage_html, is_active, created_at, updated_at FROM hp_templates ORDER BY created_at DESC'
  );
  return rows;
}

/**
 * Get a single template by ID
 */
export async function getTemplateById(id) {
  const pool = await getPool();
  const [query, params] = adaptPlaceholders('SELECT * FROM hp_templates WHERE id = ?', [id]);
  const [rows] = await pool.query(query, params);
  return rows[0] || null;
}

/**
 * Get the active template (basic version)
 */
export async function getActiveTemplate() {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT * FROM hp_templates WHERE is_active = TRUE LIMIT 1'
  );
  return rows[0] || null;
}

/**
 * Get the active template for displaying on homepage
 * Returns both the template metadata and the edited HTML for display
 */
export async function getActiveTemplateForDisplay() {
  try {
    const pool = await getPool();
    if (!pool) {
      console.error('Database pool is not initialized');
      return null;
    }
    const result = await pool.query(
      `SELECT id, template_name, template_html, homepage_html, is_active, created_at, updated_at 
       FROM hp_templates 
       WHERE is_active = TRUE 
       LIMIT 1`
    );
    if (!result || !result.rows) {
      console.error('Unexpected pool.query result structure:', typeof result);
      return null;
    }
    if (!result.rows || result.rows.length === 0) {
      return null;
    }
    const template = result.rows[0];
    return {
      id: template.id,
      name: template.template_name,
      html: template.homepage_html || template.template_html,
      createdAt: template.created_at,
      updatedAt: template.updated_at
    };
  } catch (error) {
    console.error('Error in getActiveTemplateForDisplay:', error?.message || error);
    return null;
  }
}

/**
 * Create a new template
 */
export async function createTemplate(templateData) {
  const pool = await getPool();
  const { template_name, template_html, created_by } = templateData;
  const [query, params] = adaptPlaceholders(
    `INSERT INTO hp_templates (template_name, template_html, created_by)
     VALUES (?, ?, ?)`,
    [template_name, template_html, created_by]
  );
  const [result] = await pool.query(query, params);
  console.log('Template created with ID:', result.insertId);
  return result.insertId;
}

/**
 * Update template HTML (the edited version)
 */
export async function updateTemplateHtml(id, homepageHtml) {
  const pool = await getPool();
  console.log('updateTemplateHtml called with ID:', id, 'HTML length:', homepageHtml?.length);
  const [query, params] = adaptPlaceholders(
    `UPDATE hp_templates SET homepage_html = ?, updated_at = NOW() WHERE id = ?`,
    [homepageHtml, id]
  );
  const [result] = await pool.query(query, params);
  console.log('Update result - affectedRows:', result.affectedRows);
  return result.affectedRows > 0;
}

/**
 * Update template (original HTML)
 */
export async function updateTemplate(id, templateData) {
  const pool = await getPool();
  const { template_name, template_html } = templateData;
  const [query, params] = adaptPlaceholders(
    `UPDATE hp_templates SET template_name = ?, template_html = ?, updated_at = NOW() WHERE id = ?`,
    [template_name, template_html, id]
  );
  const [result] = await pool.query(query, params);
  return result.affectedRows > 0;
}

/**
 * Set a template as active (deactivate others)
 */
export async function setActiveTemplate(id) {
  const pool = await getPool();
  await pool.query('UPDATE hp_templates SET is_active = FALSE');
  const [query, params] = adaptPlaceholders(
    'UPDATE hp_templates SET is_active = TRUE WHERE id = ?',
    [id]
  );
  const [result] = await pool.query(query, params);
  return result.affectedRows > 0;
}

/**
 * Delete a template
 */
export async function deleteTemplate(id) {
  const pool = await getPool();
  const [query, params] = adaptPlaceholders('DELETE FROM hp_templates WHERE id = ?', [id]);
  const [result] = await pool.query(query, params);
  return result.affectedRows > 0;
}
