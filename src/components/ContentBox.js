import styles from './ContentBox.module.css';

export default function ContentBox({ children }) {
  return (
    <div className={styles.contentBox}>
      {children}
    </div>
  );
}
