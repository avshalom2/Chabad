import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const logoPath = 'public/header-chabad-logo.png';
const source = await sharp(logoPath).png().toBuffer();

const addressBackground = Buffer.from(`
  <svg width="1883" height="835" xmlns="http://www.w3.org/2000/svg">
    <rect x="78" y="612" width="1280" height="120" fill="#ffffff" />
  </svg>
`);

const updatedLogo = await sharp(addressBackground)
  .composite([{ input: source }])
  .png()
  .toBuffer();

await writeFile(logoPath, updatedLogo);
