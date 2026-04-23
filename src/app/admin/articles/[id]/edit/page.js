'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload.js';
import ArticleImageGallery from '@/components/ArticleImageGallery.js';
import PageBuilder from '@/components/PageBuilder/index.js';
import styles from '../../new/article-form.module.css';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showContent, setShowContent] = useState(false);
  const pageBuilderRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    short_description: '',
    content: '',
    category_id: '',
    featured_image: '',
    short_description_image: null,
    price: '',
    is_purchasable: false,
    stock: '',
    status: 'draft',
    template: 'standard',
    is_main_article: false,
    article_type: 'article',
  });

  // Load article and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        const [articleRes, categoriesRes] = await Promise.all([
          fetch(`/api/admin/articles/${articleId}`),
          fetch('/api/admin/categories'),
        ]);

        const articleData = await articleRes.json();
        const categoriesData = await categoriesRes.json();

        console.log('Article response:', articleRes.status, articleData); // Debug
        console.log('Article ID:', articleId); // Debug

        if (articleRes.ok && articleData.article) {
          const art = articleData.article;
          setForm({
            title: art.title || '',
            slug: art.slug || '',
            excerpt: art.excerpt || '',
            short_description: art.short_description || '',
            content: art.content || '',
            category_id: art.category_id ? String(art.category_id) : '',
            featured_image: art.featured_image || '',
            short_description_image: art.short_description_image || null,
            price: art.price ? String(art.price) : '',
            is_purchasable: art.is_purchasable ? true : false,
            stock: art.stock ? String(art.stock) : '',
            status: art.status || 'draft',
            template: art.template || 'standard',
            is_main_article: art.is_main_article ? true : false,
            article_type: art.article_type || 'article',
          });
        } else {
          setError(articleData.error || 'Article not found');
        }

        setCategories(categoriesData.categories || []);
        setLoading(false);
      } catch (err) {
        console.error('Load error:', err);
        setError('Failed to load article: ' + err.message);
        setLoading(false);
      }
    };

    loadData();
  }, [articleId]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  const [saveSuccess, setSaveSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaveSuccess(false);
    setLoading(true);

    try {
      const pageHtml = pageBuilderRef.current?.getHtml() || form.content;

      const res = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          content: pageHtml,
          short_description: form.short_description || null,
          short_description_image: form.short_description_image || null,
          price: form.price ? parseFloat(form.price) : null,
          stock: form.stock ? parseInt(form.stock) : null,
          is_purchasable: form.is_purchasable ? 1 : 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update article');
        setLoading(false);
        return;
      }

      setSaveSuccess(true);
      setLoading(false);
      // Update form.content with the saved HTML so subsequent saves don't revert
      setForm((prev) => ({ ...prev, content: pageHtml }));
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading article...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <a href="/admin/articles" className={styles.backLink}>← חזור לכתבות</a>
        <h1>עריכת כתבה</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}
        {saveSuccess && <div className={styles.success}>✓ Article saved successfully!</div>}

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
                onChange={handleChange}
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

          {/* RIGHT COLUMN: Short Description, Images & Options */}
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

            <ArticleImageGallery
              articleId={articleId}
              selectedImage={form.short_description_image}
              onSelectImage={(imageId) => setForm((prev) => ({ ...prev, short_description_image: imageId }))}
              disabled={loading}
            />

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
            {loading ? 'שומר...' : 'עדכן כתבה'}
          </button>
        </div>
      </form>
    </div>
  );
}
