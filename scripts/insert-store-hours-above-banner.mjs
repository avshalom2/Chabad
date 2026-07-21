import { getPool } from '../src/lib/db.js';

const pool = await getPool();

try {
  const result = await pool.query(
    'select id, template_name, homepage_html, template_html from hp_templates where is_active=true limit 1'
  );
  const template = (result.rows || result[0])[0];

  if (!template) throw new Error('No active homepage template was found');

  const html = template.homepage_html || template.template_html || '';
  if (/<storehours\b/i.test(html)) {
    console.log(`Store hours already exists in active template ${template.id}; no update was needed.`);
    process.exitCode = 0;
  } else {
    const bannerCard = '<div class="card box-2" data-type="CONTROL_BANNER">';
    if (!html.includes(bannerCard)) throw new Error('The Banner Slot card was not found');

    const storeHoursControl = `<div class="store-hours-row" data-type="STORE_HOURS">
  <div class="content-placeholder"><storehours></storehours></div>
</div>
`;
    const updatedHtml = html.replace(bannerCard, `${storeHoursControl}${bannerCard}`);

    await pool.query(
      'update hp_templates set homepage_html=$1, updated_at=current_timestamp where id=$2',
      [updatedHtml, template.id]
    );
    console.log(`Inserted store hours above Banner Slot in template ${template.id} (${template.template_name}).`);
  }

  const verifyResult = await pool.query(
    'select homepage_html from hp_templates where id=$1',
    [template.id]
  );
  const savedHtml = (verifyResult.rows || verifyResult[0])[0]?.homepage_html || '';
  const storeIndex = savedHtml.search(/<storehours\b/i);
  const bannerIndex = savedHtml.search(/<banner_slot\b/i);

  if (storeIndex < 0 || bannerIndex < 0 || storeIndex >= bannerIndex) {
    throw new Error('Verification failed: store hours is not above the Banner Slot');
  }

  console.log(JSON.stringify({ templateId: template.id, storeIndex, bannerIndex, verified: true }));
} finally {
  await pool.end?.();
}
