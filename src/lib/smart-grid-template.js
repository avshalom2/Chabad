export const SMART_GRID_TEMPLATE_TYPE = 'smart-grid-v1';

export const SMART_GRID_CONTROL_DEFINITIONS = [
  { id: 'banner', label: 'באנר ראשי', defaultSpan: 2, bannerSlotId: 1 },
  { id: 'weekly-prayers', label: 'זמני תפילות השבוע', defaultSpan: 1 },
  { id: 'events', label: 'אירועים קרובים', defaultSpan: 1 },
  { id: 'store-hours', label: 'שעות פתיחת החנות', defaultSpan: 2 },
  { id: 'contact-form', label: 'טופס יצירת קשר', defaultSpan: 1 },
  { id: 'articles-cube', label: 'קוביות מאמרים', defaultSpan: 2, categoryId: 8 },
  { id: 'articles-slider', label: 'סליידר כתבות', defaultSpan: 2 },
  { id: 'news', label: 'מבזקי חדשות', defaultSpan: 1 },
];

export function createDefaultSmartGridConfig() {
  return {
    type: SMART_GRID_TEMPLATE_TYPE,
    desktopColumns: 3,
    tabletColumns: 2,
    mobileColumns: 1,
    gap: 18,
    autoFill: true,
    layoutMode: 'grid',
    controls: SMART_GRID_CONTROL_DEFINITIONS.map((definition, index) => ({
      ...definition,
      active: true,
      order: index + 1,
      placement: definition.id === 'store-hours' ? 'full' : 'auto',
      span: definition.defaultSpan,
    })),
  };
}

export function serializeSmartGridTemplate(config) {
  const safeJson = JSON.stringify(config).replace(/</g, '\\u003c');
  return `<div data-template-type="${SMART_GRID_TEMPLATE_TYPE}"><script type="application/json" data-smart-grid-config>${safeJson}</script></div>`;
}

export function parseSmartGridTemplate(html) {
  if (typeof html !== 'string' || !html.includes(`data-template-type="${SMART_GRID_TEMPLATE_TYPE}"`)) return null;

  const match = html.match(/<script[^>]*data-smart-grid-config[^>]*>([\s\S]*?)<\/script>/i);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[1]);
    if (parsed?.type !== SMART_GRID_TEMPLATE_TYPE) return null;
    return {
      ...parsed,
      controls: (parsed.controls || []).map((control) => {
        const definition = SMART_GRID_CONTROL_DEFINITIONS.find((item) => item.id === control.id);
        return definition ? { ...control, label: definition.label } : control;
      }),
    };
  } catch {
    return null;
  }
}

export function calculateSmartGridLayout(controls, columnCount, autoFill = true) {
  const columns = Math.max(1, Number(columnCount) || 1);
  const occupied = [];
  let cursorRow = 0;
  let cursorColumn = 0;

  const rowAt = (row) => {
    if (!occupied[row]) occupied[row] = Array(columns).fill(false);
    return occupied[row];
  };
  const fits = (row, start, span) => (
    start >= 0 && start + span <= columns && rowAt(row).slice(start, start + span).every((cell) => !cell)
  );
  const firstFit = (row, span) => {
    for (let start = 0; start <= columns - span; start += 1) {
      if (fits(row, start, span)) return start;
    }
    return -1;
  };

  return controls.map((control) => {
    const span = control.placement === 'full'
      ? columns
      : Math.min(columns, Math.max(1, Number(control.span) || 1));
    const preferredStart = control.placement.endsWith('left') ? columns - span : 0;
    const fixed = control.placement.startsWith('fixed');
    const preferred = control.placement.startsWith('prefer');
    let row = autoFill ? 0 : cursorRow;
    let start = -1;

    while (start < 0) {
      if (control.placement === 'full') {
        start = fits(row, 0, span) ? 0 : -1;
      } else if (fixed) {
        start = fits(row, preferredStart, span) ? preferredStart : -1;
      } else if (preferred && fits(row, preferredStart, span)) {
        start = preferredStart;
      } else {
        start = firstFit(row, span);
      }

      if (start < 0) row += 1;
    }

    for (let column = start; column < start + span; column += 1) rowAt(row)[column] = true;
    if (!autoFill) {
      cursorRow = row;
      cursorColumn = start + span;
      if (cursorColumn >= columns) {
        cursorRow += 1;
        cursorColumn = 0;
      }
    }

    return { ...control, actualRow: row + 1, actualColumn: start + 1, actualSpan: span };
  });
}

export function calculateMasonryLayout(controls, columnCount) {
  const columns = Math.max(1, Number(columnCount) || 1);
  const columnLoads = Array(columns).fill(0);
  let section = 0;

  return controls.map((control) => {
    const isFull = control.placement === 'full';
    if (isFull) {
      const result = { ...control, masonrySection: section, actualColumn: 1, actualSpan: columns, isFull: true };
      section += 1;
      columnLoads.fill(0);
      return result;
    }

    let column;
    if (control.placement.endsWith('left')) {
      column = columns - 1;
    } else if (control.placement.endsWith('right')) {
      column = 0;
    } else {
      column = columnLoads.indexOf(Math.min(...columnLoads));
    }
    columnLoads[column] += 1;
    return { ...control, masonrySection: section, actualColumn: column + 1, actualSpan: 1, isFull: false };
  });
}
