import styles from './ServicesHeading.module.css';
import classicStyles from './ClassicHomepage.module.css';
import { classicFontClasses } from './ClassicHomepageHeader';

export default function ServicesHeading() {
  return <div className={`${styles.services} ${classicFontClasses}`} dir="rtl">
    <div className={`${classicStyles.statement} ${styles.statement}`} data-services-statement>
      <span aria-hidden="true">✧</span>
      <p>יותר ממקום. <em>הרגשה של בית.</em></p>
      <small>מסורת חיה · קהילה פתוחה · לב גדול</small>
    </div>
    <div className={styles.heading} data-services-heading>
    <div className={styles.titleGroup}>
      <p className={styles.eyebrow}>כאן בשבילכם, בכל שלב</p>
      <h2>שירותי בית חב״ד, <em>בגובה העיניים.</em></h2>
    </div>
    <p className={styles.description}>מעטפת אישית, מקצועית והלכתית למשפחה, לבית ולעסק — עם ליווי חם מהשיחה הראשונה.</p>
    </div>
  </div>;
}
