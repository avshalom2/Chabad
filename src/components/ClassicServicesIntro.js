import styles from './ClassicHomepage.module.css';

export default function ClassicServicesIntro() {
  return <div className={`${styles.page} ${styles.servicesIntro}`} data-services-intro>
    <div className={styles.statement}>
      <span aria-hidden="true">✧</span>
      <p>יותר ממקום. <em>הרגשה של בית.</em></p>
      <small>מסורת חיה · קהילה פתוחה · לב גדול</small>
    </div>
    <section className={styles.servicesIntroHeading} aria-labelledby="shell-services-heading">
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>כאן בשבילכם, בכל שלב</p>
          <h2 id="shell-services-heading">שירותי בית חב״ד, <em>בגובה העיניים.</em></h2>
        </div>
        <p className={styles.description}>מעטפת אישית, מקצועית והלכתית למשפחה, לבית ולעסק — עם ליווי חם מהשיחה הראשונה.</p>
      </div>
    </section>
  </div>;
}
