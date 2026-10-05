'use client';

import styles from './ClassicHomepage.module.css';

export default function ClassicLearningSection({ children }) {
  return <section className={`${styles.section} ${styles.learning}`}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>זמן לעצור, ללמוד ולהתחבר</p><h2>תורה שמאירה <em>את היום.</em></h2></div></div>{children}</section>;
}
