import styles from './ProductCategoryPage.module.css';

export default function ProductCategoryPage({ category }) {
  return (
    <div className={styles.productCategoryPage}>
      <h2>קטגוריה: {category}</h2>
      {/* Add category content here */}
    </div>
  );
}
