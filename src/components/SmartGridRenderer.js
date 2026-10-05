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
import TorahVideosSlider from './TorahVideosSlider';
import { calculateMasonryLayout, calculateSmartGridLayout, getSmartGridControlType } from '@/lib/smart-grid-template';
import styles from './SmartGridRenderer.module.css';
import ClassicHomepage from './ClassicHomepage';
import ClassicHomepageShell from './ClassicHomepageShell';
import ClassicServicesIntro from './ClassicServicesIntro';
import ClassicContactSection from './ClassicContactSection';
import ClassicOpeningSection from './ClassicOpeningSection';
import ClassicLearningSection from './ClassicLearningSection';
import classicStyles from './ClassicHomepage.module.css';

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

  const controlAnchor = (control) => {
    if (!config.shellAnchors) return undefined;
    const type = getSmartGridControlType(control);
    if (activeControls.find(c => getSmartGridControlType(c) === type)?.id !== control.id) return undefined;
    return { 'weekly-prayers': 'classic-times', 'articles-cube': 'classic-services', 'articles-slider': 'classic-articles', 'contact-form': 'classic-contact' }[type];
  };

  const renderControl = (control) => {
    switch (getSmartGridControlType(control)) {
      case 'banner':
        return <BannerSlotRenderer slotId={control.bannerSlotId || 1} onVisibilityChange={(visible) => setControlVisibility(control.id, visible)} />;
      case 'weekly-prayers': return <WeeklyPrayerBox />;
      case 'events': return <EventsBox />;
      case 'contact-form': return <ContactForm />;
      case 'news': return <NewsBox categoryId={control.categoryId} />;
      case 'articles-slider': return <ArticlesSlider categoryId={control.categoryId} />;
      case 'articles-cube': return config.shellAnchors
        ? <div className={styles.classicServices}><ArticlesCube categoryId={control.categoryId} variant="classic" compact /></div>
        : <ArticlesCube categoryId={control.categoryId} />;
      case 'store-hours': return config.shellAnchors
        ? <div className={styles.classicStore} data-store-hours><StoreHoursBar variant="classic" compact /></div>
        : <StoreHoursBar />;
      case 'torah-videos': return <TorahVideosSlider onVisibilityChange={(visible) => setControlVisibility(control.id, visible)} />;
      default: return null;
    }
  };

  if (config.design === 'classic') {
    return <ClassicHomepage config={config} embedded={previewWidth !== null} />;
  }

  if (config.design === 'classic-shell') {
    const isOpeningControl = control => ['weekly-prayers', 'store-hours'].includes(getSmartGridControlType(control));
    const bodyConfig = { ...config, design: undefined, shellAnchors: true };
    const openingControls = activeControls.filter(isOpeningControl);
    const contactControls = activeControls.filter(control => getSmartGridControlType(control) === 'contact-form');
    const learningControls = [...(config.controls || [])].filter(control => control.active && getSmartGridControlType(control) === 'torah-videos').sort((a, b) => a.order - b.order);
    const remainingControls = config.controls.filter(control => !isOpeningControl(control) && !['contact-form', 'torah-videos'].includes(getSmartGridControlType(control)));
    return <ClassicHomepageShell embedded={previewWidth !== null}>
      <div className={classicStyles.page}><ClassicOpeningSection prayers={openingControls.filter(control => getSmartGridControlType(control) === 'weekly-prayers').map(control => <WeeklyPrayerBox key={control.id} variant="classic" />)} store={openingControls.filter(control => getSmartGridControlType(control) === 'store-hours').map(control => <StoreHoursBar key={control.id} variant="classic" />)} /></div>
      {remainingControls.some(control => control.active && getSmartGridControlType(control) === 'articles-cube') && <ClassicServicesIntro />}
      <SmartGridRenderer config={{ ...bodyConfig, controls: remainingControls }} previewWidth={previewWidth} />
      {learningControls.length > 0 && <div className={classicStyles.page} hidden={learningControls.every(control => hiddenControls.has(control.id))}><ClassicLearningSection>{learningControls.map(control => <TorahVideosSlider key={control.id} onVisibilityChange={visible => setControlVisibility(control.id, visible)} />)}</ClassicLearningSection></div>}
      {contactControls.length > 0 && <div className={classicStyles.page}><ClassicContactSection>{contactControls.map(control => <ContactForm key={control.id} variant="classic" />)}</ClassicContactSection></div>}
    </ClassicHomepageShell>;
  }

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
                    {column.map((control) => <div key={control.id} id={controlAnchor(control)} className={styles.control}>{renderControl(control)}</div>)}
                  </div>
                ))}
              </div>
            )}
            {section.full && <div id={controlAnchor(section.full)} className={styles.control}>{renderControl(section.full)}</div>}
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
          id={controlAnchor(control)}
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
