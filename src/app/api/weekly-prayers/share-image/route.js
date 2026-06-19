import { readFile } from 'fs/promises';
import path from 'path';

import { getWeeklyPrayerSchedule } from '@/lib/weekly-prayers.js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const IMAGE_WIDTH = 864;
const IMAGE_HEIGHT = 1212;

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function groupTimes(times = []) {
  return times.reduce((groups, time) => {
    const key = `${time.prayer_type}:${time.day_group}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(time);
    return groups;
  }, {});
}

function sortedTimes(groups, prayerType, dayGroup) {
  return [...(groups[`${prayerType}:${dayGroup}`] || [])]
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .map((time) => time.time_value)
    .filter(Boolean);
}

function formatTimes(times) {
  return times.join(' ,');
}

function dateRange(schedule) {
  if (schedule.hebrew_date_range_text) return schedule.hebrew_date_range_text;

  const from = schedule.hebrew_date_from;
  const to = schedule.hebrew_date_to;
  const month = schedule.hebrew_month;

  if (from && to && month) return `${from} - ${to} ${month}`;
  if (from && month) return `${from} ${month}`;
  return '';
}

function textLine(text, x, y, size = 28, weight = 600, color = '#080808') {
  return `<text x="${x}" y="${y}" text-anchor="middle" direction="rtl" unicode-bidi="plaintext" font-size="${size}" font-weight="${weight}" fill="${color}">${escapeXml(text)}</text>`;
}

function sectionBar(text, y, icon = '') {
  return `
    <rect x="180" y="${y - 31}" width="504" height="44" fill="url(#sectionBar)"/>
    ${icon ? textLine(icon, 510, y, 32, 500) : ''}
    ${textLine(text, 432, y, 34, 800)}
  `;
}

async function getTemplateImageDataUri() {
  const imagePath = path.join(process.cwd(), 'public', 'ZmaneyTfila.png');
  const image = await readFile(imagePath);
  return `data:image/png;base64,${image.toString('base64')}`;
}

export async function GET() {
  const [schedule, templateImage] = await Promise.all([
    getWeeklyPrayerSchedule(),
    getTemplateImageDataUri(),
  ]);

  const groups = groupTimes(schedule.times || []);
  const shacharitSunThu = formatTimes(sortedTimes(groups, 'shacharit', 'sun_thu'));
  const shacharitFriday = formatTimes(sortedTimes(groups, 'shacharit', 'friday'));
  const minchaSunThu = formatTimes(sortedTimes(groups, 'mincha', 'sun_thu'));
  const minchaSunset = sortedTimes(groups, 'mincha', 'sunset')[0] || '';
  const minchaFriday = formatTimes(sortedTimes(groups, 'mincha', 'friday'));
  const maariv = sortedTimes(groups, 'maariv', 'sun_thu')[0] || '';
  const parasha = schedule.parasha_name || 'השבוע';
  const range = dateRange(schedule);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" viewBox="0 0 ${IMAGE_WIDTH} ${IMAGE_HEIGHT}" direction="rtl" color-scheme="light" style="color-scheme: light; background: #ffffff;">
  <defs>
    <style>
      svg, rect, text, image {
        color-scheme: light;
        forced-color-adjust: none;
      }
    </style>
    <linearGradient id="sectionBar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f4f0e8" stop-opacity="0"/>
      <stop offset="50%" stop-color="#d7d0c0" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#f4f0e8" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <image href="${templateImage}" x="0" y="0" width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" preserveAspectRatio="none"/>

  <rect x="137" y="142" width="590" height="955" fill="#ffffff" opacity="0.92"/>
  <rect x="150" y="155" width="564" height="929" fill="#ffffff" opacity="0.58"/>

  <g font-family="Arial, sans-serif" style="font-family: Arial, sans-serif;">
    ${textLine('ב"ה', 688, 179, 24, 500, '#927f54')}
    ${textLine('בית חב"ד אזור התעשייה הרצליה', 432, 245, 42, 800)}
    ${textLine("רח' משכית 22", 432, 296, 42, 800)}
    ${textLine('(שע"י מוסדות חב"ד הרצליה (ע"ר))', 432, 333, 25, 500)}
    ${textLine("שעות הפתיחה (בימים א' - ה'):", 432, 386, 42, 800)}
    ${textLine('19:00 - 10:00', 432, 445, 48, 800)}
    ${textLine(`פרשת ${parasha}${range ? ` - ${range}` : ''}`, 432, 518, 42, 800)}

    ${sectionBar('שחרית', 590, '🕍')}
    ${textLine(`א'-ה': ${shacharitSunThu}`, 432, 640, 35, 500)}
    ${textLine(`שישי: ${shacharitFriday} בלבד`, 432, 684, 35, 500)}

    ${sectionBar('מנחה', 760, '☼')}
    ${textLine(`א'-ה': ${minchaSunThu}`, 432, 812, 35, 500)}
    ${textLine(`מנחה (לפני שקיעה): ${minchaSunset}`, 432, 858, 35, 500)}
    ${textLine(`שישי: ${minchaFriday} בלבד`, 432, 904, 35, 500)}

    ${sectionBar('ערבית', 986, '☾')}
    ${textLine(maariv, 432, 1036, 38, 500)}
  </g>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
