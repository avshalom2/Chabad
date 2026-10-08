import { htmlToDOM, domToReact } from 'html-react-parser';
import ClassicServiceIcon from './ClassicServiceIcon';
import styles from './ServiceArticleContent.module.css';

function findFirstImage(nodes) {
  for (const node of nodes) {
    if (node.type === 'tag' && node.name === 'img') return node;
    const image = node.children && findFirstImage(node.children);
    if (image) return image;
  }
  return null;
}

export default function ServiceArticleContent({ content, slug }) {
  const nodes = htmlToDOM(content);
  const firstImage = findFirstImage(nodes);
  const body = domToReact(nodes, {
    replace(node) {
      if (node !== firstImage) return;
      return <div className={styles.icon} role="img" aria-label={node.attribs.alt || undefined}>
        <ClassicServiceIcon slug={slug} />
      </div>;
    },
  });
  return <>{!firstImage && <div className={styles.icon} aria-hidden="true">
    <ClassicServiceIcon slug={slug} />
  </div>}{body}</>;
}
