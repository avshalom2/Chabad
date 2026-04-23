import pgPool from './src/lib/db.pg.js';

const content = `
<section style="background: linear-gradient(135deg, #fffaf0 0%, #fff 45%, #fff7e6 100%); border: 1px solid #f0dfb7; border-radius: 22px; padding: 28px; margin-bottom: 28px; box-shadow: 0 18px 40px rgba(122, 20, 40, 0.08); overflow: hidden; position: relative;">
  <div style="position:absolute; inset:0; background: radial-gradient(circle at top left, rgba(255,215,128,0.28), transparent 38%), radial-gradient(circle at bottom right, rgba(122,20,40,0.08), transparent 34%);"></div>
  <div style="position: relative; z-index: 1;">
    <div style="display:inline-flex; align-items:center; gap:10px; background:#7a1428; color:#fff; padding:8px 14px; border-radius:999px; font-size:14px; font-weight:700; margin-bottom:18px;">חנוכה • מדריך מהיר למשפחה ולבית</div>
    <h2 style="font-size: clamp(2rem, 4vw, 3.2rem); line-height:1.15; margin:0 0 12px; color:#111827;">חנוכה - שאלות ותשובות</h2>
    <p style="font-size:1.12rem; line-height:1.9; color:#4b5563; margin:0 0 22px; max-width:900px;">הדלקת נרות, זמני הברכות, סדר ההדלקה, מקום החנוכייה ומשמעות החג בחיי המשפחה. ריכזנו כאן תשובות ברורות ונעימות לקריאה, כדי שתוכלו לראות איך כתבה עשירה נראית באתר גם עם תוכן מעוצב.</p>

    <div style="display:grid; grid-template-columns: 1.15fr 0.85fr; gap:22px; align-items:stretch; margin-top:20px;">
      <div style="background:#fff; border:1px solid #f1e4c7; border-radius:18px; padding:22px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
        <svg viewBox="0 0 640 360" role="img" aria-label="איור חנוכייה" style="width:100%; height:auto; display:block; border-radius:14px; background: linear-gradient(180deg, #fff7db 0%, #fff1c2 100%);">
          <defs>
            <linearGradient id="bgGlow" x1="0" x2="1">
              <stop offset="0%" stop-color="#fff8df" />
              <stop offset="100%" stop-color="#ffeab0" />
            </linearGradient>
            <linearGradient id="candle" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="#fffef8" />
              <stop offset="100%" stop-color="#f1e8cb" />
            </linearGradient>
            <linearGradient id="base" x1="0" x2="1">
              <stop offset="0%" stop-color="#6d1023" />
              <stop offset="100%" stop-color="#9e1f35" />
            </linearGradient>
          </defs>
          <rect width="640" height="360" fill="url(#bgGlow)"/>
          <g opacity="0.25">
            <circle cx="92" cy="58" r="54" fill="#ffd36b"/>
            <circle cx="558" cy="78" r="70" fill="#ffe4a0"/>
          </g>
          <g transform="translate(78, 78)">
            <rect x="34" y="182" width="416" height="22" rx="11" fill="url(#base)"/>
            <rect x="226" y="96" width="32" height="108" rx="12" fill="url(#base)"/>
            <rect x="196" y="78" width="92" height="24" rx="12" fill="#b32841"/>
            <g transform="translate(10,0)">
              <rect x="0" y="126" width="20" height="66" rx="10" fill="url(#candle)" stroke="#e6d9aa" />
              <rect x="-8" y="118" width="36" height="12" rx="6" fill="#7a1428" />
              <path d="M10 117 C1 105, 2 91, 10 80 C18 91, 19 105, 10 117Z" fill="#ffb703"/>
              <path d="M10 109 C5 101, 6 91, 10 86 C14 91, 15 101, 10 109Z" fill="#ffe082"/>
            </g>
            <g transform="translate(62,0)">
              <rect x="0" y="126" width="20" height="66" rx="10" fill="url(#candle)" stroke="#e6d9aa" />
              <rect x="-8" y="118" width="36" height="12" rx="6" fill="#7a1428" />
              <path d="M10 117 C1 105, 2 91, 10 80 C18 91, 19 105, 10 117Z" fill="#ffb703"/>
              <path d="M10 109 C5 101, 6 91, 10 86 C14 91, 15 101, 10 109Z" fill="#ffe082"/>
            </g>
            <g transform="translate(114,0)">
              <rect x="0" y="126" width="20" height="66" rx="10" fill="url(#candle)" stroke="#e6d9aa" />
              <rect x="-8" y="118" width="36" height="12" rx="6" fill="#7a1428" />
              <path d="M10 117 C1 105, 2 91, 10 80 C18 91, 19 105, 10 117Z" fill="#ffb703"/>
              <path d="M10 109 C5 101, 6 91, 10 86 C14 91, 15 101, 10 109Z" fill="#ffe082"/>
            </g>
            <g transform="translate(166,0)">
              <rect x="0" y="126" width="20" height="66" rx="10" fill="url(#candle)" stroke="#e6d9aa" />
              <rect x="-8" y="118" width="36" height="12" rx="6" fill="#7a1428" />
              <path d="M10 117 C1 105, 2 91, 10 80 C18 91, 19 105, 10 117Z" fill="#ffb703"/>
              <path d="M10 109 C5 101, 6 91, 10 86 C14 91, 15 101, 10 109Z" fill="#ffe082"/>
            </g>
            <g transform="translate(226,0)">
              <rect x="0" y="88" width="32" height="104" rx="12" fill="url(#candle)" stroke="#e6d9aa"/>
              <rect x="-10" y="80" width="52" height="14" rx="7" fill="#7a1428" />
              <path d="M16 79 C2 59, 4 34, 16 16 C28 34, 30 59, 16 79Z" fill="#ff8c00"/>
              <path d="M16 68 C9 55, 10 39, 16 29 C22 39, 23 55, 16 68Z" fill="#ffe082"/>
            </g>
            <g transform="translate(270,0)">
              <rect x="0" y="126" width="20" height="66" rx="10" fill="url(#candle)" stroke="#e6d9aa" />
              <rect x="-8" y="118" width="36" height="12" rx="6" fill="#7a1428" />
              <path d="M10 117 C1 105, 2 91, 10 80 C18 91, 19 105, 10 117Z" fill="#ffb703"/>
              <path d="M10 109 C5 101, 6 91, 10 86 C14 91, 15 101, 10 109Z" fill="#ffe082"/>
            </g>
            <g transform="translate(322,0)">
              <rect x="0" y="126" width="20" height="66" rx="10" fill="url(#candle)" stroke="#e6d9aa" />
              <rect x="-8" y="118" width="36" height="12" rx="6" fill="#7a1428" />
              <path d="M10 117 C1 105, 2 91, 10 80 C18 91, 19 105, 10 117Z" fill="#ffb703"/>
              <path d="M10 109 C5 101, 6 91, 10 86 C14 91, 15 101, 10 109Z" fill="#ffe082"/>
            </g>
            <g transform="translate(374,0)">
              <rect x="0" y="126" width="20" height="66" rx="10" fill="url(#candle)" stroke="#e6d9aa" />
              <rect x="-8" y="118" width="36" height="12" rx="6" fill="#7a1428" />
              <path d="M10 117 C1 105, 2 91, 10 80 C18 91, 19 105, 10 117Z" fill="#ffb703"/>
              <path d="M10 109 C5 101, 6 91, 10 86 C14 91, 15 101, 10 109Z" fill="#ffe082"/>
            </g>
          </g>
        </svg>
        <div style="display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:12px; margin-top:16px;">
          <div style="background:#fff8e8; border:1px solid #f3dfb3; border-radius:14px; padding:12px 14px;"><div style="font-size:12px; color:#7a1428; font-weight:700; margin-bottom:4px;">זמן ההדלקה</div><div style="font-size:14px; color:#374151; line-height:1.6;">משקיעת החמה ועד שתכלה רגל מן השוק</div></div>
          <div style="background:#fff8e8; border:1px solid #f3dfb3; border-radius:14px; padding:12px 14px;"><div style="font-size:12px; color:#7a1428; font-weight:700; margin-bottom:4px;">מספר הנרות</div><div style="font-size:14px; color:#374151; line-height:1.6;">מוסיפים בכל לילה נר אחד</div></div>
          <div style="background:#fff8e8; border:1px solid #f3dfb3; border-radius:14px; padding:12px 14px;"><div style="font-size:12px; color:#7a1428; font-weight:700; margin-bottom:4px;">מיקום החנוכייה</div><div style="font-size:14px; color:#374151; line-height:1.6;">במקום גלוי לפרסום הנס</div></div>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:16px;">
        <div style="background:#7a1428; color:#fff; border-radius:18px; padding:20px; box-shadow:0 10px 24px rgba(122,20,40,0.18);">
          <div style="font-size:13px; opacity:0.85; margin-bottom:8px;">למה הכתבה הזו טובה לבדיקת עיצוב?</div>
          <div style="font-size:1.05rem; line-height:1.8; font-weight:600;">יש כאן כותרת חזקה, אזור פתיחה מעוצב, בלוקים של מידע, שאלות ותשובות, ציטוט, רשימות, הדגשות וקריאה לפעולה.</div>
        </div>
        <div style="background:#fff; border:1px solid #f1e4c7; border-radius:18px; padding:20px;">
          <h3 style="margin:0 0 12px; color:#111827; font-size:1.1rem;">מה בכתבה?</h3>
          <ul style="margin:0; padding:0 18px 0 0; color:#4b5563; line-height:2; font-size:15px;">
            <li>משמעות קצרה וברורה של חג החנוכה</li>
            <li>שאלות נפוצות למשפחה, אורחים וילדים</li>
            <li>טיפים להגשה יפה של תוכן באתר</li>
            <li>אזורים שנראים טוב גם במסך רחב וגם בנייד</li>
          </ul>
        </div>
        <div style="background:linear-gradient(180deg,#fff 0%,#fff9ee 100%); border:1px solid #f1e4c7; border-radius:18px; padding:20px;">
          <h3 style="margin:0 0 8px; color:#7a1428; font-size:1.05rem;">רעיון מרכזי</h3>
          <p style="margin:0; line-height:1.85; color:#4b5563; font-size:15px;">החנוכה הוא חג של אור בבית ובחוץ גם יחד: אור של זהות, של שמחה, של פרסום הנס ושל היכולת להוסיף מעט אור בכל יום.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:26px;">
  <div style="background:#fff; border:1px solid #ece7da; border-radius:18px; padding:24px; box-shadow:0 8px 24px rgba(0,0,0,0.04);">
    <h3 style="margin:0 0 14px; color:#111827; font-size:1.45rem;">מה מיוחד בחנוכה?</h3>
    <p style="margin:0 0 12px; color:#4b5563; line-height:1.95;">חנוכה מציין את ניצחון הרוח היהודית ואת חידוש עבודת המקדש. לצד הניצחון הצבאי, עיקר הדגש בחג הוא על האור: להדליק, לפרסם, לזכור ולהעביר הלאה מסר של תקווה והתמדה.</p>
    <p style="margin:0; color:#4b5563; line-height:1.95;">דווקא בעונת החורף, כשמוקדם להחשיך, החג מזכיר לנו שלא מחכים לאור מבחוץ בלבד. אנחנו מוזמנים להוסיף אותו בעצמנו.</p>
  </div>
  <div style="background:linear-gradient(135deg,#fff7e8 0%,#fff 100%); border:1px solid #f0dfb7; border-radius:18px; padding:24px; box-shadow:0 8px 24px rgba(0,0,0,0.04);">
    <h3 style="margin:0 0 14px; color:#7a1428; font-size:1.45rem;">איך לשלב את החג בבית?</h3>
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div style="display:flex; gap:12px; align-items:flex-start;"><div style="width:34px; height:34px; border-radius:50%; background:#7a1428; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; flex-shrink:0;">1</div><div style="color:#4b5563; line-height:1.8;">לקבוע מקום מכובד לחנוכייה שנראה היטב לבני הבית ולאורחים.</div></div>
      <div style="display:flex; gap:12px; align-items:flex-start;"><div style="width:34px; height:34px; border-radius:50%; background:#7a1428; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; flex-shrink:0;">2</div><div style="color:#4b5563; line-height:1.8;">לשתף את הילדים בהדלקה, בשירים, בשאלות ובסיפור הנס.</div></div>
      <div style="display:flex; gap:12px; align-items:flex-start;"><div style="width:34px; height:34px; border-radius:50%; background:#7a1428; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; flex-shrink:0;">3</div><div style="color:#4b5563; line-height:1.8;">להפוך כל ערב להזדמנות קטנה לשיחה על ערכים, זהות והוספת אור בעולם.</div></div>
    </div>
  </div>
</section>

<section style="background:#fff; border:1px solid #ece7da; border-radius:22px; padding:28px; margin-bottom:26px; box-shadow:0 12px 30px rgba(0,0,0,0.05);">
  <div style="display:flex; align-items:center; justify-content:space-between; gap:18px; margin-bottom:18px; flex-wrap:wrap;">
    <h3 style="margin:0; color:#111827; font-size:1.8rem;">שאלות ותשובות נפוצות</h3>
    <div style="font-size:14px; color:#7a1428; font-weight:700; background:#fff7e8; border:1px solid #f0dfb7; padding:8px 12px; border-radius:999px;">מתאים להורים, אורחים וילדים</div>
  </div>

  <div style="display:grid; gap:16px;">
    <div style="border:1px solid #efe6d3; border-radius:16px; padding:18px 20px; background:#fffaf3;">
      <h4 style="margin:0 0 8px; color:#7a1428; font-size:1.08rem;">מתי מדליקים את נרות החנוכה?</h4>
      <p style="margin:0; color:#4b5563; line-height:1.9;">מקובל להדליק עם רדת הלילה, בזמן שנועד לפרסום הנס. מי שנמצא בבית בשעה מאוחרת יותר, ידליק כאשר כל בני הבית יכולים להשתתף ולראות את ההדלקה.</p>
    </div>

    <div style="border:1px solid #efe6d3; border-radius:16px; padding:18px 20px; background:#fff;">
      <h4 style="margin:0 0 8px; color:#7a1428; font-size:1.08rem;">כמה נרות מדליקים בכל ערב?</h4>
      <p style="margin:0; color:#4b5563; line-height:1.9;">בלילה הראשון מדליקים נר אחד, ובכל ערב מוסיפים עוד נר. את הנר החדש מניחים ומדליקים לפי הסדר המקובל, כשהרעיון המרכזי הוא להוסיף אור מיום ליום.</p>
    </div>

    <div style="border:1px solid #efe6d3; border-radius:16px; padding:18px 20px; background:#fffaf3;">
      <h4 style="margin:0 0 8px; color:#7a1428; font-size:1.08rem;">איפה נכון להניח את החנוכייה?</h4>
      <p style="margin:0; color:#4b5563; line-height:1.9;">במקום שרואים בו את הנרות היטב. המטרה היא לפרסם את הנס, לכן בוחרים מקום מכובד, יציב ובטוח, שיהיה גלוי לבני הבית ולאורחים.</p>
    </div>

    <div style="border:1px solid #efe6d3; border-radius:16px; padding:18px 20px; background:#fff;">
      <h4 style="margin:0 0 8px; color:#7a1428; font-size:1.08rem;">מה מספרים לילדים על החג?</h4>
      <p style="margin:0; color:#4b5563; line-height:1.9;">אפשר לספר על אומץ, על נאמנות למסורת, על נס פך השמן ועל הכוח של מעט אור לדחות הרבה חושך. כדאי לשלב סיפור קצר, שיר ושאלה אישית שכל ילד יוכל לענות עליה.</p>
    </div>

    <div style="border:1px solid #efe6d3; border-radius:16px; padding:18px 20px; background:#fffaf3;">
      <h4 style="margin:0 0 8px; color:#7a1428; font-size:1.08rem;">איך יוצרים אווירת חנוכה נעימה בבית?</h4>
      <p style="margin:0; color:#4b5563; line-height:1.9;">מכינים את מקום ההדלקה מראש, משמיעים מוזיקה מתאימה, מסדרים שולחן קטן עם סופגניות או לביבות, ונותנים לכל אחד תפקיד קטן: ברכה, שיר, סיפור או חלוקת נרות.</p>
    </div>
  </div>
</section>

<blockquote style="margin:0 0 26px; background:linear-gradient(135deg,#7a1428 0%,#9e1f35 100%); color:#fff; border-radius:22px; padding:28px; box-shadow:0 14px 34px rgba(122,20,40,0.18); position:relative; overflow:hidden;">
  <div style="position:absolute; inset:auto auto -20px -20px; width:120px; height:120px; border-radius:50%; background:rgba(255,255,255,0.08);"></div>
  <div style="position:absolute; inset:20px 20px auto auto; font-size:54px; opacity:0.14; line-height:1;">”</div>
  <p style="margin:0 0 10px; font-size:1.25rem; line-height:1.9; font-weight:600; position:relative; z-index:1;">חנוכה מזכיר לנו שלא רק שומרים על האור, אלא גם מוסיפים אותו. בכל יום עוד נר, עוד מעשה טוב, עוד הזדמנות להפיץ חום ואמונה.</p>
  <div style="font-size:14px; opacity:0.9; position:relative; z-index:1;">רעיון מרכזי לעיצוב כתבה בעלת נוכחות וחוויה חזותית</div>
</blockquote>

<section style="display:grid; grid-template-columns: 1.1fr 0.9fr; gap:20px; margin-bottom:26px;">
  <div style="background:#fff; border:1px solid #ece7da; border-radius:18px; padding:24px;">
    <h3 style="margin:0 0 14px; color:#111827; font-size:1.45rem;">נקודות קצרות שכדאי לזכור</h3>
    <ul style="margin:0; padding:0 18px 0 0; color:#4b5563; line-height:2; font-size:15px;">
      <li>החג נמשך שמונה ימים, ובכל יום מוסיפים אור.</li>
      <li>הדלקת הנרות היא זמן משפחתי עם נוכחות ואווירה.</li>
      <li>המסר המרכזי של החג הוא התמדה, זהות ושמחה.</li>
      <li>כתבה טובה משלבת בין מידע ברור, היררכיה חזותית וחוויית קריאה נעימה.</li>
    </ul>
  </div>
  <div style="background:linear-gradient(180deg,#fffaf0 0%,#fff 100%); border:1px solid #f0dfb7; border-radius:18px; padding:24px;">
    <h3 style="margin:0 0 14px; color:#7a1428; font-size:1.45rem;">רעיון לבלוק צדדי</h3>
    <p style="margin:0 0 12px; color:#4b5563; line-height:1.9;">אם תרצו לבדוק עוד וריאציות עיצוב, אפשר בהמשך להוסיף גם:</p>
    <div style="display:flex; flex-wrap:wrap; gap:10px;">
      <span style="background:#fff; border:1px solid #ead7ab; border-radius:999px; padding:8px 12px; font-size:14px; color:#7a1428; font-weight:700;">גלריית תמונות</span>
      <span style="background:#fff; border:1px solid #ead7ab; border-radius:999px; padding:8px 12px; font-size:14px; color:#7a1428; font-weight:700;">טבלת זמנים</span>
      <span style="background:#fff; border:1px solid #ead7ab; border-radius:999px; padding:8px 12px; font-size:14px; color:#7a1428; font-weight:700;">כרטיסי שאלות</span>
      <span style="background:#fff; border:1px solid #ead7ab; border-radius:999px; padding:8px 12px; font-size:14px; color:#7a1428; font-weight:700;">קריאה לפעולה</span>
    </div>
  </div>
</section>

<section style="background:#111827; color:#f9fafb; border-radius:22px; padding:28px; box-shadow:0 14px 34px rgba(17,24,39,0.14);">
  <div style="display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap; align-items:center; margin-bottom:10px;">
    <h3 style="margin:0; font-size:1.7rem;">סיכום קצר</h3>
    <div style="font-size:13px; color:#fbbf24; font-weight:700;">דוגמת תוכן עשירה לבדיקת פריסה באתר</div>
  </div>
  <p style="margin:0; color:#e5e7eb; line-height:2; font-size:1rem;">חנוכה הוא הזדמנות נהדרת לבנות עמוד תוכן שנראה מלא, אלגנטי ומעוצב היטב. הכתבה הזו משלבת כותרות, אזורי מידע, שאלות ותשובות, ציטוט, אייקונים, איור מרכזי ובלוקים עם צבעוניות חמה, כדי שתוכלו להעריך בקלות איך המערכת מציגה תוכן אמיתי עם אופי.</p>
</section>
`;

await pgPool.query('UPDATE articles SET content = $1 WHERE id = $2', [content, 340]);
console.log('Updated article 340 content with UTF-8 Hebrew text');
await pgPool.end();
