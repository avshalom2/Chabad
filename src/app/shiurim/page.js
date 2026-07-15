import { getRabbiClassVideos } from '@/lib/youtube';
import ShiurimGallery from './ShiurimGallery';
import styles from './shiurim.module.css';

export const metadata = {
  title: 'שיעורי תורה',
  description: 'גלריית שיעורי תורה מתוך ערוץ היוטיוב של בית חב"ד',
};

export const dynamic = 'force-dynamic';

export default async function ShiurimPage() {
  const { videos, error } = await getRabbiClassVideos();

  return (
    <main className={styles.page} dir="rtl">
      <section className={styles.header}>
        <p className={styles.eyebrow}>בית חב&quot;ד</p>
        <h1>שיעורי תורה</h1>
        <p>שיעורים לצפייה ולימוד, מסודרים לפי הרבנים והנושאים מתוך רשימת השיעורים.</p>
      </section>

      {error ? (
        <section className={styles.emptyState}>
          <h2>השיעורים לא נטענו כרגע</h2>
          <p>אפשר לנסות שוב בעוד כמה דקות.</p>
        </section>
      ) : (
        <ShiurimGallery videos={videos} />
      )}
    </main>
  );
}
