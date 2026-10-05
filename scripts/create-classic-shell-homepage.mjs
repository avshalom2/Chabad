import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { getPool } from '../src/lib/db.js';
import { getAllTemplates, createTemplate, getTemplateById, updateTemplateMobileControlOrder } from '../src/lib/hp-templates.js';
import { parseSmartGridTemplate, serializeSmartGridTemplate } from '../src/lib/smart-grid-template.js';

const name = 'מעטפת קלאסית — גוף דף הבית הקיים';
const pool = await getPool();
try {
  const before = await getAllTemplates();
  const existing = before.find(t => t.template_name === name);
  if (existing) {
    console.log(JSON.stringify({ id: existing.id, name, created: false }));
  } else {
    const active = before.find(t => t.is_active);
    assert.ok(active, 'No active homepage');
    const source = parseSmartGridTemplate(active.homepage_html || active.template_html);
    assert.ok(source && source.design !== 'classic', 'Expected the current original Smart Grid homepage');
    await mkdir('tmp/homepage-redesign', { recursive: true });
    await writeFile(`tmp/homepage-redesign/before-shell-${Date.now()}.json`, JSON.stringify(before, null, 2));
    const config = { ...source, design: 'classic-shell', sourceTemplateId: active.id };
    const html = serializeSmartGridTemplate(config);
    const templateData = { template_name: name, template_html: html, created_by: null };
    let id;
    try {
      id = await createTemplate(templateData);
    } catch (error) {
      if (error.code !== '23505' || error.constraint !== 'hp_templates_pkey') throw error;
      // Imported template IDs can leave the PostgreSQL sequence behind the data.
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query('LOCK TABLE hp_templates IN ACCESS EXCLUSIVE MODE');
        await client.query(`SELECT setval(pg_get_serial_sequence('hp_templates', 'id'), GREATEST((SELECT MAX(id) FROM hp_templates), pg_sequence_last_value(pg_get_serial_sequence('hp_templates', 'id')::regclass)), true)`);
        await client.query('COMMIT');
      } catch (repairError) {
        await client.query('ROLLBACK');
        throw repairError;
      } finally { client.release(); }
      id = await createTemplate(templateData);
    }
    if (Array.isArray(active.mobile_control_order)) await updateTemplateMobileControlOrder(id, active.mobile_control_order);
    const saved = await getTemplateById(id);
    assert.equal(saved.template_html, html);
    assert.ok(!saved.is_active);
    assert.deepEqual((await getAllTemplates()).filter(t => t.id !== id), before, 'Existing templates must remain unchanged');
    console.log(JSON.stringify({ id, name, created: true, sourceId: active.id, sourceName: active.template_name, activeUnchanged: true, preview: '/homepage-preview?template=classic-shell' }));
  }
} finally { await pool.end(); }
