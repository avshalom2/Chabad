import { readFile } from 'fs/promises';
import path from 'path';

import { getWeeklyPrayerSchedule } from '@/lib/weekly-prayers.js';

export const dynamic = 'force-dynamic';

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
    .map((time) => time.time_value);
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

function textLine(text, x, y, size = 24, weight = 600, color = '#070707') {
  return `<text x="${x}" y="${y}" text-anchor="middle" direction="rtl" unicode-bidi="plaintext" font-size="${size}" font-weight="${weight}" fill="${color}">${escapeXml(text)}</text>`;
}

function pill(text, x, y, width = 168) {
  return `
    <rect x="${x - width / 2}" y="${y - 25}" width="${width}" height="34" rx="8" fill="#d8d8d8" opacity="0.95"/>
    ${textLine(text, x, y, 25, 700)}
  `;
}

async function getBaseImageDataUri() {
  const imagePath = path.join(process.cwd(), 'public', 'OpenHours.png');
  const image = await readFile(imagePath);
  return `data:image/png;base64,${image.toString('base64')}`;
}

export async function GET() {
  const [schedule, baseImage] = await Promise.all([
    getWeeklyPrayerSchedule(),
    getBaseImageDataUri(),
  ]);

  const groups = groupTimes(schedule.times || []);
  const shacharitSunThu = sortedTimes(groups, 'shacharit', 'sun_thu').join(', ');
  const shacharitFriday = sortedTimes(groups, 'shacharit', 'friday').join(', ');
  const minchaSunThu = sortedTimes(groups, 'mincha', 'sun_thu').join(', ');
  const minchaSunset = sortedTimes(groups, 'mincha', 'sunset')[0] || '';
  const minchaFriday = sortedTimes(groups, 'mincha', 'friday').join(', ');
  const maariv = sortedTimes(groups, 'maariv', 'sun_thu')[0] || '';
  const parasha = schedule.parasha_name || 'השבוע';
  const range = dateRange(schedule);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="690" height="980" viewBox="0 0 690 980" direction="rtl">
  <image href="${baseImage}" x="0" y="0" width="690" height="980" preserveAspectRatio="xMidYMid slice"/>

  <rect x="52" y="106" width="604" height="644" fill="#ffffff" opacity="0.99"/>
  <rect x="0" y="856" width="690" height="98" fill="#ffffff"/>

  <g font-family="Arial, sans-serif" style="font-family: Arial, sans-serif;">
    ${textLine('בית חב"ד אזור התעשייה הרצליה', 345, 155, 29, 700)}
    ${textLine("רח' משכית 22", 345, 197, 28, 700)}
    ${textLine('(שע"י מוסדות חב"ד הרצליה (ע"ר))', 345, 228, 16, 500)}
    ${textLine("שעות הפתיחה (בימים א' - ה'):", 345, 265, 27, 700)}
    ${textLine('19:00 - 10:00', 345, 310, 29, 700)}
    ${textLine(`פרשת ${parasha}${range ? ` - ${range}` : ''}`, 345, 360, 29, 700)}

    ${pill('שחרית', 345, 416)}
    ${textLine(`א'-ה': ${shacharitSunThu}`, 345, 454, 23, 700)}
    ${textLine(`שישי: ${shacharitFriday} בלבד`, 345, 492, 23, 700)}

    ${pill('מנחה', 345, 544)}
    ${textLine(`א'-ה': ${minchaSunThu}`, 345, 582, 22, 700)}
    ${textLine(`מנחה (לפני שקיעה): ${minchaSunset}`, 345, 621, 22, 700)}
    ${textLine(`שישי: ${minchaFriday} בלבד`, 345, 660, 22, 700)}

    ${pill('ערבית', 345, 709)}
    ${textLine(maariv, 345, 747, 24, 700)}

    ${textLine('לפרטים - whatsapp בלבד: 0522523430', 345, 894, 18, 400, '#61788a')}
    ${textLine('kfar770@gmail.com', 345, 922, 18, 400, '#61788a')}
    ${textLine('יחי אדוננו מורנו ורבינו מלך המשיח לעולם ועד', 345, 950, 18, 400, '#61788a')}
  </g>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
