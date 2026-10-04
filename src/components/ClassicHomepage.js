'use client';

import { useEffect, useState } from 'react';
import { Assistant, Frank_Ruhl_Libre } from 'next/font/google';
import Link from 'next/link';
import WeeklyPrayerBox from './WeeklyPrayerBox';
import StoreHoursBar from './StoreHoursBar';
import BannerSlotRenderer from './BannerSlotRenderer';
import ArticlesCube from './ArticlesCube';
import ArticlesSlider from './ArticlesSlider';
import TorahVideosSlider from './TorahVideosSlider';
import ContactForm from './ContactForm';
import EventsBox from './EventsBox';
import NewsBox from './NewsBox';
import { getSmartGridControlType } from '@/lib/smart-grid-template';
import { formatHebrewDate } from '@/lib/hebrew-calendar';
import { siteConfig } from '@/lib/site-config';
import styles from './ClassicHomepage.module.css';

const assistant = Assistant({ subsets: ['hebrew'], display: 'swap', variable: '--classic-body-font' });
const frank = Frank_Ruhl_Libre({ subsets: ['hebrew'], display: 'swap', variable: '--classic-heading-font' });

function SectionHeading({ eyebrow, children, description }) {
  return <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>{eyebrow}</p><h2>{children}</h2></div>{description && <p className={styles.description}>{description}</p>}</div>;
}

export default function ClassicHomepage({ config, embedded = false }) {
  const [date, setDate] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const update = () => setDate(formatHebrewDate(new Date()));
    update();
    const timer = setInterval(update, 60 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);
  const controls = [...(config.controls || [])].filter(c => c.active).sort((a, b) => a.order - b.order);
  const ofType = type => controls.filter(c => getSmartGridControlType(c) === type);
  const has = type => ofType(type).length > 0;
  const render = (type, Component, props = {}) => ofType(type).map(c => <Component key={c.id} categoryId={c.categoryId} categorySlug={c.categorySlug} categoryName={c.categoryName} {...props} />);
  const nav = <><a href="#classic-times">שעות ותפילות</a><a href="#classic-services">השירותים שלנו</a><Link href="/shabbat-times">זמני שבת</Link><a href="#classic-articles">חגים ומאמרים</a></>;

  return <div className={`${styles.page} ${assistant.variable} ${frank.variable}`} data-homepage-design={embedded ? 'classic-embedded' : 'classic'}>
    <div className={styles.announcement}><span>בית חב״ד הרצליה פיתוח <i /> פותחים את הדלת. פותחים את הלב.</span><time>{date}</time></div>
    <header className={styles.navigation}>
      <Link href="/" className={styles.brand}><span className={styles.brandMark} aria-hidden="true">✧</span><span><strong>בית חב״ד</strong><small>הרצליה פיתוח · הבית של כולנו</small></span></Link>
      <nav aria-label="ניווט דף הבית" className={styles.desktopNav}>{nav}</nav>
      <a className={styles.visit} href="#classic-contact">בואו להכיר <span aria-hidden="true">←</span></a>
      <button className={styles.menuButton} aria-label="תפריט ניווט" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      {menuOpen && <nav className={styles.mobileNav} aria-label="ניווט בנייד" onClick={() => setMenuOpen(false)}>{nav}</nav>}
    </header>

    <section className={styles.timesSection} id="classic-times" aria-label="שעות פתיחה ותפילות">
      <div className={styles.timesIntro}><p className={styles.eyebrow}>המידע החשוב, מיד כשצריך</p><h1>שעות פתיחה<br />{' '}<em>וזמני תפילה.</em></h1><p>כל המידע לביקור בבית חב״ד הרצליה פיתוח — מרוכז, ברור ונגיש.</p><a className={styles.address} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.contact.address)}`} target="_blank" rel="noopener noreferrer"><span aria-hidden="true">⌖</span> {siteConfig.contact.address}</a></div>
      <div className={styles.prayers}>{render('weekly-prayers', WeeklyPrayerBox, { variant: 'classic' })}</div>
      <div className={styles.store}>{render('store-hours', StoreHoursBar, { variant: 'classic' })}</div>
    </section>

    <section className={styles.hero}>
      <div className={styles.heroCopy}><p className={styles.eyebrow}>כאן תמיד יש מקום בשבילכם</p><h2>מקום להרגיש<br /><em>בבית.</em></h2><p>תפילה, לימוד, חג ורגעים של ביחד. בית חב״ד הרצליה פיתוח הוא מקום פתוח ומזמין לכל יהודי ויהודייה, בכל שלב בדרך.</p><div className={styles.heroActions}><a className={styles.button} href="#classic-times">לזמני התפילות <span aria-hidden="true">←</span></a><a className={styles.textLink} href="#classic-services">לגלות את הפעילות <span aria-hidden="true">←</span></a></div><small>✳ &nbsp; חיבור אמיתי מתחיל בדלת פתוחה.</small></div>
      <div className={styles.heroMedia}><img src="/shabbat-times-hero.png" alt="אור נרות שבת" fetchPriority="high" /><div><span>אור קטן. חיבור גדול.</span><i /><span>הרצליה פיתוח</span></div></div>
    </section>
    <div className={styles.statement}><span aria-hidden="true">✧</span><p>יותר ממקום. <em>הרגשה של בית.</em></p><small>מסורת חיה · קהילה פתוחה · לב גדול</small></div>

    {has('articles-cube') && <section className={styles.section} id="classic-services"><SectionHeading eyebrow="כאן בשבילכם, בכל שלב" description="מעטפת אישית, מקצועית והלכתית למשפחה, לבית ולעסק — עם ליווי חם מהשיחה הראשונה.">שירותי בית חב״ד, <em>בגובה העיניים.</em></SectionHeading>{render('articles-cube', ArticlesCube, { variant: 'classic' })}</section>}

    {has('banner') && <section className={`${styles.section} ${styles.community}`}><SectionHeading eyebrow="תמיד יש סיבה להיפגש" description="יש מקום לכל אחד ואחת. לתפילה, לשיחה, ללימוד ולחגיגה משותפת של החיים היהודיים.">קהילה שמרגישים <em>בה בבית.</em></SectionHeading><div className={styles.communityLayout}><div className={styles.communityCopy}><p className={styles.eyebrow}>יחד לאורך השנה</p><h3>נפגשים.<br />לומדים. חוגגים.</h3><p>התפילות, השיעורים והמפגשים בבית חב״ד הם הזדמנות להיות ביחד ולהרגיש שייכים.</p><a className={styles.textLink} href="#classic-contact">לפרטים וליצירת קשר <span aria-hidden="true">←</span></a></div><div className={styles.banners}>{ofType('banner').map(c => <BannerSlotRenderer key={c.id} slotId={c.bannerSlotId || 1} />)}</div></div></section>}

    {has('articles-slider') && <section className={styles.section} id="classic-articles"><SectionHeading eyebrow="מילים שנשארות איתנו" description="מאמרים ומחשבות לחיים עם משמעות.">רעיונות שפותחים <em>את הלב.</em></SectionHeading>{render('articles-slider', ArticlesSlider, { variant: 'classic' })}</section>}
    {has('events') && <section className={styles.section}>{render('events', EventsBox)}</section>}
    {has('news') && <section className={styles.section}>{render('news', NewsBox)}</section>}
    {has('torah-videos') && <section className={`${styles.section} ${styles.learning}`}><SectionHeading eyebrow="זמן לעצור, ללמוד ולהתחבר">תורה שמאירה <em>את היום.</em></SectionHeading>{render('torah-videos', TorahVideosSlider)}</section>}
    {has('contact-form') && <section className={`${styles.section} ${styles.contact}`} id="classic-contact"><div><p className={styles.eyebrow}>השיחה שלנו מתחילה כאן</p><h2>נעים להכיר.<br /><em>אנחנו כאן בשבילכם.</em></h2><p>שאלה, בקשה או רצון להיפגש — נשמח לשמוע מכם.</p><a className={styles.textLink} href={`tel:${siteConfig.contact.phone}`}><bdi>{siteConfig.contact.phone}</bdi> <span aria-hidden="true">←</span></a></div><div>{render('contact-form', ContactForm, { variant: 'classic' })}</div></section>}
  </div>;
}
