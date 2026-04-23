'use client';

import { useState } from 'react';
import styles from './editors.module.css';

export default function ControlDataEditor({ onSave, onClose }) {
  const [selectedControl, setSelectedControl] = useState('');

  const controls = [
    {
      id: 'shabbat',
      name: 'ShabbatBox',
      description: 'Display Shabbat & holiday times',
      component: '<ShabbatBox />'
    },
    {
      id: 'events',
      name: 'EventsBox',
      description: 'Display upcoming events calendar',
      component: '<EventsBox />'
    }
  ];

  const handleSave = () => {
    if (!selectedControl) {
      alert('Please select a control');
      return;
    }

    const selected = controls.find(c => c.id === selectedControl);
    
    // Save component tag wrapped in a content-placeholder div for click detection
    const componentTag = selected.id === 'events' ? '<eventsbox></eventsbox>' : '<shabbatbox></shabbatbox>';
    
    const htmlContent = `<div class="content-placeholder" style="display: inline-block; padding: 1.5rem; margin: 1rem 0; background: linear-gradient(135deg, #f5f0eb 0%, #faf8f5 100%); border: 2px dashed #6b1020; border-radius: 8px; text-align: center; color: #333; font-weight: 600; min-height: 100px; min-width: 300px;"><div style="font-size: 1.1rem; margin-bottom: 0.5rem;">${selected.id === 'events' ? '📅' : '🕯️'}</div><div style="font-size: 0.9rem;">${selected.name}</div><div style="font-size: 0.85rem; color: #666; margin-top: 0.5rem;">${selected.description}</div>${componentTag}</div>`;
    
    onSave(htmlContent);
  };

  return (
    <div className={styles.editor}>
      <div className={styles.formGroup}>
        <label>Select Control Component</label>
        <div className={styles.controlOptions}>
          {controls.map(control => (
            <label key={control.id} className={styles.controlOption}>
              <input
                type="radio"
                name="control"
                value={control.id}
                checked={selectedControl === control.id}
                onChange={(e) => setSelectedControl(e.target.value)}
              />
              <div className={styles.controlInfo}>
                <div className={styles.controlName}>{control.name}</div>
                <div className={styles.controlDesc}>{control.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
        <button className={styles.saveBtn} onClick={handleSave} disabled={!selectedControl}>Save</button>
      </div>
    </div>
  );
}
