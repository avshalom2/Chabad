import { getCategories } from '@/lib/categories.js';
import styles from './categories.module.css';

export default async function CategoriesPage() {
  const categories = await getCategories({ activeOnly: false });

  // Build tree structure: organize categories by parent_id
  const buildTree = (cats) => {
    const map = {};
    const roots = [];

    // First pass: create a map of all categories
    cats.forEach((cat) => {
      map[cat.id] = { ...cat, children: [] };
    });

    // Second pass: build the tree
    cats.forEach((cat) => {
      if (cat.parent_id && map[cat.parent_id]) {
        map[cat.parent_id].children.push(map[cat.id]);
      } else {
        roots.push(map[cat.id]);
      }
    });

    return roots;
  };

  const tree = buildTree(categories);

  // Recursive component to render tree items
  const TreeItem = ({ cat, level = 0 }) => {
    const indent = level * 30; // 30px per level
    return (
      <>
        <tr key={cat.id} style={{ backgroundColor: level > 0 ? '#f9fafb' : 'transparent' }}>
          <td style={{ paddingLeft: `${indent + 16}px` }}>
            {level > 0 && <span className={styles.treeIcon}>└ </span>}
            {cat.name}
          </td>
          <td><code>{cat.slug}</code></td>
          <td>{cat.type_name}</td>
          <td>{cat.children.length > 0 ? `${cat.children.length} sub` : '—'}</td>
          <td>
            <span className={cat.is_menu ? styles.yes : styles.no}>
              {cat.is_menu ? '✓' : '–'}
            </span>
          </td>
          <td>
            <span className={cat.is_active ? styles.active : styles.inactive}>
              {cat.is_active ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td>{cat.sort_order}</td>
          <td className={styles.actions}>
            <a href={`/admin/categories/${cat.id}/edit`} className={styles.editBtn}>Edit</a>
          </td>
        </tr>
        {cat.children.map((child) => (
          <TreeItem key={child.id} cat={child} level={level + 1} />
        ))}
      </>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Categories</h1>
        <a href="/admin/categories/new" className={styles.addButton}>
          + Add Category
        </a>
      </div>

      {categories.length === 0 ? (
        <p className={styles.empty}>No categories yet. <a href="/admin/categories/new">Add your first one →</a></p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Type</th>
              <th>Children</th>
              <th>Menu</th>
              <th>Status</th>
              <th>Sort</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tree.map((cat) => (
              <TreeItem key={cat.id} cat={cat} level={0} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
