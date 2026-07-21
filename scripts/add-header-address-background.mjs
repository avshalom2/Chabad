import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const logoPath = 'public/header-chabad-logo.png';
const source = await sharp(logoPath).png().toBuffer();

const clearOldAddress = Buffer.from(`
  <svg width="1763" height="835" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="590" width="1210" height="165" fill="#ffffff" />
  </svg>
`);

const addressLine = Buffer.from(`
  <svg width="1763" height="835" xmlns="http://www.w3.org/2000/svg">
    <rect x="178" y="612" width="1012" height="120" fill="#ffffff" />
    <text x="684" y="708"
      fill="#681027"
      font-family="Arial, sans-serif"
      font-size="100"
      font-weight="700"
      text-anchor="middle"
      direction="rtl"
      unicode-bidi="bidi-override"
      textLength="970"
      lengthAdjust="spacingAndGlyphs">הרצליה משכית 22</text>
  </svg>
`);

const updatedLogo = await sharp(source)
  .composite([
    { input: clearOldAddress, blend: 'dest-out' },
    { input: addressLine },
  ])
  .png()
  .toBuffer();

await writeFile(logoPath, updatedLogo);
