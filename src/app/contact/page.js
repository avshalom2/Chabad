import ContactPageForm from './ContactPageForm';
import { siteConfig } from '@/lib/site-config';
import styles from './contact.module.css';
import { Assistant, Frank_Ruhl_Libre } from 'next/font/google';

const assistant = Assistant({ subsets: ['hebrew'], display: 'swap', variable: '--contact-body-font' });
const frank = Frank_Ruhl_Libre({ subsets: ['hebrew'], display: 'swap', variable: '--contact-heading-font' });

export const metadata = {
  title: 'צור קשר',
  description: 'צרו קשר עם בית חב"ד',
};

const address = siteConfig.contact.address;
const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
const { email: contactEmail, phone: contactPhoneDisplay, whatsappPhone } = siteConfig.contact;

const whatsappHref = `https://wa.me/${whatsappPhone}`;
const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

function ContactIcon({ type }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {type === 'phone' && <path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 2a14 14 0 0 1-7-7l2-2-2-5Z" />}
    {type === 'email' && <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></>}
    {type === 'message' && <path d="M21 11.5a9 9 0 0 1-13 8L3 21l1.5-5A9 9 0 1 1 21 11.5Z" />}
    {type === 'location' && <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.5" /></>}
  </svg>;
}

export default function ContactPage() {
  return (
    <main className={`${styles.page} ${assistant.variable} ${frank.variable}`} dir="rtl">
      <div className={styles.container}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>בית חב״ד הרצליה פיתוח · צור קשר</p>
        <h1>כל שיחה מתחילה<br /><em>בדלת פתוחה.</em></h1>
        <p className={styles.intro}>שאלה, בקשה או רצון להיפגש — אנחנו כאן בשבילכם.</p>
      </section>

      <div className={styles.contactLayout}>
      <section className={styles.detailsSection} aria-labelledby="contact-details-title">
        <p className={styles.eyebrow}>נעים להכיר</p>
        <h2 id="contact-details-title">אפשר פשוט<br />לדבר איתנו.</h2>
        <p className={styles.detailsIntro}>בטלפון, בהודעה או בביקור בבית חב״ד.<br />נשמח לשמוע מכם ולעזור.</p>
        <div className={styles.contactList}>
          <a href={`tel:${contactPhoneDisplay}`} className={styles.contactItem}>
            <span className={styles.icon}><ContactIcon type="phone" /></span>
            <span className={styles.contactCopy}><small>בשיחה</small><bdi>{contactPhoneDisplay}</bdi></span>
            <span className={styles.linkArrow} aria-hidden="true">←</span>
          </a>
          <a href={whatsappHref} className={styles.contactItem} target="_blank" rel="noopener noreferrer">
            <span className={styles.icon}><ContactIcon type="message" /></span>
            <span className={styles.contactCopy}><small>בהודעה</small><span>דברו איתנו בוואטסאפ</span></span>
            <span className={styles.linkArrow} aria-hidden="true">←</span>
          </a>
          <a href={`mailto:${contactEmail}`} className={styles.contactItem}>
            <span className={styles.icon}><ContactIcon type="email" /></span>
            <span className={styles.contactCopy}><small>במייל</small><bdi>{contactEmail}</bdi></span>
            <span className={styles.linkArrow} aria-hidden="true">←</span>
          </a>
        </div>
        <p className={styles.welcomeNote}><span aria-hidden="true">✧</span> יש מקום לכל אחד ואחת.</p>
      </section>

      <section className={styles.formSection} aria-labelledby="contact-form-title">
        <div className={styles.formHeading}><p className={styles.eyebrow}>השאירו לנו מילה</p><h2 id="contact-form-title">איך אפשר לעזור?</h2><p>כתבו לנו כאן, ונחזור אליכם בשמחה.</p></div>
        <ContactPageForm />
      </section>
      </div>

      <section className={styles.mapSection} id="contact-map" aria-label="מפת הגעה">
        <div className={styles.addressCard}>
          <div className={styles.mapHeading}><span className={styles.icon}><ContactIcon type="location" /></span><div><h2>נפגשים בבית חב״ד</h2><p>{address}</p></div></div>
          <a className={styles.directionsLink} href={directionsHref} target="_blank" rel="noopener noreferrer">להוראות הגעה <span aria-hidden="true">↗</span></a>
        </div>
        <iframe
          title="מפת הגעה לבית חב״ד"
          src={mapSrc}
          className={styles.map}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
      </div>
    </main>
  );
}
