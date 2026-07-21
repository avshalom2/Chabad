import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const logoPath = 'public/header-chabad-logo.png';
const originalWidth = 1883;
const compactWidth = 1763;
const height = 835;
const rightSectionStart = 1330;
const rightSectionOffset = 1210;

const image = sharp(logoPath);
const metadata = await image.metadata();

if (metadata.width !== originalWidth || metadata.height !== height) {
  throw new Error(`Expected ${originalWidth}x${height}, got ${metadata.width}x${metadata.height}`);
}

const source = await image.png().toBuffer();
const leftSection = await sharp(source)
  .extract({ left: 0, top: 0, width: rightSectionStart, height })
  .png()
  .toBuffer();
const rightSection = await sharp(source)
  .extract({
    left: rightSectionStart,
    top: 0,
    width: originalWidth - rightSectionStart,
    height,
  })
  .png()
  .toBuffer();

const compactLogo = await sharp({
  create: {
    width: compactWidth,
    height,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([
    { input: leftSection, left: 0, top: 0 },
    { input: rightSection, left: rightSectionOffset, top: 0 },
  ])
  .png()
  .toBuffer();

await writeFile(logoPath, compactLogo);
