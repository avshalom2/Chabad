import { HDate } from '@hebcal/core';

const HEBREW_MONTHS_NAMES = {
  'Tishrei': 'תשרי',
  'Cheshvan': 'חשוון',
  'Kislev': 'כסלו',
  'Tevet': 'טבת',
  'Shevat': 'שבט',
  'Adar': 'אדר',
  'Adar I': 'אדר א׳',
  'Adar II': 'אדר ב׳',
  'Nisan': 'ניסן',
  'Iyar': 'אייר',
  'Iyyar': 'אייר',
  'Sivan': 'סיוון',
  'Tamuz': 'תמוז',
  'Av': 'אב',
  'Elul': 'אלול'
};

const HEBREW_NUMBERS = {
  1: 'א׳', 2: 'ב׳', 3: 'ג׳', 4: 'ד׳', 5: 'ה׳', 6: 'ו׳', 7: 'ז׳', 8: 'ח׳', 9: 'ט׳', 10: 'י׳',
  11: 'י״א', 12: 'י״ב', 13: 'י״ג', 14: 'י״ד', 15: 'ט״ו', 16: 'ט״ז', 17: 'י״ז', 18: 'י״ח', 19: 'י״ט', 20: 'כ׳',
  21: 'כ״א', 22: 'כ״ב', 23: 'כ״ג', 24: 'כ״ד', 25: 'כ״ה', 26: 'כ״ו', 27: 'כ״ז', 28: 'כ״ח', 29: 'כ״ט', 30: 'ל׳'
};

function numberToHebrew(num) {
  const ONES = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
  const TENS = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
  const HUNDREDS = ['', 'ק', 'ר', 'ש', 'ת'];

  let result = '';
  
  // Handle hundreds
  const h = Math.floor(num / 100);
  if (h > 0) {
    if (h <= 4) {
      result += HUNDREDS[h];
    } else {
      // For 500-900: combine 400 with additional hundreds
      result += HUNDREDS[4]; // ת (400)
      result += HUNDREDS[h - 4]; // ק, ר, ש, ת (for 500, 600, 700, 800)
    }
  }
  
  // Handle tens
  const t = Math.floor((num % 100) / 10);
  if (t > 0) {
    result += TENS[t];
  }
  
  // Handle ones
  const o = num % 10;
  if (o > 0) {
    result += ONES[o];
  }
  
  // Add gershayim (״) between last two characters
  if (result.length > 1) {
    result = result.slice(0, -1) + '״' + result.slice(-1);
  } else if (result.length === 1) {
    result += '׳';
  }
  
  return result;
}

export function formatHebrewDate(jsDate) {
  try {
    const hdate = new HDate(jsDate);
    const day = hdate.getDate();
    const monthNameEn = hdate.getMonthName();
    const monthName = HEBREW_MONTHS_NAMES[monthNameEn] || monthNameEn;
    const year = hdate.getFullYear();
    
    // Year in Hebrew calendar format (last 3 digits with gershayim)
    const yearLastThree = year % 1000;
    const yearHeb = numberToHebrew(yearLastThree);
    
    const dayStr = HEBREW_NUMBERS[day] || day;
    
    return `${dayStr} ${monthName} ${yearHeb}`;
  } catch (error) {
    console.error('Error formatting Hebrew date:', error);
    return '';
  }
}

export function getHebrewDate(jsDate) {
  try {
    const hdate = new HDate(jsDate);
    return {
      day: hdate.getDate(),
      month: hdate.getMonthName(),
      year: hdate.getFullYear()
    };
  } catch (error) {
    console.error('Error getting Hebrew date:', error);
    return null;
  }
}
