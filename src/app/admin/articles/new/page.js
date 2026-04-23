'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload.js';
import PageBuilder from '@/components/PageBuilder/index.js';
import styles from './article-form.module.css';

export default function NewArticlePage() {
  const router = useRouter();
  const pageBuilderRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showContent, setShowContent] = useState(false);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    short_description: '',
    content: '',
    category_id: '',
    featured_image: '',
    price: '',
    is_purchasable: false,
    stock: '',
    status: 'draft',
    template: 'standard',
    is_main_article: false,
    article_type: 'article',
  });

  // Load categories on mount
  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((catData) => setCategories(catData.categories || []))
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  // Auto-generate slug from title
  function handleTitleChange(e) {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setForm((prev) => ({ ...prev, title, slug }));
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
    setLoading(true);

    try {
      const pageHtml = pageBuilderRef.current?.getHtml() || form.content;

      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          content: pageHtml,
          short_description: form.short_description || null,
          price: form.price ? parseFloat(form.price) : null,
          stock: form.stock ? parseInt(form.stock) : null,
          is_purchasable: form.is_purchasable ? 1 : 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create article');
        setLoading(false);
        return;
      }

      router.push(`/admin/articles/${data.id}/edit`);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <a href="/admin/articles" className={styles.backLink}>← חזור לכתבות</a>
        <h1>כתבה חדשה</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        {/* LEFT & RIGHT COLUMNS */}
        <div className={styles.mainLayout}>
          {/* LEFT COLUMN: Title, Slug, Category */}
          <div className={styles.leftColumn}>
            <div className={styles.formGroup}>
              <label htmlFor="title">כותרת *</label>
              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleTitleChange}
                placeholder="לדוגמה: הבנת התורה"
                required
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="slug">כתובת URL</label>
              <input
                id="slug"
                name="slug"
                type="text"
                value={form.slug}
                onChange={handleChange}
                placeholder="לדוגמה: tabernacles-holiday"
                disabled={loading}
              />
              <small>אופציונלי - נוצר באופן אוטומטי מהכותרת</small>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="category_id">קטגוריה *</label>
              <select
                id="category_id"
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">-- בחר קטגוריה --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.level > 0 && '\u00A0\u00A0'.repeat(cat.level) + '└ '}{cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* RIGHT COLUMN: Short Description & Options */}
          <div className={styles.rightColumn}>
            <div className={styles.formGroup}>
              <label htmlFor="short_description">תיאור קצר</label>
              <textarea
                id="short_description"
                name="short_description"
                value={form.short_description}
                onChange={handleChange}
                placeholder="תיאור קצר לכרטיסיות הכתבה"
                rows={5}
                disabled={loading}
              />
              <small>מוצג בכרטיסיות וקטגוריות</small>
            </div>

            <div className={styles.formGroup}>
              <label>העלאת תמונות</label>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                תוכן יהיה זמין להעלאת תמונות לאחר יצירת הכתבה
              </p>
            </div>

            {/* OPTIONS PANEL */}
            <div className={styles.optionsPanel}>
              <div className={styles.formGroup}>
                <label>סוג תוכן</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="article_type"
                      value="article"
                      checked={form.article_type === 'article'}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    כתבה
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="article_type"
                      value="gallery"
                      checked={form.article_type === 'gallery'}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    גלריה
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="status">סטטוס</label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="draft">טיוטה</option>
                  <option value="published">מפורסם</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="template">תבנית</label>
                <select
                  id="template"
                  name="template"
                  value={form.template}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="standard">סטנדרטי</option>
                  <option value="featured-banner">בנר מדגם</option>
                </select>
                <small>סגנון התצוגה כשמסומן כראשי</small>
              </div>

              <div className={styles.checkboxGroup}>
                <input
                  id="is_purchasable"
                  name="is_purchasable"
                  type="checkbox"
                  checked={form.is_purchasable}
                  onChange={handleChange}
                  disabled={loading}
                />
                <label htmlFor="is_purchasable">ניתן לרכישה</label>
              </div>

              <div className={styles.checkboxGroup}>
                <input
                  id="is_main_article"
                  name="is_main_article"
                  type="checkbox"
                  checked={form.is_main_article}
                  onChange={handleChange}
                  disabled={loading}
                />
                <label htmlFor="is_main_article">כתבה ראשית</label>
              </div>

              {form.is_purchasable && (
                <>
                  <div className={styles.formGroup}>
                    <label htmlFor="price">מחיר ($)</label>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      disabled={loading}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="stock">מלאי</label>
                    <input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={handleChange}
                      placeholder="השאר ריק"
                      disabled={loading}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* PAGE CONTENT SECTION - COLLAPSIBLE */}
        <div className={styles.contentToggle}>
          <input
            type="checkbox"
            id="toggleContent"
            checked={showContent}
            onChange={(e) => setShowContent(e.target.checked)}
            disabled={loading}
          />
          <label htmlFor="toggleContent">תוכן הדף (בונה עמודים)</label>
        </div>

        <div className={`${styles.contentSection} ${!showContent ? styles.hidden : ''}`}>
          <PageBuilder ref={pageBuilderRef} initialHtml={form.content} />
        </div>

        {/* FORM ACTIONS */}
        <div className={styles.formActions}>
          <a href="/admin/articles" className={styles.cancelBtn}>ביטול</a>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'שומר...' : 'צור כתבה'}
          </button>
        </div>
      </form>
    </div>
  );
}
