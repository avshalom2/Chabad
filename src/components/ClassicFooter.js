'use client';

import Link from 'next/link';
import { classicFontClasses } from './ClassicHomepageHeader';
import { siteConfig } from '@/lib/site-config';
import styles from './ClassicFooter.module.css';

function ContactIcon({ type }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {type === 'location' && <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.5" /></>}
    {type === 'phone' && <path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 2a14 14 0 0 1-7-7l2-2-2-5Z" />}
    {type === 'email' && <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></>}
  </svg>;
}

export default function ClassicFooter() {
  const { address, phone, email, whatsappPhone } = siteConfig.contact;
  const whatsapp = `https://wa.me/${whatsappPhone}`;
  const contacts = [
    { type: 'location', label: 'מוזמנים לבוא', value: address, href: '/contact#contact-map' },
    { type: 'phone', label: 'נשמח לשוחח', value: phone, href: `tel:${phone}`, ltr: true },
    { type: 'email', label: 'אפשר גם במייל', value: email, href: `mailto:${email}`, ltr: true },
  ];
  return <footer className={`${styles.footer} ${classicFontClasses}`} data-footer-variant="classic" dir="rtl">
    <section className={styles.contactSection} id="classic-contact" aria-labelledby="footer-contact-title">
      <div className={styles.contactInner}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>השיחה שלנו מתחילה כאן</p>
          <h2 id="footer-contact-title">נעים להכיר.<br /><em>אנחנו כאן בשבילכם.</em></h2>
          <p className={styles.description}>שאלה, בקשה או רצון להיפגש — נשמח לשמוע מכם.</p>
          <a className={styles.whatsapp} href={whatsapp} target="_blank" rel="noopener noreferrer">שלחו לנו הודעה בוואטסאפ <span aria-hidden="true">↖</span></a>
        </div>
        <div className={styles.contactList}>
          {contacts.map(contact => <a key={contact.type} className={styles.contactLink} href={contact.href} {...(contact.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            <span className={styles.contactIcon}><ContactIcon type={contact.type} /></span>
            <span className={styles.contactText}><small>{contact.label}</small>{contact.ltr ? <bdi>{contact.value}</bdi> : <span>{contact.value}</span>}</span>
            <span className={styles.arrow} aria-hidden="true">↖</span>
          </a>)}
        </div>
      </div>
    </section>
    <div className={styles.bottom}>
      <div className={styles.bottomInner}>
        <Link className={styles.brand} href="/" aria-label="בית חב״ד הרצליה פיתוח — דף הבית">
          <img src="/header-ufaratzta-mark.png" alt="" width="36" height="50" />
          <span><strong>בית חב״ד</strong><small>הרצליה פיתוח - משכית 22</small></span>
        </Link>
        <p className={styles.motto}>פותחים את הדלת. פותחים את הלב.</p>
        <p className={styles.copyright}>© בית חב״ד הרצליה פיתוח · יחי המלך המשיח</p>
      </div>
    </div>
  </footer>;
}
