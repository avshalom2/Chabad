import { getPool } from "./db.js";

/**
 * Get all forms
 */
export async function getForms() {
  const pool = await getPool();
  const [rows] = await pool.query("SELECT * FROM forms ORDER BY created_at DESC");
  return rows;
}

/**
 * Get form by ID with all fields
 */
export async function getFormById(id) {
  const pool = await getPool();
  const [form] = await pool.query("SELECT * FROM forms WHERE id = ?", [id]);
  if (!form || form.length === 0) return null;

  const [fields] = await pool.query(
    "SELECT * FROM form_fields WHERE form_id = ? ORDER BY field_order ASC",
    [id]
  );

  return {
    ...form[0],
    fields: fields.map((f) => ({
      ...f,
      options: f.options ? JSON.parse(f.options) : [],
    })),
  };
}

/**
 * Get form by slug
 */
export async function getFormBySlug(slug) {
  const pool = await getPool();
  const [form] = await pool.query("SELECT * FROM forms WHERE slug = ?", [slug]);
  if (!form || form.length === 0) return null;

  const [fields] = await pool.query(
    "SELECT * FROM form_fields WHERE form_id = ? ORDER BY field_order ASC",
    [form[0].id]
  );

  return {
    ...form[0],
    fields: fields.map((f) => ({
      ...f,
      options: f.options ? JSON.parse(f.options) : [],
    })),
  };
}

/**
 * Create new form
 */
export async function createForm(data) {
  const pool = await getPool();
  const { name, slug, description, createdBy } = data;

  const [result] = await pool.query(
    "INSERT INTO forms (name, slug, description, created_by) VALUES (?, ?, ?, ?)",
    [name, slug, description, createdBy]
  );

  return getFormById(result.insertId);
}

/**
 * Update form details
 */
export async function updateForm(id, data) {
  const { name, description } = data;

  await pool.query("UPDATE forms SET name = ?, description = ? WHERE id = ?", [
    name,
    description,
    id,
  ]);

  return getFormById(id);
}

/**
 * Delete form (cascades to fields and submissions)
 */
export async function deleteForm(id) {
  await pool.query("DELETE FROM forms WHERE id = ?", [id]);
  return true;
}

/**
 * Add field to form
 */
export async function addFormField(formId, fieldData) {
  const {
    fieldName,
    fieldType,
    fieldLabel,
    placeholder,
    isRequired,
    fieldOrder,
    options,
  } = fieldData;

  const [result] = await pool.query(
    `INSERT INTO form_fields 
     (form_id, field_name, field_type, field_label, placeholder, is_required, field_order, options)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      formId,
      fieldName,
      fieldType,
      fieldLabel,
      placeholder,
      isRequired,
      fieldOrder,
      options ? JSON.stringify(options) : null,
    ]
  );

  return result.insertId;
}

/**
 * Update form field
 */
export async function updateFormField(fieldId, fieldData) {
  const {
    fieldLabel,
    placeholder,
    isRequired,
    fieldOrder,
    options,
  } = fieldData;

  await pool.query(
    `UPDATE form_fields 
     SET field_label = ?, placeholder = ?, is_required = ?, field_order = ?, options = ?
     WHERE id = ?`,
    [fieldLabel, placeholder, isRequired, fieldOrder, options ? JSON.stringify(options) : null, fieldId]
  );

  return true;
}

/**
 * Delete form field
 */
export async function deleteFormField(fieldId) {
  await pool.query("DELETE FROM form_fields WHERE id = ?", [fieldId]);
  return true;
}

/**
 * Save form submission
 */
export async function saveFormSubmission(formId, data) {
  const [result] = await pool.query(
    "INSERT INTO form_submissions (form_id, data) VALUES (?, ?)",
    [formId, JSON.stringify(data)]
  );

  return result.insertId;
}

/**
 * Get form submissions
 */
export async function getFormSubmissions(formId) {
  const [rows] = await pool.query(
    "SELECT * FROM form_submissions WHERE form_id = ? ORDER BY submitted_at DESC",
    [formId]
  );

  return rows.map((row) => ({
    ...row,
    data: JSON.parse(row.data),
  }));
}

/**
 * Check if slug already exists
 */
export async function slugExists(slug, excludeId = null) {
  let query = "SELECT COUNT(*) as count FROM forms WHERE slug = ?";
  const params = [slug];

  if (excludeId) {
    query += " AND id != ?";
    params.push(excludeId);
  }

  const [result] = await pool.query(query, params);
  return result[0].count > 0;
}
