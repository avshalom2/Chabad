'use client';

import EventsBox from '@/components/EventsBox';
import ShabbatCompactBox from '@/components/ShabbatCompactBox';
import NewsBox from '@/components/NewsBox';
import ArticlesSlider from '@/components/ArticlesSlider';
import BannerSlotRenderer from '@/components/BannerSlotRenderer';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './TemplateRenderer.module.css';

/**
 * Render template HTML with component tags dynamically replaced with React components
 */
export default function TemplateRenderer({ html }) {
  const containerRef = useRef(null);
  const [portalsMap, setPortalsMap] = useState({});

  useEffect(() => {
    if (!html || !containerRef.current) return;

    console.log('TemplateRenderer: Setting HTML content, length:', html.length);
    console.log('TemplateRenderer: HTML snippet:', html.substring(0, 300));

    // First, extract banner_slot tags from the HTML before setting innerHTML
    const bannerSlotRegex = /<banner_slot\s+id=["'](\d+)["']\s*\/?>/gi;
    let processedHtml = html;
    const bannerSlots = [];
    let match;

    while ((match = bannerSlotRegex.exec(html)) !== null) {
      bannerSlots.push({
        id: parseInt(match[1]),
        fullTag: match[0],
        index: match.index
      });
    }

    // Replace banner_slot tags with placeholder divs in the HTML
    if (bannerSlots.length > 0) {
      bannerSlots.reverse().forEach(slot => {
        const placeholder = `<div id="banner-slot-${slot.id}" class="banner-slot-placeholder"></div>`;
        processedHtml = processedHtml.substring(0, slot.index) + placeholder + processedHtml.substring(slot.index + slot.fullTag.length);
      });
    }

    // Set the HTML content
    containerRef.current.innerHTML = processedHtml;

    // Log all tags in the container for debugging
    const allDivs = containerRef.current.querySelectorAll('*');
    console.log('TemplateRenderer: Total elements in container:', allDivs.length);

    // Find all component tags - try multiple variations
    const componentElements = containerRef.current.querySelectorAll('eventsbox, shabbatbox, newsbox, articlesslider');
    console.log('Found component tags:', componentElements.length);

    // Log each one
    Array.from(componentElements).forEach((el, i) => console.log(`  [${i}] Tag name: ${el.tagName}`));

    const newPortalsMap = {};

    Array.from(componentElements).forEach((tag, idx) => {
      const componentName = tag.tagName.toLowerCase();
      const componentId = `portal-${idx}`;
      
      // Create a wrapper div to host the React component
      const wrapper = document.createElement('div');
      wrapper.id = componentId;
      
      // Check if this tag is inside a content-placeholder wrapper
      const contentPlaceholder = tag.closest('.content-placeholder');
      
      if (contentPlaceholder) {
        // Replace the entire content-placeholder wrapper with just our portal div
        // This removes all the admin styling and only shows the actual component
        contentPlaceholder.replaceWith(wrapper);
      } else {
        // Just replace the tag if it's not in a wrapper
        tag.replaceWith(wrapper);
      }

      // Store which component should go in this wrapper
      newPortalsMap[componentId] = {
        type: componentName === 'eventsbox' ? 'events' : componentName === 'shabbatbox' ? 'shabbat' : componentName === 'newsbox' ? 'news' : 'articles-slider',
        target: wrapper,
        categoryId: tag.getAttribute('category-id'),
        categorySlug: tag.getAttribute('category-slug'),
        categoryName: tag.getAttribute('category-name'),
      };
      
      console.log('Component', idx, ':', componentName, '-> portal-' + idx);
    });

    // Add banner slots to portals map
    bannerSlots.forEach(slot => {
      const placeholderId = `banner-slot-${slot.id}`;
      const placeholderElement = containerRef.current?.querySelector(`#${placeholderId}`);
      if (placeholderElement) {
        newPortalsMap[placeholderId] = {
          type: 'banner',
          target: placeholderElement,
          slotId: slot.id
        };
        console.log('Banner slot', slot.id, '-> banner-slot-' + slot.id);
      }
    });

    const portalUpdate = window.setTimeout(() => {
      setPortalsMap(newPortalsMap);
    }, 0);

    return () => window.clearTimeout(portalUpdate);
  }, [html]);

  // Render React components into their placeholder divs using createPortal
  const portals = Object.entries(portalsMap).map(([portalId, config]) => {
    const placeholderElement = config.target;
    if (!placeholderElement) return null;

    // Handle banner slots
    if (config.type === 'banner') {
      return createPortal(
        <BannerSlotRenderer key={portalId} slotId={config.slotId} />,
        placeholderElement
      );
    }

    if (config.type === 'articles-slider') {
      return createPortal(
        <ArticlesSlider
          key={portalId}
          categoryId={config.categoryId}
          categorySlug={config.categorySlug}
          categoryName={config.categoryName}
        />,
        placeholderElement
      );
    }

    if (config.type === 'news') {
      return createPortal(
        <NewsBox
          key={portalId}
          categoryId={config.categoryId}
          categorySlug={config.categorySlug}
          categoryName={config.categoryName}
        />,
        placeholderElement
      );
    }

    const Component = config.type === 'events' ? EventsBox : config.type === 'shabbat' ? ShabbatCompactBox : null;
    if (!Component) return null;
    return createPortal(
      <Component key={portalId} />,
      placeholderElement
    );
  });

  return (
    <>
      <div ref={containerRef} className={styles.container} />
      {portals}
    </>
  );
}
