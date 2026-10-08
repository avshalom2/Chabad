import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { getPool } from '../src/lib/db.js';

const pool = await getPool();
const client = await pool.connect();
try {
  await client.query('BEGIN');
  const { rows: [article] } = await client.query("SELECT * FROM articles WHERE slug='business-services' AND category_id=8 FOR UPDATE");
  assert.ok(article);
  if (!process.argv.includes('--apply')) {
    console.log(JSON.stringify({ id: article.id, title: article.title, short_description: article.short_description, excerpt: article.excerpt, content: article.content, page_html: article.page_html }, null, 2));
    await client.query('ROLLBACK');
  } else {
    const title = 'שירותים לבית ולעסק';
    const description = 'הכשרת מטבח, חנוכת הבית, התקנת מזוזות, עמדות תפילין ושיעורי תורה — לבית ולעסק.';
    let content = article.content
      .replace('<p>שירותים לעסקים</p>', `<p>${title}</p>`)
      .replace('פתרונות יהודיים נגישים ומותאמים למקומות עבודה, משרדים ועסקים', 'פתרונות יהודיים נגישים ומותאמים לבתים, משפחות, משרדים ועסקים')
      .replace('אנו מציעים מגוון שירותים לעסקים, חברות ומשרדים המעוניינים', 'אנו מציעים מגוון שירותים לבתים, משפחות, חברות ומשרדים המעוניינים')
      .replace('השירות מתאים לחברות, משרדים, חנויות, מתחמי עבודה ועסקים חדשים.', 'השירות מתאים למשפחות, לבתים חדשים וקיימים, לחברות, למשרדים, לחנויות ולמתחמי עבודה.')
      .replace('רוצים לתאם שירות לעסק?', 'רוצים לתאם שירות לבית או לעסק?')
      .replace('לתיאום השירות המתאים עבור העסק שלכם.', 'לתיאום השירות המתאים עבור הבית או העסק שלכם.');
    const heading = '<h2>למי השירות מתאים?</h2>';
    assert.ok(content.includes(heading));
    if (!content.includes('<strong>הכשרת מטבח')) {
      const cards = '<div class="article-content-box"><p><strong>הכשרת מטבח </strong>ייעוץ וליווי בהכשרת המטבח בבית או בעסק, בהתאם לסוג הכלים והמשטחים ולפי ההלכה.</p></div>'
        + '<div class="article-content-box"><p><strong>חנוכת הבית </strong>תיאום חנוכת הבית באווירה יהודית חמה, עם דברי תורה, ברכות וליווי לקביעת מזוזות.</p></div>';
      content = content.replace(heading, cards + heading);
    }
    assert.equal((content.match(/class="article-content-box"/g) || []).length, 8);
    assert.ok(content.includes('<strong>חנוכת הבית'));
    await mkdir('tmp/content-backups', { recursive: true });
    const backup = `tmp/content-backups/home-business-service-${Date.now()}.json`;
    await writeFile(backup, JSON.stringify(article, null, 2), { flag: 'wx' });
    const { rows: [saved] } = await client.query('UPDATE articles SET title=$1,short_description=$2,excerpt=$2,content=$3,updated_at=NOW() WHERE id=$4 RETURNING *', [title, description, content, article.id]);
    assert.equal(saved.title, title);
    assert.equal(saved.short_description, description);
    assert.equal(saved.content, content);
    assert.equal(saved.slug, article.slug);
    assert.equal(saved.status, article.status);
    await client.query('COMMIT');
    console.log(JSON.stringify({ id: saved.id, title: saved.title, description: saved.short_description, cards: 8, backup, verified: true }));
  }
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
  await pool.end();
}
