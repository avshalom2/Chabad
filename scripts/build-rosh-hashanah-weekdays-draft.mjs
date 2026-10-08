import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import * as p from './rosh-hashanah-prayers.mjs';

const directory = join(process.cwd(), 'public/uploads/holidays');
const pages = [];
const add = (title, subtitle, body, compact = false) => pages.push({ title, subtitle, body, compact });
const prayer = p.prayer;
const note = text => `<div class="note">${text}</div>`;
const drink = 'בסיום כל ברכות הקידוש יושבים ושותים מן הכוס מלוא לוגמיו — כמות שממלאת לחי אחת כשהיא מנופחת. אין מסתפקים בלגימה סמלית. טוב שגם המסובים יטעמו. ממשיכים לסעודה באותו מקום.';
const night = `<h2>קידוש לערב ראש השנה</h2><p>מכסים את שתי החלות, ממלאים כוס יין או מיץ ענבים כשר ומקדשים. בחב״ד עומדים בקידוש. המסובים מקשיבים לכל המילים ומתכוונים לצאת ידי חובה. שותים רק אחרי סיום שלוש הברכות.</p>
<h3>1. ברכת הגפן</h3>${prayer('סַבְרִי מָרָנָן. ' + p.wine)}
<h3>2. ברכת קדושת היום</h3>${prayer(p.nightKiddush())}
<h3>3. שהחיינו</h3>${prayer(p.shehecheyanu)}
<p class="small">שהחיינו: המקדש שכבר בירך אותה בהדלקת הנרות אינו חוזר עליה לעצמו. הוא יכול לברך כדי להוציא אדם אחר שעדיין חייב בה.</p><p>${drink}</p>`;

add('ראש השנה בימי חול', 'מדריך 1 • שני הלילות רגילים • טיוטה לבדיקה', `
<p class="lead">סדר ברור בבית: מדליקים נרות, מקדשים, אוכלים ומברכים.</p>
${note('מדריך זה מיועד לראש השנה בימים <strong>שני–שלישי או שלישי–רביעי</strong>. שני לילות החג הם לילות רגילים. כל ההוראות כאן מותאמות למסלול הזה.')}
<h2>ארבעת מועדי הקידוש</h2><table><thead><tr><th>מתי?</th><th>מה עושים?</th><th>העמוד</th></tr></thead><tbody>
<tr><td>הערב הראשון</td><td>נרות וקידוש הלילה, לפני סעודת החג</td><td>2</td></tr>
<tr><td>היום הראשון</td><td>קידוש לבוקר, לפני סעודת היום</td><td>3 או 4, לפי הנוסח</td></tr>
<tr><td>הערב השני</td><td>נרות, קידוש הלילה ופרי חדש</td><td>5, ונוסח הקידוש בעמ׳ 2</td></tr>
<tr><td>היום השני</td><td>שוב קידוש לבוקר, לפני סעודת היום</td><td>3 או 4, לפי הנוסח</td></tr></tbody></table>
<p><strong>לא מקדשים בכל ארוחה.</strong> הקידוש שלפני סעודת היום יכול להיות גם בצהריים. אחרי שקידשתם ואכלתם כדין, אין צורך בקידוש נוסף בארוחת צהריים או אחר הצהריים. בערב השני מתחיל יום חג חדש ולכן מקדשים שוב.</p>
<h2>רשימת הכנות</h2><ul><li>יין או מיץ ענבים כשר וכוס קידוש שלמה, המכילה לפחות רביעית. נוח לבחור כוס של 100 מ״ל ומעלה.</li><li>שתי חלות שלמות לכל סעודה, כיסוי לחלות, דבש וכלי נטילה עם מגבת.</li><li>תפוח מתוק, רימון וראש דג מבושל וכשר. הסימנים הם מנהג; לא חייבים להשיג את כולם כדי לקיים את החג.</li><li>נרות לשני הלילות ומקור אש בטוח שיישאר דולק עד הלילה השני.</li><li>פרי עץ חדש לעונה ללילה השני. במדריך נבחר פרי שאינו משבעת המינים, כדי להשתמש בברכה האחרונה המובאת בעמ׳ 5.</li><li>סעודות מוכנות והדפסה של המדריך. את זמני החג כותבים לפני כניסתו.</li></ul>
<p>שנה: __________ עיר: __________<br>הדלקת נרות בערב הראשון: __________<br>תחילת הערב השני — צאת הכוכבים: __________<br>יציאת החג: __________</p>
<p class="small">קידושי הבוקר מופיעים בשני חלקים נפרדים: נוסח חב״ד בעמ׳ 3 ונוסח ״אלה מועדי״ בעמ׳ 4. בוחרים את מנהג הבית; אין אומרים את שני הנוסחים ברצף. שאר הסדר במדריך לפי מנהג חב״ד. במקום ה׳ קוראים בעת הברכה אֲדֹנָי.</p>
<p><strong>בסוף המדריך:</strong> סדר הערב הראשון עם תמונות, ברכות והוראות אכילה — עמ׳ 9–10.</p>`);

add('הערב הראשון', 'הדלקת נרות וקידוש • נוסח חב״ד', `
<h2>הדלקת נרות</h2><p>מדליקים בזמן שרשמתם לפני החג. לפי מנהג חב״ד מדליקים, מכסים את העיניים, מברכים את שתי הברכות ומסירים את הידיים.</p>
${prayer(p.candles())}${prayer(p.shehecheyanu)}
${night}<p><strong>המשך הסעודה:</strong> נטילת ידיים, חלה בדבש והסימנים — הסדר המצולם בעמ׳ 9–10. בסיום מברכים ברכת המזון בעמ׳ 6–8.</p>`, true);

add('קידוש לבוקר ראש השנה', 'נוסח חב״ד • ליום הראשון וליום השני', `
<p class="lead">אומרים נוסח זה לפני סעודת היום, בכל אחד משני ימי החג.</p>
<h2>1. מכינים את הכוס</h2><p>מכסים את שתי החלות. ממלאים כוס יין או מיץ ענבים כשר. המקדש והמסובים מתכוונים לקיים את הקידוש.</p>
<h2>2. אומרים את הפסוקים</h2>${prayer(p.dayVerses)}
<h2>3. פונים למסובים ומברכים</h2>${prayer('סַבְרִי מָרָנָן.')}${prayer(p.wine)}
<p class="small">״סברי מרנן״ היא פנייה למסובים להקשיב לברכה. זו אינה ברכה נוספת.</p>
<h2>4. שותים ומתחילים לאכול</h2><p>${drink}</p><p>נוטלים ידיים ומברכים:</p>${prayer(p.hands)}<p>מגלים ואוחזים את שתי החלות השלמות ומברכים:</p>${prayer(p.bread)}<p>בוצעים, טובלים בדבש ואוכלים. ההוראות לנטילת הידיים ולאכילת החלה מפורטות גם בעמ׳ 9.</p>
${note('כאן מסתיים קידוש הבוקר. אין מוסיפים ״אשר בחר בנו״ ואין מברכים שהחיינו. אין ממשיכים לנוסח שבעמוד הבא — הוא מיועד למי שמנהג ביתו אחר.')}`);

const moadim = 'אֵלֶּה מוֹעֲדֵי ה׳ מִקְרָאֵי קֹדֶשׁ, אֲשֶׁר תִּקְרְאוּ אֹתָם בְּמוֹעֲדָם.';
const moshe = 'וַיְדַבֵּר מֹשֶׁה אֶת מֹעֲדֵי ה׳ אֶל בְּנֵי יִשְׂרָאֵל.';
add('קידוש לבוקר ראש השנה', 'נוסח ״אלה מועדי״ • ליום הראשון וליום השני', `
<p class="lead">זהו סדר הפסוקים שביקשת. משתמשים בו לפי מנהג הבית, במקום הנוסח שבעמ׳ 3.</p>
<h2>1. מכינים את הכוס</h2><p>מכסים את שתי החלות. ממלאים כוס יין או מיץ ענבים כשר. המקדש והמסובים מתכוונים לקיים את הקידוש.</p>
<h2>2. אומרים את הפסוקים</h2>${prayer(moadim)}${prayer(moshe)}
<h2>3. מברכים על היין</h2>${prayer(p.wine)}
<h2>4. שותים ומתחילים לאכול</h2><p>${drink}</p><p>נוטלים ידיים ומברכים:</p>${prayer(p.hands)}<p>מגלים ואוחזים את שתי החלות השלמות ומברכים:</p>${prayer(p.bread)}<p>בוצעים, טובלים בדבש ואוכלים. ההוראות לנטילת הידיים ולאכילת החלה מפורטות גם בעמ׳ 9.</p>
${note('כאן מסתיים קידוש הבוקר. אין מוסיפים ״אשר בחר בנו״ ואין מברכים שהחיינו. אין צורך בקידוש נוסף בארוחה נוספת באותו יום לאחר שכבר יצאתם בקידוש ואכלתם כדין.')}`);

add('הערב השני', 'נרות, קידוש ופרי חדש • אותו נוסח קידוש כמו בערב הראשון', `
<h2>1. ממתינים לצאת הכוכבים</h2><p>רק לאחר הזמן שרשמתם בעמ׳ 1 מתחילים להכין את סעודת הערב השני. אין להכין אותה במהלך היום הראשון. עורכים את השולחן ומניחים עליו את הפרי החדש.</p>
<h2>2. מדליקים נרות מאש קיימת</h2><p>מעבירים אש מהנר שהכנתם לפני החג. לא מציתים אש חדשה ולא מכבים את הגפרור לאחר ההעברה. מברכים:</p>${prayer(p.candles())}${prayer(p.shehecheyanu)}
<p>מכוונים בשהחיינו גם לפרי החדש שלפניכם. שהחיינו נאמרת על החג גם בהיעדר פרי חדש.</p>
<h2>3. מקדשים ושותים</h2><p>אומרים את קידוש הערב שבעמ׳ 2: הגפן, קדושת היום ושהחיינו, ומכוונים גם לפרי החדש. אין בקידוש זה הבדלה. לאחר כל הברכות שותים כשיעור המוסבר בעמ׳ 2.</p>
<h2>4. אוכלים את הפרי החדש</h2><p>לפי מנהג חב״ד אוכלים אותו אחרי הקידוש ולפני נטילת הידיים. מברכים על פרי העץ:</p>${prayer(p.fruit)}
<p>אין מברכים עליו שוב שהחיינו. לאחר אכילת כזית (כ־27 סמ״ק) בתוך כ־4 דקות מפרי שאינו משבעת המינים, מברכים לפני נטילת הידיים:</p>${prayer('בָּרוּךְ אַתָּה ה׳ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, בּוֹרֵא נְפָשׁוֹת רַבּוֹת וְחֶסְרוֹנָן, עַל כָּל מַה שֶּׁבָּרָאתָ לְהַחֲיוֹת בָּהֶם נֶפֶשׁ כָּל חָי. בָּרוּךְ חֵי הָעוֹלָמִים.')}
<p class="small">על פחות מכזית אין ברכה אחרונה. ברכת על העץ נדרשת לפרי משבעת המינים; לכן בחרנו ברשימת ההכנות פרי עץ אחר.</p>
<h2>5. סעודת החג</h2><p>נוטלים ידיים, מברכים המוציא על שתי חלות, טובלים בדבש ואוכלים. הנוסחים בעמ׳ 9. בסיום מברכים ברכת המזון בעמ׳ 6–8. סדר התפוח והסימנים בחב״ד שייך לערב הראשון.</p>`, true);

// Reuse the already prepared liturgy; remove all calendar branches and renumber it.
const original = await readFile(join(directory, 'rosh-hashanah-step-by-step.html'), 'utf8');
for (const number of [9, 10, 11]) {
  const section = original.match(new RegExp(`<section[^>]*id="page-${number}">([\\s\\S]*?)</section>`));
  assert.ok(section);
  let body = section[1].match(/<p class="subtitle">[\s\S]*?<\/p>([\s\S]*)<\/div><footer>/)[1];
  body = body.replace(/<h3>רק בשבת מוסיפים כאן רצה; כשאינו שבת ממשיכים ליעלה ויבוא:<\/h3><p class="prayer">[\s\S]*?<\/p>/, '');
  body = body.replace(/<h3>בשבת מוסיפים:<\/h3><p class="prayer">[\s\S]*?<\/p>/, '');
  body = body.replace(/<p class="small">סדר הקידוש והסימנים[\s\S]*?<\/p>/, '');
  add(number === 9 ? 'ברכת המזון — פתיחה' : number === 10 ? 'ברכת המזון — יעלה ויבוא' : 'ברכת המזון — סיום', number === 9 ? 'בסיום סעודת הלחם • קוראים ברצף את עמ׳ 6–8' : number === 10 ? 'ממשיכים מהעמוד הקודם • יעלה ויבוא בשני הלילות ובשני הימים' : 'ממשיכים מהעמוד הקודם עד סוף הברכה', body, true);
}

const photo = (column, row, alt) => `<div class="photo"><img src="rosh-hashanah-seder-photos.png" alt="${alt}" style="left:-${column * 100}%;top:-${row * 100}%"></div>`;
const card = (number, title, column, row, content) => `<div class="step">${photo(column, row, title)}<div class="step-text"><h2>${number}. ${title}</h2>${content}</div></div>`;
add('הערב הראשון — עושים לפי הסדר', 'דף לשולחן • חלק א׳: קידוש, נטילת ידיים וחלה', `
<p>לאחר הדלקת הנרות מתחילים בסדר הבא. נוסח הקידוש המלא נמצא בעמ׳ 2.</p>
${card(1, 'מקדשים — ואז שותים יין', 0, 0, `<p>מכסים את החלות וממלאים את הכוס. אומרים את שלוש ברכות הקידוש בעמ׳ 2. ברכת הגפן היא חלק מהקידוש:</p>${prayer(p.wine)}<p><strong>שותים רק לאחר שהחיינו.</strong> המקדש שותה מלוא לוגמיו — כמות הממלאת לחי אחת כשהיא מנופחת; טוב שגם הסועדים יטעמו. אין לברך שוב הגפן על אותה שתייה.</p>`)}
${card(2, 'נוטלים ידיים', 1, 0, `<p>מסירים חציצות מהידיים וממלאים כלי במים. לפי מנהג חב״ד שופכים שלוש פעמים על ימין ואחר כך שלוש על שמאל, עד פרק כף היד. מברכים לפני הניגוב:</p>${prayer(p.hands)}<p>מנגבים. לא מדברים עד אכילת החלה.</p>`)}
${card(3, 'מברכים על החלה ואוכלים', 2, 0, `<p>מגלים ואוחזים שתי חלות שלמות ומברכים:</p>${prayer(p.bread)}<p>בוצעים, טובלים בדבש, מחלקים ואוכלים. לסעודת החג מתכננים לאכול לחם יותר מכביצה (כ־54 סמ״ק), ולכן נוטלים בברכה. את הכזית הראשון אוכלים בתוך כ־4 דקות.</p>`)}
<p class="next">ממשיכים לתפוח ולסימנים בעמוד הבא ←</p>`, true);

add('הערב הראשון — הסימנים', 'דף לשולחן • חלק ב׳: תפוח, רימון וראש דג • לפי מנהג חב״ד', `
${card(4, 'תפוח בדבש', 0, 1, `<p>טובלים פלח תפוח מתוק בדבש. מברכים ומכוונים גם לרימון ולפירות העץ הנוספים:</p>${prayer(p.fruit)}<p>בחב״ד אומרים לפני האכילה:</p>${prayer(p.appleWish)}<p><strong>עכשיו אוכלים את התפוח.</strong></p>`)}
${card(5, 'רימון', 1, 1, `<p>אוכלים מגרגירי הרימון.</p><p><strong>אין מברכים שוב העץ</strong> — הרימון נכלל בברכה על התפוח. בחב״ד אין אומרים עליו בקשת יהי רצון נפרדת.</p><p class="meaning">המשמעות: בקשה לריבוי זכויות ומעשים טובים.</p>`)}
${card(6, 'ראש דג', 2, 1, `<p>אוכלים מעט מראש דג מבושל וכשר, תוך זהירות מעצמות. יש הנוהגים בראש כבש.</p><p><strong>כחלק מסעודת הלחם אין מברכים עליו ברכת מאכל נפרדת.</strong> בחב״ד אין אומרים עליו בקשת יהי רצון נפרדת.</p><p class="meaning">המשמעות: שנהיה לראש ולא לזנב.</p>`)}
${note('<strong>מסיימים בסעודת החג.</strong> הסימנים אינם מחליפים את הסעודה. בסוף אכילת הלחם מברכים ברכת המזון עם יעלה ויבוא — עמ׳ 6–8.')}
<p class="small">סדר הסימנים כאן לפי מנהג חב״ד. הנוסח החלופי של קידוש הבוקר בעמ׳ 4 אינו משנה אוטומטית את מנהגי הסימנים. יש לנהוג בדפים בכבוד הראוי לדברי קודש.</p>`, true);

const css = `@page{size:A4;margin:12mm}*{box-sizing:border-box}html,body{margin:0;padding:0}body{direction:rtl;font-family:Arial,sans-serif;color:#262626;font-size:12pt;line-height:1.5}.page{height:272mm;position:relative;padding:0 1mm 13mm;break-after:page}.page:last-child{break-after:auto}.eyebrow{display:flex;justify-content:space-between;border-bottom:1px solid #b6aaa0;padding-bottom:3mm;margin-bottom:5mm;font-size:9pt;color:#555}h1{font-size:26pt;line-height:1.15;color:#641e31;margin:0 0 2mm}.subtitle{font-size:11pt;color:#666;margin:0 0 5mm}h2{font-size:15pt;margin:4mm 0 2mm}h3{font-size:12pt;margin:3mm 0 1mm}p{margin:0 0 2.5mm}.prayer{font-family:David,"Times New Roman",serif;font-size:18pt;line-height:1.5;border-right:2px solid #ab8749;background:#faf8f3;padding:2mm 4mm;break-inside:avoid}.lead{font-size:15pt}.small{font-size:10pt;line-height:1.4}.note{border:1px solid #b5afa5;background:#faf9f7;padding:3mm;margin:3mm 0}.compact{font-size:11pt;line-height:1.4}.compact .prayer{font-size:15pt;line-height:1.42;padding:1.6mm 3mm}.compact h2{margin:3mm 0 2mm}ul{padding-right:6mm;margin:3mm 0}li{margin-bottom:1.5mm}table{border-collapse:collapse;width:100%;font-size:11pt;margin:3mm 0}td,th{border:1px solid #bbb;text-align:right;padding:2.5mm}th{background:#f4eee7}footer{position:absolute;bottom:2mm;left:1mm;right:1mm;border-top:1px solid #bbb;padding-top:2mm;display:flex;justify-content:space-between;font-size:9pt;color:#666}.step{display:flex;gap:4mm;border-bottom:1px solid #ddd;padding:4mm 0;break-inside:avoid;align-items:flex-start}.step-text{flex:1;min-width:0}.photo{position:relative;width:40mm;height:40mm;flex:0 0 40mm;overflow:hidden;background:white}.photo img{position:absolute;width:300%;height:200%;max-width:none}.step h2{margin-top:0}.step .prayer{font-size:15pt}.meaning{color:#555;font-size:10pt}.next{font-weight:bold;margin-top:4mm}@media screen{body{background:#ddd}.page{width:186mm;margin:12mm auto;background:#fff;box-shadow:0 0 0 12mm white}}`;
const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>ראש השנה בימי חול — טיוטת מדריך לבדיקה</title><style>${css}</style></head><body>${pages.map((page, i) => `<section id="page-${i + 1}" class="page ${page.compact ? 'compact' : ''}"><div class="page-body"><div class="eyebrow"><span>בית חב״ד • ראש השנה בימי חול</span><span>ב״ה · טיוטה לבדיקה</span></div><h1>${page.title}</h1><p class="subtitle">${page.subtitle}</p>${page.body}</div><footer><span>ראש השנה בימי חול • מדריך לשולחן החג</span><span dir="ltr">${i + 1} / ${pages.length}</span></footer></section>`).join('')}</body></html>`;
assert.equal(pages.length, 10);
assert.ok(!html.includes('בית הכנסת'));
assert.ok(!html.includes('רצה והחליצנו'));
assert.ok(!html.includes('מוצאי שבת'));
assert.ok(!/<a\b[^>]*href/.test(html));
await writeFile(join(directory, 'rosh-hashanah-weekdays-review.html'), html);
console.log(`Built ${pages.length} weekday-only review pages.`);
