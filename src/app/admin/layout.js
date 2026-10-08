import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUserSession } from '@/lib/auth-session.js';
import AdminFeedbackBridge from '@/components/AdminFeedbackBridge.js';
import AdminSidebarFooter from '@/components/AdminSidebarFooter.js';
import { AdminFeedbackProvider } from '@/components/AdminFeedbackProvider.js';
import styles from './admin-layout.module.css';

export default async function AdminLayout({ children }) {
  const user = await getCurrentUserSession();

  if (!user) {
    redirect('/admin/login');
  }

  return (
    <div className={styles.adminContainer} dir="rtl">
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>ממשק ניהול</h2>
        </div>
        <nav className={styles.nav}>
          <Link href="/admin/settings" className={styles.navLink}>
            הגדרות אתר
          </Link>
          <Link href="/admin/categories" className={styles.navLink}>
            קטגוריות
          </Link>
          <Link href="/admin/articles" className={styles.navLink}>
            כתבות
          </Link>
          <Link href="/admin/events" className={styles.navLink}>
            אירועים
          </Link>
          <Link href="/admin/banner-slots" className={styles.navLink}>
            חריצות באנרים
          </Link>
          <Link href="/admin/weekly-prayers" className={styles.navLink}>
            זמני תפילה
          </Link>
          <Link href="/admin/media" className={styles.navLink}>
            ניהול תמונות
          </Link>
          <Link href="/admin/users" className={styles.navLink}>
            משתמשים
          </Link>
        </nav>
        <AdminSidebarFooter userEmail={user.email} />
      </aside>
      <main className={styles.mainContent}>
        <AdminFeedbackProvider>
          <AdminFeedbackBridge />
          {children}
        </AdminFeedbackProvider>
      </main>
    </div>
  );
}
