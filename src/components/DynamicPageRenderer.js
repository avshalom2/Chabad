'use client';
import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import EventsBox from '@/components/EventsBox';
import ShabbatCompactBox from '@/components/ShabbatCompactBox';
import ArticlesSlider from '@/components/ArticlesSlider';
import styles from './DynamicPageRenderer.module.css';

const COMPONENT_MAP = {
  'events-box': EventsBox,
  'shabbat-box': ShabbatCompactBox,
  'articles-slider': ArticlesSlider,
};

export default function DynamicPageRenderer({ html }) {
  const containerRef = useRef(null);
  const rootsRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current || !html) return;

    rootsRef.current.forEach(r => r.unmount());
    rootsRef.current = [];

    containerRef.current.innerHTML = html;

    // Use computed style to detect flex containers (works with CSS classes, not just inline styles)
    const allNodes = Array.from(containerRef.current.querySelectorAll('*'));
    allNodes.forEach(el => {
      const computed = window.getComputedStyle(el);
      if (computed.display === 'flex' || computed.display === 'inline-flex') {
        el.setAttribute('data-flex-row', 'true');
        el.style.flexWrap = 'wrap'; // force wrap via inline style (overrides any class)
      }
      if (el.tagName === 'IMG') {
        el.style.maxWidth = '100%';
        el.style.height = 'auto';
      }
    });

    // Inject CSS for proper wrapping (elements maintain size, wrap to next line if no space)
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .dynamic-page-content * { box-sizing: border-box; }
      .dynamic-page-content img { max-width: 100%; height: auto; }
      [data-flex-row] { flex-wrap: wrap; }
      [data-flex-row] > * { min-width: 0; }
    `;
    containerRef.current.appendChild(styleEl);

    const placeholders = containerRef.current.querySelectorAll('[data-chabadcomponent]');
    placeholders.forEach(placeholder => {
      const componentName = placeholder.getAttribute('data-chabadcomponent');
      const Component = COMPONENT_MAP[componentName];
      if (!Component) return;

      // Strip editor preview styles before rendering
      placeholder.style.border = 'none';
      placeholder.style.backgroundColor = 'transparent';
      placeholder.style.minHeight = '';
      placeholder.style.padding = '';

      placeholder.innerHTML = '';
      const root = createRoot(placeholder);
      root.render(<Component />);
      rootsRef.current.push(root);
    });

    return () => {
      rootsRef.current.forEach(r => r.unmount());
      rootsRef.current = [];
    };
  }, [html]);

  if (!html) return null;

  return <div ref={containerRef} className={`${styles.renderer} dynamic-page-content`} dir="rtl" style={{ overflowX: 'hidden', width: '100%' }} />;
}
