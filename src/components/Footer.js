'use client';

import styles from './Footer.module.css';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

export default function Footer() {
  const pathname = usePathname();
  const { address, email, phone } = siteConfig.contact;

  if (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/admin/login') {
    return null;
  }

  return (
    <footer className={styles.elegantChabadFooter}>
      <div className={styles.footerWrap}>
        <div className={styles.footerGrid}>
          {/* Main Info */}
          <div className={`${styles.fCol} ${styles.mainInfo}`}>
            <div className={styles.fLogo}>בית חב&quot;ד</div>
            <p className={styles.fDescription}>מרכז של אור, חסד ויהדות לכל אחד ואחת בקהילה. דלתנו פתוחה תמיד.</p>
            <div className={styles.mashiachBadge}>יחי המלך המשיח</div>
          </div>

          {/* Information */}
          <div className={styles.fCol}>
            <h4 className={styles.fHeader}>מרכז מידע</h4>
            <nav className={styles.fLinks}>
              <Link href="/shiurim">שיעורי תורה</Link>
              <Link href="/category/weekly-torah-portion">פרשת השבוע</Link>
              <Link href="/shabbat-times">זמני שבת</Link>
              <Link href="/category/store">חנות חב&quot;ד</Link>
            </nav>
          </div>

          {/* Community */}
          <div className={styles.fCol}>
            <h4 className={styles.fHeader}>פעילות וקהילה</h4>
            <nav className={styles.fLinks}>
              <Link href="/category/קהילה-וחסד">קהילה וחסד</Link>
              <Link href="/category/lifecycle">מעגל החיים</Link>
              <Link href="/category/tefillin-mezuzah">תפילין ומזוזות</Link>
              <Link href="/donate">שותפות ותרומות</Link>
            </nav>
          </div>

          {/* Contact */}
          <div className={`${styles.fCol} ${styles.contactInfo}`}>
            <h4 className={styles.fHeader}>צרו קשר</h4>
            <div className={styles.contactItem}>
              <span className={styles.icon}>📍</span>
              <span>{address}</span>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.icon}>📞</span>
              <span>{phone}</span>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.icon}>✉️</span>
              <span>{email}</span>
            </div>
          </div>
        </div>

        <div className={styles.footerCopy}>
          <p>© בית חב&quot;ד | כל הזכויות שמורות לא.ש אינטראקטיב</p>
        </div>
      </div>
    </footer>
  );
}

