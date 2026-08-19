'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Assistant, Frank_Ruhl_Libre } from 'next/font/google';
import SmartGridRenderer from './SmartGridRenderer';
import {
  calculateMasonryLayout,
  calculateSmartGridLayout,
  createDefaultSmartGridConfig,
  parseSmartGridTemplate,
  serializeSmartGridTemplate,
} from '@/lib/smart-grid-template';
import styles from './SmartGridTemplateEditor.module.css';

const assistant = Assistant({ subsets: ['hebrew'], display: 'swap' });
const frankRuhl = Frank_Ruhl_Libre({ subsets: ['hebrew'], display: 'swap', variable: '--smart-grid-heading-font' });

const PLACEMENTS = [
  ['auto', 'אוטומטי'],
  ['prefer-left', 'העדף שמאל'],
  ['prefer-right', 'העדף ימין'],
  ['fixed-left', 'שמאל קבוע'],
  ['fixed-right', 'ימין קבוע'],
  ['full', 'רוחב מלא'],
];

export default function SmartGridTemplateEditor({ templateId, initialHtml }) {
  const router = useRouter();
  const initialConfig = useMemo(() => parseSmartGridTemplate(initialHtml) || createDefaultSmartGridConfig(), [initialHtml]);
  const [config, setConfig] = useState(initialConfig);
  const [device, setDevice] = useState('desktop');
  const [saving, setSaving] = useState(false);
  const [savedHtml, setSavedHtml] = useState(initialHtml);
  const [saveNotice, setSaveNotice] = useState('');
  const previewWidth = device === 'mobile' ? 385 : device === 'tablet' ? 768 : 1200;
  const columns = device === 'mobile' ? config.mobileColumns : device === 'tablet' ? config.tabletColumns : config.desktopColumns;
  const sortedActiveControls = [...config.controls].filter((control) => control.active).sort((a, b) => a.order - b.order);
  const diagnostics = config.layoutMode === 'masonry'
    ? calculateMasonryLayout(sortedActiveControls, columns)
    : calculateSmartGridLayout(sortedActiveControls, columns, config.autoFill);
  const currentHtml = serializeSmartGridTemplate(config);

  const updateConfig = (updates) => setConfig((current) => ({ ...current, ...updates }));
  const updateControl = (id, updates) => setConfig((current) => ({
    ...current,
    controls: current.controls.map((control) => control.id === id ? { ...control, ...updates } : control),
  }));
  const moveControl = (id, direction) => setConfig((current) => {
    const controls = [...current.controls].sort((a, b) => a.order - b.order);
    const index = controls.findIndex((control) => control.id === id);
    const target = index + direction;
    if (target < 0 || target >= controls.length) return current;
    [controls[index], controls[target]] = [controls[target], controls[index]];
    return { ...current, controls: controls.map((control, order) => ({ ...control, order: order + 1 })) };
  });

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/hp-templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ homepageHtml: currentHtml }),
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Save failed');
      setSavedHtml(currentHtml);
      router.refresh();
      setSaveNotice('תבנית הגריד החכם נשמרה בהצלחה.');
      window.setTimeout(() => setSaveNotice(''), 2000);
    } catch (error) {
      alert(`לא ניתן לשמור את התבנית: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`${styles.editor} ${assistant.className} ${frankRuhl.variable}`}>
      {saveNotice && <div className={styles.saveNotice}>{saveNotice}</div>}
      <div className={styles.toolbar}>
        <div className={styles.brand}>
          <span>ב״ה</span>
          <div><strong>סימולטור גריד חכם – בית חב״ד</strong><small>מערכת ניהול ותצוגה מקדימה לרכיבי דף הבית</small></div>
        </div>
        <div className={styles.devices}>
          <button className={device === 'desktop' ? styles.activeDevice : ''} onClick={() => setDevice('desktop')}>🖥️ דסקטופ</button>
          <button className={device === 'tablet' ? styles.activeDevice : ''} onClick={() => setDevice('tablet')}>📱 טאבלט</button>
          <button className={device === 'mobile' ? styles.activeDevice : ''} onClick={() => setDevice('mobile')}>📲 מובייל</button>
        </div>
        <button className={styles.save} onClick={save} disabled={saving}>{saving ? 'שומר…' : '💾 שמירת הגדרות'}</button>
        <span className={`${styles.saveState} ${currentHtml === savedHtml ? styles.saved : styles.pending}`}>
          {currentHtml === savedHtml ? 'כל השינויים נשמרו' : 'שינויים בתצוגה מקדימה בלבד — טרם נשמרו'}
        </span>
      </div>

      <div className={styles.workspace}>
        <aside className={styles.settings}>
          <h3>⚙️ הגדרות גריד רשת</h3>
          <div className={styles.gridSettings}>
            <label>מצב פריסה:<select value={config.layoutMode || 'grid'} onChange={(event) => updateConfig({ layoutMode: event.target.value })}><option value="grid">גריד רגיל</option><option value="masonry">בנייה חופשית (Masonry)</option></select></label>
            <label>עמודות בדסקטופ:<select value={config.desktopColumns} onChange={(event) => updateConfig({ desktopColumns: Number(event.target.value) })}>{[1,2,3,4].map((value) => <option key={value} value={value}>{value} {value === 1 ? 'עמודה' : 'עמודות'}</option>)}</select></label>
            <label>עמודות בטאבלט:<select value={config.tabletColumns} onChange={(event) => updateConfig({ tabletColumns: Number(event.target.value) })}>{[1,2,3].map((value) => <option key={value} value={value}>{value} {value === 1 ? 'עמודה' : 'עמודות'}</option>)}</select></label>
            <label>עמודות במובייל:<select value={config.mobileColumns} onChange={(event) => updateConfig({ mobileColumns: Number(event.target.value) })}>{[1,2].map((value) => <option key={value} value={value}>{value} {value === 1 ? 'עמודה' : 'עמודות'}</option>)}</select></label>
            <label>מרווח בין רכיבים (px)<input type="number" min="0" max="50" value={config.gap} onChange={(event) => updateConfig({ gap: Number(event.target.value) })} /></label>
          </div>
          {config.layoutMode !== 'masonry' && <div className={styles.toggleRow}><span>מילוי חללים אוטומטי (Dense):</span><label className={styles.switch}><input type="checkbox" checked={config.autoFill} onChange={(event) => updateConfig({ autoFill: event.target.checked })} /><i /></label></div>}
          {config.layoutMode === 'masonry' && <p className={styles.masonryHint}>כדי להצמיד את האירועים מתחת לזמני התפילה: באנר — שמאל קבוע, זמני תפילה — ימין קבוע, אירועים — ימין קבוע.</p>}

          <h3>🧩 ניהול רכיבים ומיקומים</h3>
          <p className={styles.helpText}>ניתן לגרור רכיבים כדי לשנות את סדר המיקום שלהם.</p>
          <div className={styles.controls}>
            {[...config.controls].sort((a, b) => a.order - b.order).map((control, index) => (
              <div key={control.id} className={styles.controlCard}>
                <div className={styles.controlHeader}>
                  <strong><span>{control.order}</span> {control.label}</strong>
                  <label className={styles.switch}><input type="checkbox" checked={control.active} onChange={(event) => updateControl(control.id, { active: event.target.checked })} /><i /></label>
                </div>
                <div className={styles.controlFields}>
                  <label>מיקום (Placement):<select value={control.placement} onChange={(event) => updateControl(control.id, { placement: event.target.value })}>{PLACEMENTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                  <label>רוחב (Span):<select value={control.span} onChange={(event) => updateControl(control.id, { span: Number(event.target.value) })}>{[1,2,3,4].map((value) => <option key={value} value={value}>{value} {value === 1 ? 'עמודה' : 'עמודות'}</option>)}</select></label>
                  {control.id === 'banner' && <label>מזהה משבצת באנר<input type="number" min="1" value={control.bannerSlotId || 1} onChange={(event) => updateControl(control.id, { bannerSlotId: Number(event.target.value) })} /></label>}
                  {(control.id === 'articles-cube' || control.id === 'articles-slider' || control.id === 'news') && <label>מזהה קטגוריה<input type="number" min="1" value={control.categoryId || ''} onChange={(event) => updateControl(control.id, { categoryId: Number(event.target.value) || null })} /></label>}
                </div>
                <div className={styles.moveButtons}>
                  <button disabled={index === 0} onClick={() => moveControl(control.id, -1)}>למעלה</button>
                  <button disabled={index === config.controls.length - 1} onClick={() => moveControl(control.id, 1)}>למטה</button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className={styles.previewArea}>
          <div className={styles.previewSummary}>
            תצוגה מקדימה: {columns} {columns === 1 ? 'עמודה' : 'עמודות'} · מרווח {config.gap}px · {config.layoutMode === 'masonry' ? 'בנייה חופשית' : config.autoFill ? 'מילוי חללים פעיל' : 'מילוי חללים כבוי'}
          </div>
          <div className={styles.previewFrame} style={{ maxWidth: previewWidth }}>
            <SmartGridRenderer
              config={config}
              previewWidth={previewWidth}
            />
          </div>
          <div className={styles.diagnostics}>
            <h3>📊 אבחון מיקומי רכיבים</h3>
            <table><thead><tr><th>רכיב</th><th>סדר</th><th>מיקום</th><th>שורה</th><th>עמודה</th><th>רוחב</th></tr></thead>
              <tbody>{diagnostics.map((control) => <tr key={control.id}><td>{control.label}</td><td>{control.order}</td><td>{control.placement}</td><td>{config.layoutMode === 'masonry' ? `מקטע ${control.masonrySection + 1}` : control.actualRow}</td><td>{control.actualColumn}</td><td>{control.actualSpan}</td></tr>)}</tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
