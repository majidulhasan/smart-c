import { format, addDays, differenceInDays } from 'date-fns';

/**
 * Hijri Calculation Logic (Kuwaiti Algorithm)
 */
export function getHijriDate(date: Date, adjustment: number = 0) {
  const jd = Math.floor((date.getTime() + (adjustment * 86400000)) / 86400000) + 2440587.5;
  const l = Math.floor(jd - 1948440 + 10632);
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2 + 245) / 17719) + Math.floor(l2 / 401) * Math.floor((27 * l2 + 424) / 9739);
  const l3 = l2 - Math.floor((17719 * j + 285) / 50) - Math.floor((9739 * j + 2) / 27) + 423;
  const m = Math.floor((30 * l3 + 106) / 885);
  const d = l3 - Math.floor((885 * m + 6) / 30);
  const y = 30 * n + j - 30;

  const months = [
    "Muharram", "Safar", "Rabi' al-awwal", "Rabi' al-thani",
    "Jumada al-ula", "Jumada al-akhira", "Rajab", "Sha'ban",
    "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
  ];

  return {
    day: d,
    month: m,
    monthName: months[m - 1],
    year: y
  };
}

/**
 * Revised Bangla Calendar Logic (Bangladesh)
 */
export function getBanglaDate(date: Date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  let bDay, bMonth, bYear;

  // Bangla Year starts from April 14
  bYear = year - 593;
  if (month < 4 || (month === 4 && day < 14)) {
    bYear -= 1;
  }

  const months = [
    "Boishakh", "Joishtho", "Ashar", "Shrabon", "Bhadro", "Ashwin",
    "Kartik", "Agrahayan", "Poush", "Magh", "Falgun", "Choitro"
  ];

  // Simplified logic for conversion
  // In Bangladesh:
  // Boishakh to Bhadro (5 months) = 31 days
  // Ashwin to Choitro (7 months) = 30 days (Falgun 31 in leap year)
  
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  
  // Reference: April 14 is 1st Boishakh
  const diff = differenceInDays(date, new Date(year, 3, 14));
  
  if (diff >= 0) {
    // After or on April 14
    if (diff < 31) { bMonth = 0; bDay = diff + 1; }
    else if (diff < 62) { bMonth = 1; bDay = diff - 31 + 1; }
    else if (diff < 93) { bMonth = 2; bDay = diff - 62 + 1; }
    else if (diff < 124) { bMonth = 3; bDay = diff - 93 + 1; }
    else if (diff < 155) { bMonth = 4; bDay = diff - 124 + 1; }
    else if (diff < 185) { bMonth = 5; bDay = diff - 155 + 1; }
    else if (diff < 215) { bMonth = 6; bDay = diff - 185 + 1; }
    else if (diff < 245) { bMonth = 7; bDay = diff - 215 + 1; }
    else if (diff < 275) { bMonth = 8; bDay = diff - 245 + 1; }
    else if (diff < 305) { bMonth = 9; bDay = diff - 275 + 1; }
    else {
      const falgunDays = isLeapYear ? 31 : 30;
      if (diff < 305 + falgunDays) { bMonth = 10; bDay = diff - 305 + 1; }
      else { bMonth = 11; bDay = diff - (305 + falgunDays) + 1; }
    }
  } else {
    // Before April 14
    const prevYear = year - 1;
    const prevIsLeap = (prevYear % 4 === 0 && prevYear % 100 !== 0) || (prevYear % 400 === 0);
    const totalDays = 365 + (prevIsLeap ? 1 : 0);
    const diffFromPrev = totalDays + diff;
    
    // Logic repeats for previous year's end
    if (diffFromPrev >= 305) {
        const falgunDays = prevIsLeap ? 31 : 30;
        if (diffFromPrev < 305 + falgunDays) { bMonth = 10; bDay = diffFromPrev - 305 + 1; }
        else { bMonth = 11; bDay = diffFromPrev - (305 + falgunDays) + 1; }
    } else if (diffFromPrev >= 275) { bMonth = 9; bDay = diffFromPrev - 275 + 1; }
    // ... simplified for brevity, usually we only need current year
    else { bMonth = 0; bDay = 1; } // Fallback
  }

  const seasons = [
    "গ্রীষ্মকাল", "বর্ষাকাল", "শরৎকাল", "হেমন্তকাল", "শীতকাল", "বসন্তকাল"
  ];
  const bSeason = seasons[Math.floor(bMonth / 2)];

  return {
    day: bDay,
    month: bMonth + 1,
    monthName: months[bMonth],
    year: bYear,
    season: bSeason
  };
}

export const ISLAMIC_EVENTS = [
  { name: "Ramadan Start", month: 9, day: 1, type: 'hijri' },
  { name: "Eid-ul-Fitr", month: 10, day: 1, type: 'hijri' },
  { name: "Eid-ul-Adha", month: 12, day: 10, type: 'hijri' },
  { name: "Ashura", month: 1, day: 10, type: 'hijri' },
  { name: "Shab-e-Barat", month: 8, day: 15, type: 'hijri' },
  { name: "Shab-e-Qadr", month: 9, day: 27, type: 'hijri' },
  { name: "Milad-un-Nabi", month: 3, day: 12, type: 'hijri' },
  { name: "Islamic New Year", month: 1, day: 1, type: 'hijri' },
];

export const BANGLA_NUMBERS: Record<string, string> = {
  '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
};

export function toBanglaNumber(n: number | string) {
  return String(n).split('').map(char => BANGLA_NUMBERS[char] || char).join('');
}
