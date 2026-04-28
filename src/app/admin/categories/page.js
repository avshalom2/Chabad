import { getCategories } from '@/lib/categories.js';
import CategoriesGrid from './CategoriesGrid.js';
import styles from './categories.module.css';

export default async function CategoriesPage() {
  const categories = await getCategories({ activeOnly: false });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Categories</h1>
        <a href="/admin/categories/new" className={styles.addButton}>
          + Add Category
        </a>
      </div>

      <CategoriesGrid categories={categories} />
    </div>
  );
}
