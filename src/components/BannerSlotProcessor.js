'use client';

import { useMemo } from 'react';
import BannerSlotRenderer from './BannerSlotRenderer';

/**
 * Utility function to extract banner_slot tags from HTML
 * Returns array of { id, htmlBefore, htmlAfter } objects
 */
function extractBannerSlots(html) {
  const regex = /<banner_slot\s+id=["'](\d+)["']\s*\/?>/gi;
  const slots = [];
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(html)) !== null) {
    slots.push({
      id: parseInt(match[1]),
      index: match.index,
      length: match[0].length
    });
  }

  return slots;
}

/**
 * Component that renders HTML with banner_slot tags as actual BannerSlotRenderer components
 * 
 * Usage:
 * <BannerSlotProcessor html={templateHtml} />
 * 
 * The HTML can contain tags like:
 * <div class="content-placeholder"><banner_slot id="1"/></div>
 */
export default function BannerSlotProcessor({ html }) {
  const slots = useMemo(() => extractBannerSlots(html || ''), [html]);

  if (!html) return null;

  // If no banner slots, just render HTML as is
  if (slots.length === 0) {
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }

  // Replace banner_slot tags with placeholders and collect data
  let processedHtml = html;
  const slotComponents = {};

  slots.reverse().forEach(slot => {
    const placeholder = `__BANNER_SLOT_${slot.id}__`;
    const before = html.substring(0, slot.index);
    const after = html.substring(slot.index + slot.length);
    processedHtml = before + placeholder + after;
    slotComponents[slot.id] = (
      <BannerSlotRenderer key={`banner-${slot.id}`} slotId={slot.id} />
    );
  });

  // Split HTML by placeholders and interleave with components
  const parts = processedHtml.split(/__BANNER_SLOT_\d+__/);
  const regex = /__BANNER_SLOT_(\d+)__/g;
  const componentMatches = [];
  let m;

  while ((m = regex.exec(processedHtml)) !== null) {
    componentMatches.push({
      id: parseInt(m[1]),
      index: m.index
    });
  }

  return (
    <div>
      {parts.map((part, idx) => (
        <div key={`part-${idx}`}>
          {part && <div dangerouslySetInnerHTML={{ __html: part }} />}
          {componentMatches[idx] && slotComponents[componentMatches[idx].id]}
        </div>
      ))}
    </div>
  );
}

