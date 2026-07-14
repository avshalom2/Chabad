import ContactPageForm from './ContactPageForm';
import styles from './contact.module.css';

export const metadata = {
  title: 'צור קשר',
  description: 'צרו קשר עם בית חב"ד',
};

const address = 'משכית 22, הרצליה פיתוח';
const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
const defaultWhatsAppPhone = '97286233197';

function normalizeWhatsAppPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return defaultWhatsAppPhone;
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0')) return `972${digits.slice(1)}`;
  return digits;
}

const whatsappPhone = normalizeWhatsAppPhone(process.env.CONTACT_WHATSAPP_PHONE);
const whatsappHref = `https://wa.me/${whatsappPhone}`;

export default function ContactPage() {
  return (
    <main className={styles.page} dir="rtl">
      <section className={styles.hero}>
        <p className={styles.eyebrow}>בית חב״ד הרצליה פיתוח</p>
        <h1>צור קשר</h1>
        <p>נשמח לשמוע מכם ולעזור בכל שאלה, בקשה או תיאום.</p>
      </section>

      <section className={styles.formSection} aria-labelledby="contact-form-title">
        <h2 id="contact-form-title">בית חב״ד זמין עבורכם וישמח לשרת אתכם</h2>
        <ContactPageForm />
      </section>

      <section className={styles.detailsSection} aria-labelledby="contact-details-title">
        <h2 id="contact-details-title">זמינים בכל דרך</h2>
        <div className={styles.contactList}>
          <a href="mailto:chabadbr7@gmail.com" className={styles.contactItem}>
            <span className={styles.icon}>@</span>
            <span>chabadbr7@gmail.com</span>
          </a>
          <a href="tel:08-6233197" className={styles.contactItem}>
            <span className={styles.icon}>☎</span>
            <span>08-6233197</span>
          </a>
          <a href={whatsappHref} className={styles.contactItem}>
            <span className={styles.icon}>W</span>
            <span>WhatsApp</span>
          </a>
          <a href="https://m.me/" className={styles.contactItem}>
            <span className={styles.icon}>M</span>
            <span>Messenger</span>
          </a>
        </div>
      </section>

      <section className={styles.mapSection} aria-label="מפת הגעה">
        <div className={styles.addressCard}>
          <h2>איך מגיעים?</h2>
          <p>{address}</p>
        </div>
        <iframe
          title="מפת הגעה לבית חב״ד"
          src={mapSrc}
          className={styles.map}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
    </main>
  );
}
