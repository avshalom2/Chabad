import styles from './ContentCard.module.css';

export default function ContentCard({ title, info, actions, children }) {
  return (
    <div className={styles.contentCard}>
      <div className={styles.contentCardHeader}>
        <h2>{title}</h2>
        {info && <div className={styles.contentCardInfo}>{info}</div>}
      </div>
      <div className={styles.contentCardBody}>{children}</div>
      {actions && <div className={styles.contentCardActions}>{actions}</div>}
    </div>
  );
}
