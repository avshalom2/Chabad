import { notFound } from 'next/navigation';
import { getAllTemplates } from '@/lib/hp-templates';
import TemplateRenderer from '@/components/TemplateRenderer';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'דף הבית החדש — תצוגה מקדימה', robots: { index: false, follow: false } };

export default async function HomepagePreview() {
  const templates = await getAllTemplates();
  const draft = templates.find(template => template.template_name === 'דף בית חדש — טיוטה');
  if (!draft) notFound();
  return <main><TemplateRenderer html={draft.homepage_html || draft.template_html} mobileControlOrder={draft.mobile_control_order || []} /></main>;
}
