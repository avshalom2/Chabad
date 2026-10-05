'use client';

import ClassicHomepageHeader, { classicFontClasses } from './ClassicHomepageHeader';
import WeeklyPrayerBox from './WeeklyPrayerBox';
import StoreHoursBar from './StoreHoursBar';
import BannerSlotRenderer from './BannerSlotRenderer';
import ArticlesCube from './ArticlesCube';
import ArticlesSlider from './ArticlesSlider';
import TorahVideosSlider from './TorahVideosSlider';
import ContactForm from './ContactForm';
import ClassicContactSection from './ClassicContactSection';
import ClassicOpeningSection from './ClassicOpeningSection';
import ClassicLearningSection from './ClassicLearningSection';
import EventsBox from './EventsBox';
import NewsBox from './NewsBox';
import { getSmartGridControlType } from '@/lib/smart-grid-template';
import { siteConfig } from '@/lib/site-config';
import styles from './ClassicHomepage.module.css';

function SectionHeading({ eyebrow, children, description }) {
  return <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>{eyebrow}</p><h2>{children}</h2></div>{description && <p className={styles.description}>{description}</p>}</div>;
}

export default function ClassicHomepage({ config, embedded = false }) {
  const controls = [...(config.controls || [])].filter(c => c.active).sort((a, b) => a.order - b.order);
  const ofType = type => controls.filter(c => getSmartGridControlType(c) === type);
  const has = type => ofType(type).length > 0;
  const render = (type, Component, props = {}) => ofType(type).map(c => <Component key={c.id} categoryId={c.categoryId} categorySlug={c.categorySlug} categoryName={c.categoryName} {...props} />);
  return <div className={`${styles.page} ${classicFontClasses}`} data-homepage-design={embedded ? 'classic-embedded' : 'classic'}>
    <ClassicHomepageHeader />

    <ClassicOpeningSection prayers={render('weekly-prayers', WeeklyPrayerBox, { variant: 'classic' })} store={render('store-hours', StoreHoursBar, { variant: 'classic' })} />

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
    {has('torah-videos') && <ClassicLearningSection>{render('torah-videos', TorahVideosSlider)}</ClassicLearningSection>}
    {has('contact-form') && <ClassicContactSection>{render('contact-form', ContactForm, { variant: 'classic' })}</ClassicContactSection>}
  </div>;
}
