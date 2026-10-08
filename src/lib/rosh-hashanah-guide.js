import { HDate } from '@hebcal/core';

export function getRoshHashanahGuide(now = new Date()) {
  const year = Number(new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jerusalem', year: 'numeric',
  }).format(now));
  // July is always before Rosh Hashanah in this Gregorian year.
  const hebrewYear = new HDate(new Date(year, 6, 1)).getFullYear() + 1;
  const firstDay = new HDate(1, 'Tishrei', hebrewYear).getDay();
  const filenames = {
    1: 'rosh_hashanah_guide_weekdays_final.pdf',
    2: 'rosh_hashanah_guide_weekdays_final.pdf',
    4: 'rosh_hashanah_guide_thursday_friday.pdf',
    6: 'rosh_hashanah_guide_suterday_sunday.pdf',
  };
  const filename = filenames[firstDay];
  if (filename === undefined) throw new Error(`Unexpected Rosh Hashanah weekday: ${firstDay}`);
  return { year, hebrewYear, firstDay, filename };
}
