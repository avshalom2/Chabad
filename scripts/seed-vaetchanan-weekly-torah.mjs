import { getPool } from '../src/lib/db.js';

const article = {
  title: 'פרשת ואתחנן: לשמוע את הקול שבתוך השגרה',
  slug: 'parashat-vaetchanan-listening-with-the-heart',
  description: 'משה רבנו מלמד אותנו שתפילה אמיתית, אהבת ה׳ וחינוך יהודי מתחילים ביכולת לעצור, להקשיב ולהכניס קדושה אל תוך חיי היום־יום.',
  content: `
    <div class="article-content-box" style="--article-box-width:100%;--article-box-margin:0 0 30px;--article-box-padding:38px 30px;--article-box-radius:24px;--article-box-bg:linear-gradient(135deg,#5d1022 0%,#8b263d 58%,#b77942 100%);--article-box-color:#fff3e8;--article-box-title-color:#ffffff;--article-box-title-size:2rem;--article-box-shadow:0 18px 45px rgba(93,16,34,.2);">
      <p><strong>לשמוע את הקול שבתוך השגרה</strong></p>
      <p><strong>דבר תורה שבועי • פרשת ואתחנן</strong></p>
      <p>יש רגעים שבהם הלב מבקש דבר גדול. פרשת ואתחנן מלמדת שהדרך אליו מתחילה דווקא בתפילה, בהקשבה ובצעד קטן שחוזר בכל יום.</p>
    </div>

    <p style="font-size:1.18rem;line-height:1.95;color:#3f3234;">פרשת ואתחנן היא מן הפרשות המרגשות והיסודיות בתורה. משה רבנו ממשיך את נאומו לעם ישראל, מספר על תפילתו להיכנס לארץ, חוזר על עשרת הדיברות ומוסר לנו את הפסוקים המלווים את העם היהודי בכל דור: <strong>״שמע ישראל ה׳ אלוקינו ה׳ אחד״</strong>.</p>

    <h2>״ואתחנן״ — תפילה שאינה מוותרת</h2>
    <p>משה רבנו מתאר כיצד התחנן לפני הקדוש ברוך הוא שיזכה להיכנס לארץ ישראל. הוא יודע כמה גדולה מעלת הארץ, וכמה הוא משתוקק לקיים את המצוות התלויות בה. ואף על פי שבקשתו אינה מתקבלת כפי שרצה, תפילתו איננה לחינם.</p>
    <blockquote style="font-size:1.12rem;line-height:1.9;">״ואתחנן אל ה׳ בעת ההיא לאמור״ — לפעמים עצם הפנייה אל ה׳ משנה אותנו, גם כשהתשובה אינה זו שציפינו לקבל.</blockquote>
    <p>כולנו מכירים תפילות שעדיין לא ראינו את פירותיהן: על בריאות, שלום בית, פרנסה, ילדים או הצלחה. משה מלמד אותנו שתפילה אינה רק דרך להשיג תוצאה. היא רגע של קִרבה; רגע שבו האדם מניח את דאגותיו לפני מי שמנהיג את העולם. שום תפילה כנה אינה הולכת לאיבוד.</p>

      <div class="article-content-box" style="--article-box-width:210px;--article-box-margin:7px;--article-box-padding:22px 18px;--article-box-bg:#fff9f2;--article-box-title-color:#7a1428;">
        <p><strong>תפילה</strong></p><p>לדבר עם ה׳ בכנות, גם כשעדיין אין תשובה.</p>
      </div>
      <div class="article-content-box" style="--article-box-width:210px;--article-box-margin:7px;--article-box-padding:22px 18px;--article-box-bg:#fff9f2;--article-box-title-color:#7a1428;">
        <p><strong>הקשבה</strong></p><p>לעצור את הרעש ולשמוע מה הנשמה מבקשת.</p>
      </div>
      <div class="article-content-box" style="--article-box-width:210px;--article-box-margin:7px;--article-box-padding:22px 18px;--article-box-bg:#fff9f2;--article-box-title-color:#7a1428;">
        <p><strong>מעשה</strong></p><p>להפוך התעוררות טובה לצעד יומיומי קטן.</p>
      </div>

    <h2>שמע ישראל — לא רק לשמוע באוזניים</h2>
    <p>״שמע״ פירושו להקשיב, להבין ולהפנים. האמונה באחדות ה׳ אינה נשארת רעיון מופשט; היא מאירה את הבית, העבודה, היחסים עם הזולת וההחלטות הקטנות. אם ה׳ אחד, אין בחיים אזור מנותק מן הקדושה. גם יום רגיל יכול להפוך ליום של שליחות.</p>
    <p>מיד לאחר ״שמע ישראל״ בא הציווי <strong>״ואהבת את ה׳ אלוקיך״</strong>. התורה מבקשת מאיתנו לא רק לדעת על ה׳, אלא לפתח קשר חי של אהבה. כיצד מטפחים אהבה? כפי שמטפחים כל קשר: מקדישים זמן, לומדים, מדברים וזוכרים את הטוב.</p>

    <h2>״ושיננתם לבניך״ — חינוך שחי בבית</h2>
    <p>הפרשה אינה מסתפקת באמונה שבלב. היא מעבירה אותה לדור הבא: ״ושיננתם לבניך ודיברת בם״. חינוך יהודי מתרחש בשיחה סביב השולחן, בברכה שאומרים בכוונה, בנר שבת שמדליקים בזמן ובדרך שבה ההורים מתייחסים זה לזה.</p>
    <p>ילד שומע את מה שאומרים לו, אבל הוא קולט בעיקר את מה שחיים לידו. כשמצווה נעשית בשמחה וכשלימוד התורה מקבל מקום טבעי בבית, המסר נשאר הרבה מעבר למילים.</p>

    <div class="article-content-box" style="--article-box-width:100%;--article-box-margin:30px 0;--article-box-padding:24px 26px;--article-box-radius:16px;--article-box-bg:#f7eee7;--article-box-title-color:#6e1729;--article-box-align:right;--article-box-shadow:none;--article-box-border:0 solid transparent;border-right:5px solid #9b5a35;">
      <p><strong>נקודה לקחת לשבת</strong></p>
      <p>החיים הרוחניים אינם בנויים רק מרגעים גדולים. הם נבנים מן המילים שאנו חוזרים עליהן, מן האהבה שאנו מביעים ומן הקדושה שאנו מכניסים אל הפעולות הפשוטות.</p>
    </div>

    <h2>שלושה צעדים קטנים לשבוע הקרוב</h2>
    <ol>
      <li><strong>דקה אחת של תפילה אישית:</strong> לבחור זמן שקט ולומר לה׳ במילים פשוטות מה יושב על הלב.</li>
      <li><strong>קריאת שמע בכוונה:</strong> לעצור לרגע לפני אמירת הפסוק הראשון ולחשוב שה׳ נמצא ומלווה אותנו בכל מקום.</li>
      <li><strong>רגע יהודי משפחתי:</strong> לשתף בשולחן השבת רעיון אחד מן הפרשה ולשאול כל אחד מה הוא לוקח ממנו לחייו.</li>
    </ol>

    <div class="article-content-box" style="--article-box-width:100%;--article-box-margin:34px 0 0;--article-box-padding:28px;--article-box-radius:20px;--article-box-bg:linear-gradient(180deg,#fffdf9,#fff7ef);--article-box-title-color:#7a1428;--article-box-title-size:1.25rem;--article-box-color:#5b4a4d;--article-box-shadow:none;">
      <p><strong>שבת שלום ומבורכת</strong></p>
      <p>שנזכה לשמוע, לאהוב, להתפלל — ולהאיר את הבית ואת העולם במעשים טובים.</p>
    </div>
  `,
};

const pool = await getPool();

try {
  await pool.query('BEGIN');
  const categoryResult = await pool.query(
    `SELECT id, name, slug FROM categories
     WHERE name = $1 OR slug = $2
     ORDER BY CASE WHEN name = $1 THEN 0 ELSE 1 END
     LIMIT 1`,
    ['דבר תורה שבועי / פרשת השבוע', 'דבר-תורה-שבועי-פרשת-השבוע']
  );
  let category = categoryResult.rows[0];
  if (!category) throw new Error('הקטגוריה "דבר תורה שבועי / פרשת השבוע" לא נמצאה');

  const updatedCategoryResult = await pool.query(
    `UPDATE categories
     SET slug = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, name, slug`,
    ['weekly-torah-portion', category.id]
  );
  category = updatedCategoryResult.rows[0];

  const result = await pool.query(
    `INSERT INTO articles
      (title, slug, excerpt, short_description, content, category_id, status,
       published_at, template, article_type, is_main_article)
     VALUES ($1, $2, $3, $3, $4, $5, 'published', NOW(), 'standard', 'article', FALSE)
     ON CONFLICT (slug) DO UPDATE SET
       title = EXCLUDED.title,
       excerpt = EXCLUDED.excerpt,
       short_description = EXCLUDED.short_description,
       content = EXCLUDED.content,
       category_id = EXCLUDED.category_id,
       status = 'published',
       published_at = COALESCE(articles.published_at, NOW()),
       template = 'standard',
       article_type = 'article',
       updated_at = NOW()
     RETURNING id, title, slug, category_id, status`,
    [article.title, article.slug, article.description, article.content, category.id]
  );

  await pool.query('COMMIT');
  console.log(JSON.stringify({ article: result.rows[0], category }, null, 2));
} catch (error) {
  await pool.query('ROLLBACK');
  throw error;
} finally {
  await pool.end?.();
}
