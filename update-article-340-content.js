import pgPool from './src/lib/db.pg.js';

const content = `
<style>
  .hanukkah-article {
    display: grid;
    gap: 26px;
  }

  .hanukkah-hero {
    position: relative;
    overflow: hidden;
    border: 1px solid #f0dfb7;
    border-radius: 24px;
    padding: 32px;
    background:
      radial-gradient(circle at top left, rgba(255, 219, 128, 0.38), transparent 32%),
      radial-gradient(circle at bottom right, rgba(122, 20, 40, 0.08), transparent 30%),
      linear-gradient(135deg, #fffaf0 0%, #fff 45%, #fff8ea 100%);
    box-shadow: 0 18px 40px rgba(122, 20, 40, 0.08);
  }

  .hanukkah-pill {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 9px 16px;
    border-radius: 999px;
    background: #8b1830;
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 18px;
  }

  .hanukkah-title {
    margin: 0 0 14px;
    color: #111827;
    font-size: clamp(2.3rem, 6vw, 4.6rem);
    line-height: 1.06;
    letter-spacing: -0.03em;
  }

  .hanukkah-intro {
    margin: 0;
    max-width: 900px;
    color: #4b5563;
    font-size: 1.14rem;
    line-height: 1.95;
  }

  .hanukkah-hero-grid {
    display: grid;
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.15fr);
    gap: 22px;
    margin-top: 26px;
    align-items: stretch;
  }

  .hanukkah-card,
  .hanukkah-highlight,
  .hanukkah-panel,
  .hanukkah-qa,
  .hanukkah-summary {
    border-radius: 22px;
    border: 1px solid #ece2c7;
    background: #fff;
    box-shadow: 0 10px 26px rgba(0, 0, 0, 0.045);
  }

  .hanukkah-highlight {
    background: linear-gradient(180deg, #8b1830 0%, #7a1428 100%);
    color: #fff;
    border-color: transparent;
    padding: 22px;
  }

  .hanukkah-highlight-kicker {
    margin: 0 0 10px;
    opacity: 0.86;
    font-size: 13px;
  }

  .hanukkah-highlight-text {
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.95;
    font-weight: 700;
  }

  .hanukkah-list-box {
    padding: 22px;
  }

  .hanukkah-list-box h3,
  .hanukkah-visual h3,
  .hanukkah-panel h3,
  .hanukkah-qa h3,
  .hanukkah-summary h3 {
    margin: 0 0 14px;
    color: #111827;
    font-size: 1.45rem;
  }

  .hanukkah-list-box ul,
  .hanukkah-panel ul {
    margin: 0;
    padding: 0 18px 0 0;
    color: #4b5563;
    line-height: 2;
  }

  .hanukkah-left-col,
  .hanukkah-right-col {
    display: grid;
    gap: 18px;
  }

  .hanukkah-visual {
    padding: 20px;
  }

  .hanukkah-visual-frame {
    padding: 18px;
    border-radius: 20px;
    border: 1px solid #f0dfb7;
    background: linear-gradient(180deg, #fffdf4 0%, #fff6df 100%);
  }

  .hanukkah-visual svg {
    display: block;
    width: 100%;
    height: auto;
    border-radius: 16px;
    background: linear-gradient(180deg, #fff7db 0%, #fff1c2 100%);
  }

  .hanukkah-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 16px;
  }

  .hanukkah-stat {
    min-width: 0;
    padding: 14px 12px;
    border-radius: 18px;
    border: 1px solid #f0dfb7;
    background: #fffaf0;
    text-align: center;
  }

  .hanukkah-stat-label {
    margin-bottom: 8px;
    color: #8b1830;
    font-size: 0.96rem;
    line-height: 1.5;
    font-weight: 800;
  }

  .hanukkah-stat-value {
    color: #4b5563;
    font-size: 0.98rem;
    line-height: 1.85;
  }

  .hanukkah-two-col {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }

  .hanukkah-panel {
    padding: 24px;
  }

  .hanukkah-panel p {
    margin: 0 0 12px;
    color: #4b5563;
    line-height: 1.95;
  }

  .hanukkah-panel p:last-child {
    margin-bottom: 0;
  }

  .hanukkah-steps {
    display: grid;
    gap: 12px;
  }

  .hanukkah-step {
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr);
    gap: 12px;
    align-items: start;
  }

  .hanukkah-step-index {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #8b1830;
    color: #fff;
    font-weight: 800;
  }

  .hanukkah-step-text {
    color: #4b5563;
    line-height: 1.85;
  }

  .hanukkah-qa {
    padding: 28px;
  }

  .hanukkah-qa-head {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
  }

  .hanukkah-qa-pill {
    font-size: 14px;
    color: #8b1830;
    font-weight: 700;
    background: #fff7e8;
    border: 1px solid #f0dfb7;
    padding: 8px 12px;
    border-radius: 999px;
  }

  .hanukkah-qa-list {
    display: grid;
    gap: 16px;
  }

  .hanukkah-qa-item {
    padding: 18px 20px;
    border-radius: 18px;
    border: 1px solid #efe6d3;
    background: #fffaf3;
  }

  .hanukkah-qa-item:nth-child(even) {
    background: #fff;
  }

  .hanukkah-qa-item h4 {
    margin: 0 0 8px;
    color: #7a1428;
    font-size: 1.08rem;
  }

  .hanukkah-qa-item p {
    margin: 0;
    color: #4b5563;
    line-height: 1.9;
  }

  .hanukkah-quote {
    position: relative;
    overflow: hidden;
    padding: 28px;
    border-radius: 24px;
    background: linear-gradient(135deg, #7a1428 0%, #9e1f35 100%);
    color: #fff;
    box-shadow: 0 14px 34px rgba(122, 20, 40, 0.18);
  }

  .hanukkah-quote::before {
    content: "";
    position: absolute;
    bottom: -22px;
    left: -20px;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
  }

  .hanukkah-quote-mark {
    position: absolute;
    top: 18px;
    right: 18px;
    font-size: 54px;
    line-height: 1;
    opacity: 0.14;
  }

  .hanukkah-quote p {
    position: relative;
    z-index: 1;
    margin: 0 0 10px;
    font-size: 1.22rem;
    line-height: 1.9;
    font-weight: 700;
  }

  .hanukkah-quote-footer {
    position: relative;
    z-index: 1;
    font-size: 14px;
    opacity: 0.92;
  }

  .hanukkah-summary {
    padding: 28px;
    background: #111827;
    border-color: #111827;
    color: #f9fafb;
  }

  .hanukkah-summary-head {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .hanukkah-summary h3 {
    margin: 0;
    color: #f9fafb;
  }

  .hanukkah-summary-kicker {
    font-size: 13px;
    color: #fbbf24;
    font-weight: 700;
  }

  .hanukkah-summary p {
    margin: 0;
    color: #e5e7eb;
    line-height: 2;
  }

  @media (max-width: 960px) {
    .hanukkah-hero,
    .hanukkah-qa,
    .hanukkah-summary,
    .hanukkah-panel,
    .hanukkah-list-box,
    .hanukkah-highlight,
    .hanukkah-visual {
      padding: 22px;
    }

    .hanukkah-hero-grid,
    .hanukkah-two-col {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 720px) {
    .hanukkah-hero {
      padding: 18px;
      border-radius: 20px;
    }

    .hanukkah-intro {
      font-size: 1rem;
    }

    .hanukkah-stats {
      grid-template-columns: 1fr;
    }

    .hanukkah-qa,
    .hanukkah-summary,
    .hanukkah-panel,
    .hanukkah-list-box,
    .hanukkah-highlight,
    .hanukkah-visual,
    .hanukkah-quote {
      padding: 18px;
      border-radius: 18px;
    }

    .hanukkah-qa-item {
      padding: 16px;
    }

    .hanukkah-step {
      grid-template-columns: 32px minmax(0, 1fr);
      gap: 10px;
    }

    .hanukkah-step-index {
      width: 32px;
      height: 32px;
      font-size: 14px;
    }

    .hanukkah-title {
      font-size: 2.55rem;
    }
  }
</style>

<div class="hanukkah-article">
  <section class="hanukkah-hero">
    <div class="hanukkah-pill">חנוכה • מדריך מהיר למשפחה ולבית</div>
    <h2 class="hanukkah-title">חנוכה - שאלות ותשובות</h2>
    <p class="hanukkah-intro">הדלקת נרות, זמני הברכות, סדר ההדלקה, מקום החנוכייה ומשמעות החג בחיי המשפחה. ריכזנו כאן תשובות ברורות ונעימות לקריאה, כדי שתוכלו לראות איך כתבה עשירה נראית באתר גם עם תוכן מעוצב.</p>

    <div class="hanukkah-hero-grid">
      <div class="hanukkah-left-col">
        <div class="hanukkah-highlight">
          <div class="hanukkah-highlight-kicker">למה הכתבה הזו טובה לבדיקת עיצוב?</div>
          <p class="hanukkah-highlight-text">יש כאן כותרת חזקה, אזור פתיחה מעוצב, בלוקים של מידע, שאלות ותשובות, ציטוט, רשימות, הדגשות וקריאה לפעולה.</p>
        </div>

        <div class="hanukkah-card hanukkah-list-box">
          <h3>מה בכתבה?</h3>
          <ul>
            <li>משמעות קצרה וברורה של חג החנוכה</li>
            <li>שאלות נפוצות למשפחה, אורחים וילדים</li>
            <li>טיפים להגשה יפה של תוכן באתר</li>
            <li>אזורים שנראים טוב גם במסך רחב וגם בנייד</li>
          </ul>
        </div>
      </div>

      <div class="hanukkah-right-col">
        <div class="hanukkah-card hanukkah-visual">
          <div class="hanukkah-visual-frame">
            <svg viewBox="0 0 640 360" role="img" aria-label="איור חנוכייה">
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
                <g transform="translate(10,0)"><rect x="0" y="126" width="20" height="66" rx="10" fill="url(#candle)" stroke="#e6d9aa" /><rect x="-8" y="118" width="36" height="12" rx="6" fill="#7a1428" /><path d="M10 117 C1 105, 2 91, 10 80 C18 91, 19 105, 10 117Z" fill="#ffb703"/><path d="M10 109 C5 101, 6 91, 10 86 C14 91, 15 101, 10 109Z" fill="#ffe082"/></g>
                <g transform="translate(62,0)"><rect x="0" y="126" width="20" height="66" rx="10" fill="url(#candle)" stroke="#e6d9aa" /><rect x="-8" y="118" width="36" height="12" rx="6" fill="#7a1428" /><path d="M10 117 C1 105, 2 91, 10 80 C18 91, 19 105, 10 117Z" fill="#ffb703"/><path d="M10 109 C5 101, 6 91, 10 86 C14 91, 15 101, 10 109Z" fill="#ffe082"/></g>
                <g transform="translate(114,0)"><rect x="0" y="126" width="20" height="66" rx="10" fill="url(#candle)" stroke="#e6d9aa" /><rect x="-8" y="118" width="36" height="12" rx="6" fill="#7a1428" /><path d="M10 117 C1 105, 2 91, 10 80 C18 91, 19 105, 10 117Z" fill="#ffb703"/><path d="M10 109 C5 101, 6 91, 10 86 C14 91, 15 101, 10 109Z" fill="#ffe082"/></g>
                <g transform="translate(166,0)"><rect x="0" y="126" width="20" height="66" rx="10" fill="url(#candle)" stroke="#e6d9aa" /><rect x="-8" y="118" width="36" height="12" rx="6" fill="#7a1428" /><path d="M10 117 C1 105, 2 91, 10 80 C18 91, 19 105, 10 117Z" fill="#ffb703"/><path d="M10 109 C5 101, 6 91, 10 86 C14 91, 15 101, 10 109Z" fill="#ffe082"/></g>
                <g transform="translate(226,0)"><rect x="0" y="88" width="32" height="104" rx="12" fill="url(#candle)" stroke="#e6d9aa"/><rect x="-10" y="80" width="52" height="14" rx="7" fill="#7a1428" /><path d="M16 79 C2 59, 4 34, 16 16 C28 34, 30 59, 16 79Z" fill="#ff8c00"/><path d="M16 68 C9 55, 10 39, 16 29 C22 39, 23 55, 16 68Z" fill="#ffe082"/></g>
                <g transform="translate(270,0)"><rect x="0" y="126" width="20" height="66" rx="10" fill="url(#candle)" stroke="#e6d9aa" /><rect x="-8" y="118" width="36" height="12" rx="6" fill="#7a1428" /><path d="M10 117 C1 105, 2 91, 10 80 C18 91, 19 105, 10 117Z" fill="#ffb703"/><path d="M10 109 C5 101, 6 91, 10 86 C14 91, 15 101, 10 109Z" fill="#ffe082"/></g>
                <g transform="translate(322,0)"><rect x="0" y="126" width="20" height="66" rx="10" fill="url(#candle)" stroke="#e6d9aa" /><rect x="-8" y="118" width="36" height="12" rx="6" fill="#7a1428" /><path d="M10 117 C1 105, 2 91, 10 80 C18 91, 19 105, 10 117Z" fill="#ffb703"/><path d="M10 109 C5 101, 6 91, 10 86 C14 91, 15 101, 10 109Z" fill="#ffe082"/></g>
                <g transform="translate(374,0)"><rect x="0" y="126" width="20" height="66" rx="10" fill="url(#candle)" stroke="#e6d9aa" /><rect x="-8" y="118" width="36" height="12" rx="6" fill="#7a1428" /><path d="M10 117 C1 105, 2 91, 10 80 C18 91, 19 105, 10 117Z" fill="#ffb703"/><path d="M10 109 C5 101, 6 91, 10 86 C14 91, 15 101, 10 109Z" fill="#ffe082"/></g>
              </g>
            </svg>

            <div class="hanukkah-stats">
              <div class="hanukkah-stat">
                <div class="hanukkah-stat-label">זמן ההדלקה</div>
                <div class="hanukkah-stat-value">משקיעת החמה ועד שתכלה רגל מן השוק</div>
              </div>
              <div class="hanukkah-stat">
                <div class="hanukkah-stat-label">מספר הנרות</div>
                <div class="hanukkah-stat-value">מוסיפים בכל לילה נר אחד</div>
              </div>
              <div class="hanukkah-stat">
                <div class="hanukkah-stat-label">מיקום החנוכייה</div>
                <div class="hanukkah-stat-value">במקום גלוי לפרסום הנס</div>
              </div>
            </div>
          </div>
        </div>

        <div class="hanukkah-card hanukkah-list-box">
          <h3>רעיון מרכזי</h3>
          <p class="hanukkah-intro" style="font-size:1rem; max-width:none;">החנוכה הוא חג של אור בבית ובחוץ גם יחד: אור של זהות, של שמחה, של פרסום הנס ושל היכולת להוסיף מעט אור בכל יום.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="hanukkah-two-col">
    <div class="hanukkah-panel">
      <h3>מה מיוחד בחנוכה?</h3>
      <p>חנוכה מציין את ניצחון הרוח היהודית ואת חידוש עבודת המקדש. לצד הניצחון הצבאי, עיקר הדגש בחג הוא על האור: להדליק, לפרסם, לזכור ולהעביר הלאה מסר של תקווה והתמדה.</p>
      <p>דווקא בעונת החורף, כשמוקדם להחשיך, החג מזכיר לנו שלא מחכים לאור מבחוץ בלבד. אנחנו מוזמנים להוסיף אותו בעצמנו.</p>
    </div>

    <div class="hanukkah-panel" style="background:linear-gradient(135deg,#fff7e8 0%,#fff 100%); border-color:#f0dfb7;">
      <h3 style="color:#7a1428;">איך לשלב את החג בבית?</h3>
      <div class="hanukkah-steps">
        <div class="hanukkah-step"><div class="hanukkah-step-index">1</div><div class="hanukkah-step-text">לקבוע מקום מכובד לחנוכייה שנראה היטב לבני הבית ולאורחים.</div></div>
        <div class="hanukkah-step"><div class="hanukkah-step-index">2</div><div class="hanukkah-step-text">לשתף את הילדים בהדלקה, בשירים, בשאלות ובסיפור הנס.</div></div>
        <div class="hanukkah-step"><div class="hanukkah-step-index">3</div><div class="hanukkah-step-text">להפוך כל ערב להזדמנות קטנה לשיחה על ערכים, זהות והוספת אור בעולם.</div></div>
      </div>
    </div>
  </section>

  <section class="hanukkah-qa">
    <div class="hanukkah-qa-head">
      <h3>שאלות ותשובות נפוצות</h3>
      <div class="hanukkah-qa-pill">מתאים להורים, אורחים וילדים</div>
    </div>

    <div class="hanukkah-qa-list">
      <div class="hanukkah-qa-item">
        <h4>מתי מדליקים את נרות החנוכה?</h4>
        <p>מקובל להדליק עם רדת הלילה, בזמן שנועד לפרסום הנס. מי שנמצא בבית בשעה מאוחרת יותר, ידליק כאשר כל בני הבית יכולים להשתתף ולראות את ההדלקה.</p>
      </div>
      <div class="hanukkah-qa-item">
        <h4>כמה נרות מדליקים בכל ערב?</h4>
        <p>בלילה הראשון מדליקים נר אחד, ובכל ערב מוסיפים עוד נר. את הנר החדש מניחים ומדליקים לפי הסדר המקובל, כשהרעיון המרכזי הוא להוסיף אור מיום ליום.</p>
      </div>
      <div class="hanukkah-qa-item">
        <h4>איפה נכון להניח את החנוכייה?</h4>
        <p>במקום שרואים בו את הנרות היטב. המטרה היא לפרסם את הנס, לכן בוחרים מקום מכובד, יציב ובטוח, שיהיה גלוי לבני הבית ולאורחים.</p>
      </div>
      <div class="hanukkah-qa-item">
        <h4>מה מספרים לילדים על החג?</h4>
        <p>אפשר לספר על אומץ, על נאמנות למסורת, על נס פך השמן ועל הכוח של מעט אור לדחות הרבה חושך. כדאי לשלב סיפור קצר, שיר ושאלה אישית שכל ילד יוכל לענות עליה.</p>
      </div>
      <div class="hanukkah-qa-item">
        <h4>איך יוצרים אווירת חנוכה נעימה בבית?</h4>
        <p>מכינים את מקום ההדלקה מראש, משמיעים מוזיקה מתאימה, מסדרים שולחן קטן עם סופגניות או לביבות, ונותנים לכל אחד תפקיד קטן: ברכה, שיר, סיפור או חלוקת נרות.</p>
      </div>
    </div>
  </section>

  <blockquote class="hanukkah-quote">
    <div class="hanukkah-quote-mark">”</div>
    <p>חנוכה מזכיר לנו שלא רק שומרים על האור, אלא גם מוסיפים אותו. בכל יום עוד נר, עוד מעשה טוב, עוד הזדמנות להפיץ חום ואמונה.</p>
    <div class="hanukkah-quote-footer">רעיון מרכזי לעיצוב כתבה בעלת נוכחות וחוויה חזותית</div>
  </blockquote>

  <section class="hanukkah-two-col">
    <div class="hanukkah-panel">
      <h3>נקודות קצרות שכדאי לזכור</h3>
      <ul>
        <li>החג נמשך שמונה ימים, ובכל יום מוסיפים אור.</li>
        <li>הדלקת הנרות היא זמן משפחתי עם נוכחות ואווירה.</li>
        <li>המסר המרכזי של החג הוא התמדה, זהות ושמחה.</li>
        <li>כתבה טובה משלבת בין מידע ברור, היררכיה חזותית וחוויית קריאה נעימה.</li>
      </ul>
    </div>

    <div class="hanukkah-panel" style="background:linear-gradient(180deg,#fffaf0 0%,#fff 100%); border-color:#f0dfb7;">
      <h3 style="color:#7a1428;">רעיון לבלוק צדדי</h3>
      <p>אם תרצו לבדוק עוד וריאציות עיצוב, אפשר בהמשך להוסיף גם:</p>
      <div style="display:flex; flex-wrap:wrap; gap:10px;">
        <span style="background:#fff; border:1px solid #ead7ab; border-radius:999px; padding:8px 12px; font-size:14px; color:#7a1428; font-weight:700;">גלריית תמונות</span>
        <span style="background:#fff; border:1px solid #ead7ab; border-radius:999px; padding:8px 12px; font-size:14px; color:#7a1428; font-weight:700;">טבלת זמנים</span>
        <span style="background:#fff; border:1px solid #ead7ab; border-radius:999px; padding:8px 12px; font-size:14px; color:#7a1428; font-weight:700;">כרטיסי שאלות</span>
        <span style="background:#fff; border:1px solid #ead7ab; border-radius:999px; padding:8px 12px; font-size:14px; color:#7a1428; font-weight:700;">קריאה לפעולה</span>
      </div>
    </div>
  </section>

  <section class="hanukkah-summary">
    <div class="hanukkah-summary-head">
      <h3>סיכום קצר</h3>
      <div class="hanukkah-summary-kicker">דוגמת תוכן עשירה לבדיקת פריסה באתר</div>
    </div>
    <p>חנוכה הוא הזדמנות נהדרת לבנות עמוד תוכן שנראה מלא, אלגנטי ומעוצב היטב. הכתבה הזו משלבת כותרות, אזורי מידע, שאלות ותשובות, ציטוט, איור מרכזי ובלוקים עם צבעוניות חמה, כדי שתוכלו להעריך בקלות איך המערכת מציגה תוכן אמיתי עם אופי.</p>
  </section>
</div>
`;

await pgPool.query('UPDATE articles SET content = $1 WHERE id = $2', [content, 340]);
console.log('Updated article 340 content with responsive layout');
await pgPool.end();
