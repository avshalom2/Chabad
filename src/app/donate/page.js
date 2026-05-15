import styles from './donate.module.css';

const DONATION_URL = 'https://icredit.rivhit.co.il/payment/PaymentFullPage.aspx?GroupId=d6c3425d-4458-44a2-b23f-227e763e5749';

export const metadata = {
  title: 'תרומה לזכות רבי שמעון בר יוחאי',
};

export default function DonatePage() {
  return (
    <main className={styles.page} dir="rtl">
      <section className={styles.header}>
        <div className={styles.kicker}>תרומה לזכות רבי שמעון בר יוחאי</div>
        <h1>תורמים לפעילות חב״ד הרצליה</h1>
        <p>לכבוד ל״ג בעומר, ניתן להשתתף בתרומה מאובטחת דרך מערכת התשלומים.</p>
        <a className={styles.openLink} href={DONATION_URL} target="_blank" rel="noopener noreferrer">
          פתיחת התשלום בחלון חדש
        </a>
      </section>

      <section className={styles.frameWrap} aria-label="טופס תרומה מאובטח">
        <iframe
          className={styles.frame}
          src={DONATION_URL}
          title="תרומה לפעילות חב״ד הרצליה"
          loading="lazy"
        />
      </section>
    </main>
  );
}
