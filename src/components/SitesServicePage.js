import parse from 'html-react-parser';
import pages from './sites-service-pages.json';
import { siteConfig } from '@/lib/site-config';
import styles from './SitesServicePage.module.css';

// Article markup and scoped styles imported from the approved Sites design.
export function hasSitesServicePage(slug) {
  return Object.hasOwn(pages, slug);
}

export default function SitesServicePage({ article }) {
  return <div className={styles.page}>{parse(pages[article.slug], {
    replace(node) {
      if (node.name !== 'a') return;
      const href = node.attribs.href;
      if (href === '/category/services' || href === '/category/lifecycle') {
        return <a href="/#classic-services">שירותי בית חב״ד</a>;
      }
      if (href?.startsWith('https://wa.me/972522523430')) {
        node.attribs.href = href.replace('972522523430', siteConfig.contact.whatsappPhone);
      }
      // Keep the mikvah's own phone number; only adapt the house contact number.
      if (href === 'tel:0522523430') node.attribs.href = `tel:${siteConfig.contact.phone}`;
    },
  })}</div>;
}
