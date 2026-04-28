'use client';

import styles from './Footer.module.css';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/admin/login') {
    return null;
  }

  return (
    <footer className={styles.elegantChabadFooter}>
      <div className={styles.footerWrap}>
        <div className={styles.footerGrid}>
          {/* Main Info */}
          <div className={`${styles.fCol} ${styles.mainInfo}`}>
            <div className={styles.fLogo}>בית חב"ד</div>
            <p className={styles.fDescription}>מרכז של אור, חסד ויהדות לכל אחד ואחת בקהילה. דלתנו פתוחה תמיד.</p>
            <div className={styles.mashiachBadge}>יחי המלך המשיח</div>
          </div>

          {/* Information */}
          <div className={styles.fCol}>
            <h4 className={styles.fHeader}>מרכז מידע</h4>
            <nav className={styles.fLinks}>
              <a href="#">שיעורי תורה ומאמרים</a>
              <a href="#">מבצעי המצוות</a>
              <a href="#">לוח זמני היום</a>
              <a href="#">חנות יודאיקה</a>
            </nav>
          </div>

          {/* Community */}
          <div className={styles.fCol}>
            <h4 className={styles.fHeader}>פעילות וקהילה</h4>
            <nav className={styles.fLinks}>
              <a href="#">עזרה למשפחות</a>
              <a href="#">פעילות נוער</a>
              <a href="#">בדיקת תפילין ומזוזות</a>
              <a href="#">שותפות ותרומות</a>
            </nav>
          </div>

          {/* Contact */}
          <div className={`${styles.fCol} ${styles.contactInfo}`}>
            <h4 className={styles.fHeader}>צרו קשר</h4>
            <div className={styles.contactItem}>
              <span className={styles.icon}>📍</span>
              <span>מרכז העיר, רחוב הקהילה 4</span>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.icon}>📞</span>
              <span>054-123-4567</span>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.icon}>✉️</span>
              <span>office@chabad-info.com</span>
            </div>
          </div>
        </div>

        <div className={styles.footerCopy}>
          <p>© בית חב"ד | כל הזכויות שמורות לא.ש אינטראקטיב</p>
        </div>
      </div>
    </footer>
  );
}

