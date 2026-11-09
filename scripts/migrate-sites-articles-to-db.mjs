import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import postcss from 'postcss';
import { getPool } from '../src/lib/db.js';

const pages=JSON.parse(await readFile('src/components/sites-service-pages.json','utf8'));
const css=postcss.parse(await readFile('src/components/SitesServicePage.module.css','utf8'));
css.walkRules(rule=>{
 rule.selector=rule.selectors.map(selector=>{
  if(selector==='.page')return '#sites-service-article';
  assert.ok(selector.startsWith('.page :global(')&&selector.endsWith(')'),selector);
  return '#sites-service-article '+selector.slice(14,-1);
 }).join(',');
});
// Only adjust the legacy production shell around the imported article.
const compatibility=`
main:has(#sites-service-article){max-width:none!important;width:100%!important;margin:0!important;padding:0!important}
main:has(#sites-service-article)>div:has(>article){display:block!important}
main:has(#sites-service-article)>div>article:has(#sites-service-article){padding:0!important;margin:0!important;border:0!important;box-shadow:none!important;border-radius:0!important;background:transparent!important}
main:has(#sites-service-article)>div>article>div:has(#sites-service-article){margin:0!important;padding:0!important}
main:has(#sites-service-article)>div>article>:not(:has(#sites-service-article)){display:none!important}
main:has(#sites-service-article)>div>aside{display:none!important}
main:has(#sites-service-article)>div>article>div:has(#sites-service-article)>:not(#sites-service-article){display:none!important}
`;
const pool=await getPool();const client=await pool.connect();
try{
 await client.query('BEGIN');
 const originals=(await client.query('SELECT * FROM articles WHERE slug=ANY($1::text[]) ORDER BY id FOR UPDATE',[Object.keys(pages)])).rows;
 assert.equal(originals.length,5);
 assert.ok(originals.every(r=>!r.content?.includes('data-sites-article="v1"')),'Already migrated; refusing duplicate archives');
 const tables=(await client.query("SELECT table_name,column_name FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('articles','article_images','article_blocks') ORDER BY ordinal_position")).rows;
 const related={};
 for(const table of ['article_images','article_blocks']){
  if(tables.some(r=>r.table_name===table))related[table]=(await client.query(`SELECT * FROM ${table} WHERE article_id=ANY($1::int[]) ORDER BY id`,[originals.map(a=>a.id)])).rows;
 }
 if(!process.argv.includes('--apply')){
  console.log(JSON.stringify({preview:true,articles:originals.map(({id,slug,title})=>({id,slug,title})),related:Object.fromEntries(Object.entries(related).map(([k,v])=>[k,v.length]))}));
  await client.query('ROLLBACK');
 }else{
  const stamp=new Date().toISOString().replace(/[:.]/g,'-');
  await mkdir('tmp/content-backups',{recursive:true});
  const backup=`tmp/content-backups/sites-db-migration-${stamp}.json`;
  await writeFile(backup,JSON.stringify({originals,related},null,2),{flag:'wx'});
  const quote=name=>'"'+name.replaceAll('"','""')+'"';
  async function clone(table,row,overrides){
   const keys=tables.filter(c=>c.table_name===table).map(c=>c.column_name).filter(k=>!['id','created_at','updated_at'].includes(k));
   return (await client.query(`INSERT INTO ${quote(table)} (${keys.map(quote).join(',')}) VALUES (${keys.map((_,i)=>'$'+(i+1)).join(',')}) RETURNING *`,keys.map(k=>Object.hasOwn(overrides,k)?overrides[k]:row[k]))).rows[0];
  }
  const report=[];
  for(const old of originals){
   const archived=await clone('articles',old,{slug:old.slug+'-archive-'+stamp,title:old.title+' — גרסה קודמת',status:'archived',is_main_article:false});
   for(const [table,rows]of Object.entries(related))for(const row of rows.filter(r=>r.article_id===old.id)){
    const copy=await clone(table,row,{article_id:archived.id});
    if(table==='article_images'&&String(row.id)===String(old.short_description_image))await client.query('UPDATE articles SET short_description_image=$1 WHERE id=$2',[String(copy.id),archived.id]);
   }
   let markup=pages[old.slug].replace(/^<main\b/,'<div').replace(/<\/main>$/,'</div>');
   markup=markup.replace(/<a href="\/category\/(?:services|lifecycle)">[^<]*<\/a>/g,'<a href="/#classic-services">שירותי בית חב״ד</a>');
   const content=`<div id="sites-service-article" data-sites-article="v1"><style>${css.toString()}\n${compatibility}</style>${markup}</div>`;
   const saved=(await client.query('UPDATE articles SET content=$1,is_free_html=TRUE,show_contact_form=FALSE,show_whatsapp_button=FALSE,updated_at=NOW() WHERE id=$2 RETURNING *',[content,old.id])).rows[0];
   assert.equal(saved.content,content);assert.equal(saved.slug,old.slug);assert.equal(saved.status,old.status);
   assert.equal(archived.content,old.content);assert.equal(archived.status,'archived');
   report.push({id:old.id,slug:old.slug,archiveId:archived.id,archiveSlug:archived.slug});
  }
  await client.query('COMMIT');
  await writeFile('tmp/content-backups/sites-db-migration-result.json',JSON.stringify({backup,report},null,2));
  console.log(JSON.stringify({committed:true,backup,report},null,2));
 }
}catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();await pool.end();}
