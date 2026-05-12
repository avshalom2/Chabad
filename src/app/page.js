import styles from './page.module.css';
import ShabbatCompactBox from '@/components/ShabbatCompactBox';
import EventsBox from '@/components/EventsBox';
import BannerSlotRenderer from '@/components/BannerSlotRenderer';
import TemplateRenderer from '@/components/TemplateRenderer';
import DynamicPageRenderer from '@/components/DynamicPageRenderer';
import { getSettings } from '@/lib/settings';
import { getActiveTemplateForDisplay } from '@/lib/hp-templates';

export const dynamic = 'force-dynamic';

export default async function MainPage() {
  let homepageContent = '';
  let activeTemplate = null;
  
  // Try to get the active HP template first
  try {
    activeTemplate = await getActiveTemplateForDisplay();
  } catch (err) {
    console.error('Error fetching active template:', {
      message: err?.message || 'Unknown error',
      stack: err?.stack,
      error: err
    });
    // Continue with fallback - don't re-throw
  }

  // Fall back to legacy settings-based content if no active template
  if (!activeTemplate) {
    try {
      const settings = await getSettings(['homepage_content']);
      if (settings.homepage_content && typeof settings.homepage_content === 'string') {
        homepageContent = settings.homepage_content;
      }
    } catch (err) {
      console.warn('Settings fetch failed (may be normal if table does not exist):', err?.message);
      // table may not exist yet, fall through to default layout
    }
  }

  return (
    <main className={styles.main}>
      {/* ACTIVE TEMPLATE (from hp_templates) */}
      {activeTemplate && activeTemplate.html ? (
        <TemplateRenderer html={activeTemplate.html} />
      ) : (
        /* LEGACY DYNAMIC PAGE CONTENT (from PageBuilder) */
        homepageContent ? (
          <DynamicPageRenderer html={homepageContent} />
        ) : (
          /* DEFAULT LAYOUT - BANNER SLOT + EVENTS & SHABBAT */
          <>
            <section className={styles.contentRow}>
              <BannerSlotRenderer slotSlug="homepage-1" />
            </section>
            
            <section className={styles.contentRow}>
              <div className={styles.boxesGrid}>
                <EventsBox />
                <ShabbatCompactBox />
              </div>
            </section>
          </>
        )
      )}

    </main>
  );
}
