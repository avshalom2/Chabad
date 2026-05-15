import styles from './donate.module.css';

const DONATION_URL = 'https://icredit.rivhit.co.il/payment/PaymentFullPage.aspx?GroupId=d6c3425d-4458-44a2-b23f-227e763e5749';

export const metadata = {
  title: 'תרומה לזכות רבי שמעון בר יוחאי',
};

export default function DonatePage() {
  return (
    <main className={styles.page} dir="rtl">
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
