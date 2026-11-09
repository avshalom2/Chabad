import parse from 'html-react-parser';
import Link from 'next/link';
import content from './tefillin-services.html.json';
import { siteConfig } from '@/lib/site-config';
import styles from './TefillinServices.module.css';

export default function TefillinServices({ article, related }) {
  return parse(content, {
    replace(node) {
      if (node.name === 'main') node.attribs.class = styles.page;
      if (node.name === 'a') {
        const href = node.attribs.href;
        if (href === '/category/services') node.attribs.href = `/category/${article.category_slug}`;
        if (href?.startsWith('https://wa.me/')) node.attribs.href = href.replace('972522523430', siteConfig.contact.whatsappPhone);
        if (href?.startsWith('tel:')) node.attribs.href = `tel:${siteConfig.contact.phone}`;
      }
      if (node.attribs?.['data-local-related']) {
        return related.length ? <section className="ts-more">
          <div><p className="ts-eyebrow">כאן בשבילכם, בכל שלב</p><h2>עוד בשירותי בית חב״ד</h2></div>
          <div className="ts-more-links">{related.map(item => <Link key={item.id} href={`/articles/${item.slug}`}>{item.title}<span aria-hidden="true">↖</span></Link>)}</div>
        </section> : <div className="ts-more" />;
      }
    },
  });
}
