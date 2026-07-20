import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getActiveTemplate, updateTemplateHtml } from '../src/lib/hp-templates.js';

function findDivByClass(html, className) {
  const startPattern = new RegExp(`<div\\s+class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>`, 'i');
  const startMatch = startPattern.exec(html);
  if (!startMatch) throw new Error(`Could not find .${className}`);

  const tokenPattern = /<div\b[^>]*>|<\/div>/gi;
  tokenPattern.lastIndex = startMatch.index;
  let depth = 0;
  let token;

  while ((token = tokenPattern.exec(html))) {
    if (/^<div\b/i.test(token[0])) depth += 1;
    else depth -= 1;

    if (depth === 0) {
      return {
        start: startMatch.index,
        end: tokenPattern.lastIndex,
        html: html.slice(startMatch.index, tokenPattern.lastIndex),
        openTag: startMatch[0],
      };
    }
  }

  throw new Error(`Unclosed .${className}`);
}

function appendChildren(parent, children) {
  const closingIndex = parent.lastIndexOf('</div>');
  return `${parent.slice(0, closingIndex)}\n${children.join('\n')}\n${parent.slice(closingIndex)}`;
}

const template = await getActiveTemplate();
if (!template) throw new Error('No active homepage template was found');
if (template.template_name !== 'Home Page 4.0') {
  throw new Error(`Expected active template "Home Page 4.0", found "${template.template_name}"`);
}

let html = template.homepage_html || template.template_html || '';
const rightStack = findDivByClass(html, 'right-stack');
const leftStack = findDivByClass(html, 'left-stack');
const weeklyPrayer = findDivByClass(html, 'box-1');
const banner = findDivByClass(html, 'box-2');
const events = findDivByClass(html, 'box-3');
const services = findDivByClass(html, 'box-4');
const slider = findDivByClass(html, 'box-5');
const contact = findDivByClass(html, 'box-6');

const updatedRightStack = appendChildren(rightStack.openTag + '</div>', [
  weeklyPrayer.html,
  events.html,
  contact.html,
]);
const updatedLeftStack = appendChildren(leftStack.openTag + '</div>', [banner.html]);

const layout = findDivByClass(html, 'main-layout');
const updatedLayout = appendChildren(layout.openTag + '</div>', [
  updatedRightStack,
  updatedLeftStack,
  services.html,
  slider.html,
]);

html = html.slice(0, layout.start) + updatedLayout + html.slice(layout.end);
html = html.replace(
  '.box-5 { grid-column: 1 / 4; grid-row: 2 / 3; }',
  '.box-4 { grid-column: 1 / 4; grid-row: 2 / 3; }\n    .box-5 { grid-column: 1 / 4; grid-row: 3 / 4; }'
);
html = html.replace(
  '        .box-1 { order: 1; }\n        .box-6 { order: 2; }\n        .box-2 { order: 3; }\n        .box-3 { order: 4; }\n        .box-4 { order: 5; }\n        .box-5 { order: 6; }',
  '        .box-1 { order: 1; }\n        .box-3 { order: 2; }\n        .box-6 { order: 3; }\n        .box-2 { order: 4; }\n        .box-4 { order: 5; }\n        .box-5 { order: 6; }'
);

const previewDocument = `<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Home Page 4.0 – layout preview</title>
  <style>
    banner_slot {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 120px;
      margin: 16px 0;
      border: 2px dashed #8d5592;
      border-radius: 8px;
      background: #faf4fb;
      color: #630a10;
      font-weight: 700;
    }
    banner_slot::before { content: "Home Page Slot — banner 1"; }
  </style>
</head>
<body>
${html}
</body>
</html>
`;

const outputPath = resolve('public/home-page-4-layout-preview.html');
await writeFile(outputPath, previewDocument, 'utf8');

const shouldApply = process.argv.includes('--apply');
if (shouldApply) {
  const updated = await updateTemplateHtml(template.id, html);
  if (!updated) throw new Error('The active template was not updated');
}

console.log(JSON.stringify({
  templateId: template.id,
  templateName: template.template_name,
  outputPath,
  outputLength: previewDocument.length,
  applied: shouldApply,
}));
