import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {getPool} from '../src/lib/db.js';

const pool=await getPool();const client=await pool.connect();
try{
 await client.query('BEGIN');
 const slugs=['tefillin-mezuzot-services','hachanah-lebar-mitzvah','family-purity','herzliya-pituach-mikvah-services','chuppah-services','business-services'];
 const rows=(await client.query('SELECT * FROM articles WHERE slug=ANY($1::text[]) ORDER BY id FOR UPDATE',[slugs])).rows;
 assert.equal(rows.length,6);
 const updates=rows.map(row=>{
  assert.ok(row.content.includes('data-sites-article="v1"'),row.slug);
  const content=row.content.replaceAll('&family=Frank+Ruhl+Libre:wght@400;500;600','').replaceAll('Frank Ruhl Libre,Georgia,serif','Assistant,Arial,sans-serif').replaceAll('Frank Ruhl Libre, Georgia, serif','Assistant, Arial, sans-serif').replace('</style>','#sites-service-article em { font-style: normal !important; }</style>');
  assert.ok(!content.includes('Frank Ruhl Libre'),row.slug);
  return {row,content};
 });
 if(process.argv.includes('--apply')){
  await mkdir('tmp/content-backups',{recursive:true});
  const backup=`tmp/content-backups/before-assistant-fonts-${Date.now()}.json`;
  await writeFile(backup,JSON.stringify(rows,null,2),{flag:'wx'});
  for(const {row,content} of updates){
   const saved=(await client.query('UPDATE articles SET content=$1,updated_at=NOW() WHERE id=$2 RETURNING content',[content,row.id])).rows[0];
   assert.equal(saved.content,content);
  }
  await client.query('COMMIT');console.log(JSON.stringify({updated:rows.map(r=>({id:r.id,slug:r.slug})),backup}));
 }else{await client.query('ROLLBACK');console.log(JSON.stringify({preview:true,articles:rows.map(r=>r.slug)}));}
}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();await pool.end();}
