'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import BannerSlotRenderer from './BannerSlotRenderer';
import EventsBox from './EventsBox';
import WeeklyPrayerBox from './WeeklyPrayerBox';
import ContactForm from './ContactForm';
import NewsBox from './NewsBox';
import ArticlesSlider from './ArticlesSlider';
import ArticlesCube from './ArticlesCube';
import StoreHoursBar from './StoreHoursBar';
import { calculateMasonryLayout, calculateSmartGridLayout } from '@/lib/smart-grid-template';
import styles from './SmartGridRenderer.module.css';

export default function SmartGridRenderer({ config, previewWidth = null }) {
  const gridRef = useRef(null);
  const [measuredWidth, setMeasuredWidth] = useState(1200);
  const [hiddenControls, setHiddenControls] = useState(() => new Set());

  useEffect(() => {
    if (previewWidth) return undefined;
    if (!gridRef.current) return undefined;
    const observer = new ResizeObserver(([entry]) => setMeasuredWidth(entry.contentRect.width));
    observer.observe(gridRef.current);
    return () => observer.disconnect();
  }, [previewWidth]);

  const width = previewWidth || measuredWidth;
  const columns = width <= 600
    ? config.mobileColumns
    : width <= 900
      ? config.tabletColumns
      : config.desktopColumns;
  const activeControls = useMemo(() => (
    [...(config.controls || [])]
      .filter((control) => control.active && !hiddenControls.has(control.id))
      .sort((a, b) => a.order - b.order)
  ), [config.controls, hiddenControls]);
  const layout = useMemo(
    () => calculateSmartGridLayout(activeControls, columns, config.autoFill),
    [activeControls, columns, config.autoFill]
  );
  const masonryLayout = useMemo(
    () => calculateMasonryLayout(activeControls, columns),
    [activeControls, columns]
  );

  const setControlVisibility = (id, visible) => {
    setHiddenControls((current) => {
      const next = new Set(current);
      if (visible) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderControl = (control) => {
    switch (control.id) {
      case 'banner':
        return <BannerSlotRenderer slotId={control.bannerSlotId || 1} onVisibilityChange={(visible) => setControlVisibility(control.id, visible)} />;
      case 'weekly-prayers': return <WeeklyPrayerBox />;
      case 'events': return <EventsBox />;
      case 'contact-form': return <ContactForm />;
      case 'news': return <NewsBox />;
      case 'articles-slider': return <ArticlesSlider categoryId={control.categoryId} />;
      case 'articles-cube': return <ArticlesCube categoryId={control.categoryId} />;
      case 'store-hours': return <StoreHoursBar />;
      default: return null;
    }
  };

  if (config.layoutMode === 'masonry') {
    const sections = [];
    masonryLayout.forEach((control) => {
      if (!sections[control.masonrySection]) {
        sections[control.masonrySection] = { columns: Array.from({ length: columns }, () => []), full: null };
      }
      if (control.isFull) sections[control.masonrySection].full = control;
      else sections[control.masonrySection].columns[control.actualColumn - 1].push(control);
    });

    return (
      <div ref={gridRef} className={styles.masonry} style={{ gap: `${config.gap}px` }}>
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className={styles.masonrySection} style={{ gap: `${config.gap}px` }}>
            {section.columns.some((column) => column.length > 0) && (
              <div className={styles.masonryColumns} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: `${config.gap}px` }}>
                {section.columns.map((column, columnIndex) => (
                  <div key={columnIndex} className={styles.masonryColumn} style={{ gap: `${config.gap}px` }}>
                    {column.map((control) => <div key={control.id} className={styles.control}>{renderControl(control)}</div>)}
                  </div>
                ))}
              </div>
            )}
            {section.full && <div className={styles.control}>{renderControl(section.full)}</div>}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={gridRef}
      className={styles.grid}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: `${config.gap}px` }}
    >
      {layout.map((control) => (
        <div
          key={control.id}
          className={styles.control}
          data-smart-control={control.id}
          style={{
            gridColumn: `${control.actualColumn} / span ${control.actualSpan}`,
            gridRow: control.actualRow,
          }}
        >
          {renderControl(control)}
        </div>
      ))}
    </div>
  );
}
