import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { getPool } from '../src/lib/db.js';
import { getAllTemplates, updateTemplateHtml, getTemplateById } from '../src/lib/hp-templates.js';
import { parseSmartGridTemplate, serializeSmartGridTemplate } from '../src/lib/smart-grid-template.js';

const pool = await getPool();
try {
  const before = await getAllTemplates();
  const active = before.find(t => t.is_active);
  const draft = before.find(t => t.template_name === 'דף בית חדש — טיוטה');
  assert.ok(active && draft, 'Active homepage and draft must exist');
  assert.notEqual(active.id, draft.id, 'Draft must not be the active homepage');
  const source = parseSmartGridTemplate(active.homepage_html || active.template_html);
  assert.ok(source, 'Expected a Smart Grid source template');
  const config = { ...source, design: 'classic', sourceTemplateId: active.id };
  const html = serializeSmartGridTemplate(config);
  await mkdir('tmp/homepage-redesign', { recursive: true });
  await writeFile(`tmp/homepage-redesign/before-apply-${Date.now()}.json`, JSON.stringify(before, null, 2));
  assert.ok(await updateTemplateHtml(draft.id, html));
  const saved = await getTemplateById(draft.id);
  assert.equal(saved.homepage_html, html);
  const after = await getAllTemplates();
  assert.deepEqual(after.filter(t => t.id !== draft.id), before.filter(t => t.id !== draft.id), 'Other templates must stay unchanged');
  assert.deepEqual(parseSmartGridTemplate(saved.homepage_html).controls, source.controls, 'Preserve source content settings');
  console.log(JSON.stringify({ draftId: draft.id, sourceId: active.id, activeUnchanged: true, controlsPreserved: true, preview: '/homepage-preview' }));
} finally { await pool.end(); }
