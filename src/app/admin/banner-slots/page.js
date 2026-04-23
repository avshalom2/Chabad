'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './banner-slots.module.css';

/**
 * Banner management component
 */
function BannerManager({ slot, onClose }) {
  const [banners, setBanners] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link_url: '',
    alt_text: '',
    description: '',
    is_active: true,
    sort_order: 0,
  });
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = (message, type = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchBanners();
  }, [slot.id]);

  const fetchBanners = async () => {
    try {
      const response = await fetch(
        `/api/admin/banner-slots/${slot.id}/banners`
      );
      if (!response.ok) throw new Error('Failed to fetch banners');
      const data = await response.json();
      setBanners(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast(`Error fetching banners: ${error.message}`, 'error');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formDataObj,
      });

      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();
      setFormData((prev) => ({ ...prev, image_url: url }));
      showToast('Image uploaded successfully');
    } catch (error) {
      showToast(`Upload failed: ${error.message}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      image_url: '',
      link_url: '',
      alt_text: '',
      description: '',
      is_active: true,
      sort_order: 0,
    });
    setEditingBannerId(null);
    setShowForm(false);
  };

  const handleSaveBanner = async () => {
    if (!formData.image_url) {
      showToast('Image URL is required', 'error');
      return;
    }

    try {
      if (editingBannerId) {
        // Update existing banner
        const response = await fetch(
          `/api/admin/banner-slots/${slot.id}/banners/${editingBannerId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) throw new Error('Failed to update banner');
        showToast('Banner updated successfully');
      } else {
        // Create new banner
        const response = await fetch(
          `/api/admin/banner-slots/${slot.id}/banners`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) throw new Error('Failed to create banner');
        showToast('Banner created successfully');
      }

      resetForm();
      fetchBanners();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleEditBanner = (banner) => {
    setEditingBannerId(banner.id);
    setFormData({
      title: banner.title || '',
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      alt_text: banner.alt_text || '',
      description: banner.description || '',
      is_active: banner.is_active === 1,
      sort_order: banner.sort_order,
    });
    setShowForm(true);
  };

  const handleDeleteBanner = async (bannerId) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const response = await fetch(
        `/api/admin/banner-slots/${slot.id}/banners/${bannerId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete banner');
      showToast('Banner deleted successfully');
      fetchBanners();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleToggleBannerStatus = async (banner) => {
    try {
      const response = await fetch(
        `/api/admin/banner-slots/${slot.id}/banners/${banner.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...banner, is_active: banner.is_active === 1 ? 0 : 1 }),
        }
      );

      if (!response.ok) throw new Error('Failed to update banner');
      showToast('Banner status updated');
      fetchBanners();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  return (
    <div className={styles.managerOverlay} onClick={onClose}>
      <div className={styles.managerModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.managerHeader}>
          <h3>Manage Banners: {slot.name}</h3>
          <button onClick={onClose} className={styles.closeBtn}>
            ✕
          </button>
        </div>

        {/* Toast notifications */}
        {toast && (
          <div className={`${styles.toast} ${styles[`toast-${toast.type}`]}`}>
            {toast.message}
          </div>
        )}

        {/* Banners list */}
        <div className={styles.bannersList}>
          {banners.length === 0 ? (
            <p className={styles.emptyMessage}>No banners yet. Create one to get started.</p>
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className={styles.bannerItem}>
                <img
                  src={banner.image_url}
                  alt={banner.alt_text || banner.title || 'Banner'}
                  className={styles.bannerPreview}
                />
                <div className={styles.bannerInfo}>
                  <h4>{banner.title || 'Untitled'}</h4>
                  {banner.link_url && <p className={styles.url}>{banner.link_url}</p>}
                  <p className={styles.description}>{banner.description}</p>
                </div>
                <div className={styles.bannerActions}>
                  <button
                    onClick={() => handleToggleBannerStatus(banner)}
                    className={`${styles.statusBtn} ${banner.is_active ? styles.active : styles.inactive}`}
                  >
                    {banner.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => handleEditBanner(banner)}
                    className={styles.editBtn}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBanner(banner.id)}
                    className={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Banner form */}
        {showForm && (
          <div className={styles.bannerForm}>
            <h4>{editingBannerId ? 'Edit Banner' : 'New Banner'}</h4>

            <div className={styles.formGroup}>
              <label>Image *</label>
              {formData.image_url && (
                <div className={styles.previewBox}>
                  <img src={formData.image_url} alt="Preview" />
                </div>
              )}
              <label className={styles.uploadLabel}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
                <span className={styles.uploadBtn}>
                  {uploading ? 'Uploading...' : 'Choose Image'}
                </span>
              </label>
            </div>

            <div className={styles.formGroup}>
              <label>
                Title (optional)
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Banner title"
                />
              </label>
            </div>

            <div className={styles.formGroup}>
              <label>
                Link URL (optional)
                <input
                  type="url"
                  name="link_url"
                  value={formData.link_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
              </label>
            </div>

            <div className={styles.formGroup}>
              <label>
                Alt Text
                <input
                  type="text"
                  name="alt_text"
                  value={formData.alt_text}
                  onChange={handleInputChange}
                  placeholder="Description for accessibility"
                />
              </label>
            </div>

            <div className={styles.formGroup}>
              <label>
                Description (optional)
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Banner description"
                />
              </label>
            </div>

            <div className={styles.formGroup}>
              <label>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                />
                Active
              </label>
            </div>

            <div className={styles.formActions}>
              <button onClick={handleSaveBanner} className={styles.saveBtn}>
                {editingBannerId ? 'Update' : 'Create'}
              </button>
              <button onClick={resetForm} className={styles.cancelBtn}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className={styles.addBannerBtn}
          >
            + Add Banner
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Main admin page for banner slots
 */
export default function AdminBannerSlotsPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    location: '',
    max_width: 1200,
    max_height: 300,
    aspect_ratio: '16:9',
    rotation_delay: 5000,
    design_type: 'auto-slide',
    is_active: true,
    sort_order: 0,
  });

  const showToast = (message, type = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/banner-slots');
      if (!response.ok) throw new Error('Failed to fetch banner slots');
      const data = await response.json();
      setSlots(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'max_width' || name === 'max_height' || name === 'rotation_delay' || name === 'sort_order' ? parseInt(value) : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      location: '',
      max_width: 1200,
      max_height: 300,
      aspect_ratio: '16:9',
      rotation_delay: 5000,
      design_type: 'auto-slide',
      is_active: true,
      sort_order: 0,
    });
    setEditingSlotId(null);
    setShowForm(false);
  };

  const handleSaveSlot = async () => {
    if (!formData.name || !formData.slug) {
      showToast('Name and slug are required', 'error');
      return;
    }

    try {
      const method = editingSlotId ? 'PUT' : 'POST';
      const url = editingSlotId
        ? `/api/admin/banner-slots/${editingSlotId}`
        : '/api/admin/banner-slots';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save banner slot');
      showToast(
        editingSlotId ? 'Slot updated successfully' : 'Slot created successfully'
      );

      resetForm();
      fetchSlots();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleEditSlot = (slot) => {
    setEditingSlotId(slot.id);
    setFormData({
      name: slot.name,
      slug: slot.slug,
      description: slot.description || '',
      location: slot.location || '',
      max_width: slot.max_width,
      max_height: slot.max_height,
      aspect_ratio: slot.aspect_ratio,
      rotation_delay: slot.rotation_delay,
      design_type: slot.design_type || 'auto-slide',
      is_active: slot.is_active === 1,
      sort_order: slot.sort_order,
    });
    setShowForm(true);
  };

  const handleDeleteSlot = async (slotId) => {
    if (!confirm('Are you sure? This will delete all banners in this slot.')) return;

    try {
      const response = await fetch(`/api/admin/banner-slots/${slotId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete banner slot');
      showToast('Slot deleted successfully');
      fetchSlots();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  if (loading) {
    return <div className={styles.container}><p>Loading...</p></div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Banner Slots Management</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className={styles.createBtn}
          >
            + New Banner Slot
          </button>
        )}
      </div>

      {/* Toast notifications */}
      {toast && (
        <div className={`${styles.toast} ${styles[`toast-${toast.type}`]}`}>
          {toast.message}
        </div>
      )}

      {/* Slot form */}
      {showForm && (
        <div className={styles.formSection}>
          <h2>{editingSlotId ? 'Edit Banner Slot' : 'Create New Banner Slot'}</h2>

          <div className={styles.formGrid}>
            {/* LEFT COLUMN */}
            <div className={styles.formGroup}>
              <label>
                Name *
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Homepage Hero"
                />
              </label>
            </div>

            {/* MIDDLE COLUMN */}
            <div className={styles.formGroup}>
              <label>
                Location
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. homepage, sidebar, footer"
                />
              </label>
            </div>

            {/* RIGHT COLUMN */}
            <div className={styles.formGroup}>
              <label>
                Design Type
                <select name="design_type" value={formData.design_type} onChange={handleInputChange}>
                  <option value="auto-slide">Auto-Slide (continuous rotation)</option>
                  <option value="carousel-dots">Carousel with Dots (click to navigate)</option>
                  <option value="carousel-arrows">Carousel with Arrows (side navigation)</option>
                </select>
              </label>
            </div>

            {/* LEFT COLUMN */}
            <div className={styles.formGroup}>
              <label>
                Slug *
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="e.g. homepage-hero"
                />
              </label>
            </div>

            {/* MIDDLE COLUMN */}
            <div className={styles.formGroup}>
              <label>
                Aspect Ratio
                <select name="aspect_ratio" value={formData.aspect_ratio} onChange={handleInputChange}>
                  <option value="16:9">16:9 (Wide)</option>
                  <option value="4:3">4:3 (Standard)</option>
                  <option value="1:1">1:1 (Square)</option>
                  <option value="3:2">3:2 (Classic)</option>
                </select>
              </label>
            </div>

            {/* RIGHT COLUMN */}
            <div className={styles.formGroup}>
              <label>
                Sort Order
                <input
                  type="number"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleInputChange}
                />
              </label>
            </div>

            {/* LEFT COLUMN */}
            <div className={styles.formGroup}>
              <label>
                Max Width (px)
                <input
                  type="number"
                  name="max_width"
                  value={formData.max_width}
                  onChange={handleInputChange}
                  min="100"
                  max="2000"
                />
              </label>
            </div>

            {/* MIDDLE COLUMN */}
            <div className={styles.formGroup}>
              <label>
                Max Height (px)
                <input
                  type="number"
                  name="max_height"
                  value={formData.max_height}
                  onChange={handleInputChange}
                  min="50"
                  max="1000"
                />
              </label>
            </div>

            {/* RIGHT COLUMN */}
            <div className={styles.formGroup}>
              <label>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                />
                Active
              </label>
            </div>

            {/* LEFT COLUMN */}
            <div className={styles.formGroup}>
              <label>
                Rotation Delay (ms)
                <input
                  type="number"
                  name="rotation_delay"
                  value={formData.rotation_delay}
                  onChange={handleInputChange}
                  min="1000"
                  max="30000"
                  step="1000"
                />
              </label>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>
              Description
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe this banner slot..."
              />
            </label>
          </div>

          <div className={styles.formActions}>
            <button onClick={handleSaveSlot} className={styles.saveBtn}>
              {editingSlotId ? 'Update' : 'Create'} Slot
            </button>
            <button onClick={resetForm} className={styles.cancelBtn}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Slots list */}
      <div className={styles.slotsList}>
        {slots.length === 0 ? (
          <p className={styles.emptyMessage}>No banner slots yet. Create one to start.</p>
        ) : (
          slots.map((slot) => (
            <div key={slot.id} className={styles.slotCard}>
              <div className={styles.slotHeader}>
                <div>
                  <h3>{slot.name}</h3>
                  <p className={styles.slug}>{slot.slug}</p>
                  {slot.location && <p className={styles.location}>Location: {slot.location}</p>}
                </div>
                <span
                  className={`${styles.status} ${slot.is_active ? styles.active : styles.inactive}`}
                >
                  {slot.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {slot.description && <p className={styles.description}>{slot.description}</p>}

              <div className={styles.slotConfig}>
                <span>Width: {slot.max_width}px</span>
                <span>Height: {slot.max_height}px</span>
                <span>Ratio: {slot.aspect_ratio}</span>
                <span>Rotation: {slot.rotation_delay}ms</span>
                <span className={styles.designType}>Design: {slot.design_type}</span>
                <span className={styles.bannerCount}>
                  {slot.banners?.length || 0} banner(s)
                </span>
              </div>

              <div className={styles.slotActions}>
                <button
                  onClick={() => setSelectedSlot(slot)}
                  className={styles.managerBtn}
                >
                  Manage Banners
                </button>
                <button
                  onClick={() => handleEditSlot(slot)}
                  className={styles.editBtn}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteSlot(slot.id)}
                  className={styles.deleteBtn}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Banner manager modal */}
      {selectedSlot && (
        <BannerManager
          slot={selectedSlot}
          onClose={() => {
            setSelectedSlot(null);
            fetchSlots();
          }}
        />
      )}
    </div>
  );
}
