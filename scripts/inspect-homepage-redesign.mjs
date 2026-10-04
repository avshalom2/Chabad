import { mkdir, writeFile } from 'node:fs/promises';
import { getPool } from '../src/lib/db.js';
import { getAllTemplates } from '../src/lib/hp-templates.js';
const pool = await getPool();
try {
  const templates = await getAllTemplates();
  await mkdir('tmp/homepage-redesign', { recursive: true });
  await writeFile('tmp/homepage-redesign/templates-before.json', JSON.stringify(templates, null, 2));
  for (const t of templates) {
    if (t.is_active) await writeFile('tmp/homepage-redesign/active.html', t.homepage_html || t.template_html);
  }
  console.log(JSON.stringify(templates.map(t => ({ id: t.id, name: t.template_name, active: t.is_active })), null, 2));
} finally { await pool.end(); }
