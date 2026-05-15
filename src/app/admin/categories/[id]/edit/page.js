'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from '../../new/new-category.module.css';

function generateSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id;

  const [categoryTypes, setCategoryTypes] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    category_type_id: '',
    parent_id: '',
    is_menu: false,
    sort_order: 0,
    is_active: true,
    default_columns: 3,
  });

  // Load category data, types, and parent categories on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoryRes, typesRes, categoriesRes] = await Promise.all([
          fetch(`/api/admin/categories/${categoryId}`),
          fetch('/api/admin/category-types'),
          fetch('/api/admin/categories'),
        ]);

        if (!categoryRes.ok) {
          setError('Category not found');
          setInitialLoading(false);
          return;
        }

        const categoryData = await categoryRes.json();
        const typesData = await typesRes.json();
        const categoriesData = await categoriesRes.json();

        const category = categoryData.category;
        setForm({
          name: category.name || '',
          slug: category.slug || '',
          description: category.description || '',
          category_type_id: category.category_type_id || '',
          parent_id: category.parent_id || '',
          is_menu: category.is_menu ? true : false,
          sort_order: category.sort_order || 0,
          is_active: category.is_active ? true : false,
          default_columns: category.default_columns || 3,
        });

        setCategoryTypes(typesData.categoryTypes || []);
        setParentCategories(categoriesData.categories || []);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load category data');
      } finally {
        setInitialLoading(false);
      }
    };
    loadData();
  }, [categoryId]);

  // Auto-generate slug from name
  function handleNameChange(e) {
    const name = e.target.value;
    const slug = generateSlug(name);
    setForm((prev) => ({ ...prev, name, slug }));
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update category');
        setLoading(false);
        return;
      }

      setSuccess(true);
      // Stay on page - don't redirect
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  }

  if (initialLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <a href="/admin/categories" className={styles.backLink}>← Back to Categories</a>
          <h1>Edit Category</h1>
        </div>
        <p>Loading category...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <a href="/admin/categories" className={styles.backLink}>← Back to Categories</a>
        <h1>Edit Category</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>✓ Category updated successfully!</div>}

        <div className={styles.formGroup}>
          <label htmlFor="name">Name *</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleNameChange}
            placeholder="e.g. Torah Classes"
            required
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="slug">Slug *</label>
          <input
            id="slug"
            name="slug"
            type="text"
            value={form.slug}
            onChange={handleChange}
            placeholder="e.g. torah-classes"
            required
            disabled={loading}
          />
          <small>URL-friendly name, auto-generated from Name</small>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="category_type_id">Category Type *</label>
          <select
            id="category_type_id"
            name="category_type_id"
            value={form.category_type_id}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">-- Select type --</option>
            {categoryTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="parent_id">Parent Category</label>
          <select
            id="parent_id"
            name="parent_id"
            value={form.parent_id}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">-- No parent (top-level) --</option>
            {parentCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.level > 0 && '\u00A0\u00A0'.repeat(cat.level) + '└ '}{cat.name}
              </option>
            ))}
          </select>
          <small>Optional: Select a parent to create a subcategory</small>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Optional description of this category"
            rows={3}
            disabled={loading}
          />
        </div>

        <div className={styles.checkboxGroup}>
          <input
            id="is_menu"
            name="is_menu"
            type="checkbox"
            checked={form.is_menu}
            onChange={handleChange}
            disabled={loading}
          />
          <label htmlFor="is_menu">
            Use as Menu Item
          </label>
          <small>Check if this category should appear in navigation menus</small>
        </div>

        <div className={styles.checkboxGroup}>
          <input
            id="is_active"
            name="is_active"
            type="checkbox"
            checked={form.is_active}
            onChange={handleChange}
            disabled={loading}
          />
          <label htmlFor="is_active">
            Active
          </label>
          <small>Uncheck to hide this category from navigation</small>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="sort_order">Sort Order</label>
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            value={form.sort_order}
            onChange={handleChange}
            min={0}
            disabled={loading}
          />
          <small>Lower numbers appear first</small>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="default_columns">Default Columns per Row</label>
          <select
            id="default_columns"
            name="default_columns"
            value={form.default_columns}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="1">1 column</option>
            <option value="2">2 columns</option>
            <option value="3">3 columns</option>
            <option value="4">4 columns</option>
            <option value="5">5 columns</option>
          </select>
          <small>Default layout when viewing this category</small>
        </div>

        <div className={styles.formActions}>
          <a href="/admin/categories" className={styles.cancelBtn}>Cancel</a>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Saving...' : 'Update Category'}
          </button>
        </div>
      </form>
    </div>
  );
}
