import { getInitialStoreHours } from '@/lib/store-hours-cache';
import { getInitialWeeklyPrayerSchedule } from '@/lib/weekly-prayers-cache';
import { notFound } from 'next/navigation';
import { getAllTemplates } from '@/lib/hp-templates';
import TemplateRenderer from '@/components/TemplateRenderer';
import { parseSmartGridTemplate } from '@/lib/smart-grid-template';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'דף הבית החדש — תצוגה מקדימה', robots: { index: false, follow: false } };

export default async function HomepagePreview({ searchParams }) {
  const { template } = await searchParams;
  const templates = await getAllTemplates();
  const name = template === 'classic-shell' ? 'מעטפת קלאסית — גוף דף הבית הקיים' : 'דף בית חדש — טיוטה';
  const draft = template === 'body-refresh' ? templates.find(item => parseSmartGridTemplate(item.homepage_html || item.template_html)?.design === 'body-refresh') : templates.find(item => item.template_name === name);
  if (!draft) notFound();
  const [initialPrayerSchedule, initialStoreHours] = await Promise.all([getInitialWeeklyPrayerSchedule(), getInitialStoreHours()]);
  return <main><TemplateRenderer initialPrayerSchedule={initialPrayerSchedule} initialStoreHours={initialStoreHours} html={draft.homepage_html || draft.template_html} mobileControlOrder={draft.mobile_control_order || []} /></main>;
}
