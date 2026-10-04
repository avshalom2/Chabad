import { readFile } from 'node:fs/promises';
import { getPool } from '../src/lib/db.js';
import { createTemplate, getActiveTemplate, getAllTemplates, getTemplateById } from '../src/lib/hp-templates.js';

const name = 'דף בית חדש — טיוטה';
const pool = await getPool();

try {
  const activeBefore = await getActiveTemplate();
  const templates = await getAllTemplates();
  const existing = templates.find((template) => template.template_name === name);
  const html = await readFile(new URL('../public/homepage-draft.html', import.meta.url), 'utf8');
  const id = existing?.id ?? await createTemplate({
    template_name: name,
    template_html: html,
    created_by: null,
  });
  const saved = await getTemplateById(id);
  const activeAfter = await getActiveTemplate();
  if (!saved || (!existing && saved.template_html !== html)) {
    throw new Error('Draft template verification failed');
  }
  if (activeBefore?.id !== activeAfter?.id) {
    throw new Error('Active homepage changed unexpectedly');
  }
  console.log(JSON.stringify({ id, name: saved.template_name, created: !existing, active: saved.is_active, activeHomepageUnchanged: true }));
} finally {
  await pool.end();
}
