import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getPool } from '../src/lib/db.js';

const url = '/uploads/holidays/sukkot-step-by-step.pdf';
const pdf = await readFile(join(process.cwd(),'public',url));
assert.equal(pdf.subarray(0,5).toString(),'%PDF-');
// The download is the user-supplied succot_guide_unified.pdf, not the generated six-page draft.
const link = `<p><a href="${url}" download><strong>להורדת PDF להדפסה: סוכות צעד אחר צעד — הכנות, סדר החג והברכות</strong></a></p>`;
const pool = await getPool();
const client = await pool.connect();
try {
  await client.query('BEGIN');
  const {rows:before} = await client.query(`SELECT a.* FROM articles a JOIN categories c ON c.id=a.category_id
    WHERE c.slug='sukkot' ORDER BY a.sort_order,a.id FOR UPDATE OF a`);
  assert.equal(before.length,5);
  const directory=join(tmpdir(),'chabad-content-backups');
  await mkdir(directory,{recursive:true});
  const backup=join(directory,`sukkot-pdf-link-${Date.now()}.json`);
  await writeFile(backup,JSON.stringify(before,null,2),{flag:'wx'});
  for(const article of before){
    if(article.content.includes(url)) continue;
    const {rows:[saved]}=await client.query('UPDATE articles SET content=$1,updated_at=NOW() WHERE id=$2 RETURNING *',[link+article.content,article.id]);
    assert.equal(saved.content,link+article.content);
    assert.equal(saved.short_description_image,article.short_description_image);
  }
  const {rows:saved}=await client.query('SELECT content FROM articles WHERE id=ANY($1::int[])',[before.map(a=>a.id)]);
  assert.ok(saved.every(a=>a.content.includes(`href="${url}" download`)));
  await client.query('COMMIT');
  console.log(JSON.stringify({linkedArticles:before.map(a=>a.id),pdf:url,bytes:pdf.length,backup,verified:true},null,2));
}catch(error){await client.query('ROLLBACK');throw error;}
finally{client.release();await pool.end();}
