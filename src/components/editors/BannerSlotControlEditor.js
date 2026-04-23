'use client';

import { useState, useEffect } from 'react';
import styles from './BannerSlotControlEditor.module.css';

export default function BannerSlotControlEditor({ elementHtml, onSave, onCancel }) {
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    fetchSlots();
    // Extract current slot ID if it exists
    extractCurrentSlotId();
  }, [elementHtml]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/banner-slots');
      const data = await response.json();
      setSlots(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching banner slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractCurrentSlotId = () => {
    if (!elementHtml) return;
    // Look for <banner_slot id="X"/> pattern
    const match = elementHtml.match(/<banner_slot\s+id=["'](\d+)["']\s*\/?>/i);
    if (match && match[1]) {
      setSelectedSlotId(parseInt(match[1]));
    }
  };

  const generateBannerCode = (slotId) => {
    return `<banner_slot id="${slotId}"/>`;
  };

  const handleSave = () => {
    if (!selectedSlotId) {
      alert('Please select a banner slot');
      return;
    }

    const code = generateBannerCode(selectedSlotId);
    onSave(code);
  };

  const handleCopyCode = () => {
    if (!selectedSlotId) return;
    const code = generateBannerCode(selectedSlotId);
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) {
    return (
      <div className={styles.editor}>
        <div className={styles.loading}>Loading banner slots...</div>
      </div>
    );
  }

  const selectedSlot = slots.find(s => s.id === selectedSlotId);
  const generatedCode = selectedSlotId ? generateBannerCode(selectedSlotId) : '';

  return (
    <div className={styles.editor}>
      <h3>Select Banner Slot</h3>

      <div className={styles.slotSelector}>
        <label>Available Slots:</label>
        <select
          value={selectedSlotId || ''}
          onChange={(e) => setSelectedSlotId(parseInt(e.target.value) || null)}
          className={styles.select}
        >
          <option value="">-- Choose a slot --</option>
          {slots.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {slot.name} ({slot.banners?.length || 0} banners)
            </option>
          ))}
        </select>
      </div>

      {selectedSlot && (
        <div className={styles.slotInfo}>
          <h4>{selectedSlot.name}</h4>
          <div className={styles.infoPair}>
            <span className={styles.label}>Slug:</span>
            <span>{selectedSlot.slug}</span>
          </div>
          <div className={styles.infoPair}>
            <span className={styles.label}>Location:</span>
            <span>{selectedSlot.location || 'Not specified'}</span>
          </div>
          <div className={styles.infoPair}>
            <span className={styles.label}>Size:</span>
            <span>{selectedSlot.max_width}x{selectedSlot.max_height}px</span>
          </div>
          <div className={styles.infoPair}>
            <span className={styles.label}>Aspect Ratio:</span>
            <span>{selectedSlot.aspect_ratio}</span>
          </div>
          <div className={styles.infoPair}>
            <span className={styles.label}>Rotation:</span>
            <span>{selectedSlot.rotation_delay}ms</span>
          </div>
          <div className={styles.infoPair}>
            <span className={styles.label}>Active:</span>
            <span>{selectedSlot.is_active ? '✓ Yes' : '✗ No'}</span>
          </div>
          <div className={styles.infoPair}>
            <span className={styles.label}>Banners:</span>
            <span>{selectedSlot.banners?.length || 0}</span>
          </div>
        </div>
      )}

      {generatedCode && (
        <div className={styles.codeOutput}>
          <label>Generated Code:</label>
          <div className={styles.codeBlock}>
            <code>{generatedCode}</code>
            <button
              onClick={handleCopyCode}
              className={styles.copyBtn}
              title="Copy to clipboard"
            >
              {copiedCode ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <p className={styles.hint}>
            This code will be inserted into your template. The frontend will automatically display the rotating banners.
          </p>
        </div>
      )}

      <div className={styles.actions}>
        <button onClick={handleSave} className={styles.saveBtn} disabled={!selectedSlotId}>
          Insert Banner Slot
        </button>
        <button onClick={onCancel} className={styles.cancelBtn}>
          Cancel
        </button>
      </div>
    </div>
  );
}
