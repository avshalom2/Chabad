# Approved visual language

Reference: user-supplied `succot_guide_unified.pdf`, inspected visually on all three pages. SHA-256: `B52EF849E728D46EAA22CFFD9255090A61B92FD63E06A6EB66B45144A1DD5FCC`.

## Measurements and appearance

- A4 portrait, 595.28 × 841.89 PDF points. Three pages in the example; page count is content-dependent.
- Full-width green gradient masthead on page one: dark forest green to medium green; centered bold white Hebrew title, white subtitle and a small pale-green rounded scenario badge.
- Page background is warm off-white, measured approximately `#faf9f6`.
- Main content has about 15 mm side margins. Clear air between numbered sections; compact, readable content inside cards.
- Dark-green right-aligned section headings have a short green vertical rule on their right.
- White cards have thin light-gray borders, about 5–6 px rounded corners, and generous padding. Section headings sit outside the card.
- Prayer/recitation panels use pale green, a stronger green right border and a bold green label. Instructions use dark blue-gray body text.
- Conditional Shabbat additions are bold vivid blue, with parentheses or an explicit condition label. Pale-yellow notices with an amber accent distinguish cautions; important caution headings may be red.
- Tables have a dark-green caption, green column headers with white text, thin pale-green grid lines and alternating white/light-cream rows. Repeat headers when a table continues.
- Footer is small muted gray, with the guide name on the right and “עמוד X מתוך Y” on the left.

Fonts embedded in the original PDF: Noto Sans Hebrew regular/bold and DejaVu Sans regular/bold. Prefer Noto Sans Hebrew if installed; use a Hebrew-capable local fallback such as Arial and check niqqud visually. The CSS sizes are reconstruction starting points, not extracted exact measurements.

## Content structure observed

1. Preparation, eruv tavshilin where applicable, candle lighting and its blessings.
2. Full evening Kiddush with clearly marked conditional additions.
3. Sukkah observance and a day-by-day Ushpizin table.
4. Daytime four species: numbered actions, blessings and Shabbat notice.
5. Prayer reminders and closing notes.

Use the structure appropriate to the target holiday. The example's topic list does not make every Sukkot-specific section mandatory for other guides. Tables organize genuinely tabular information; they are not decoration.

## Rosh Hashanah variant

The user's earlier screenshot shows a navy-to-blue rounded title banner, a gold lower edge, navy headings with gold right accents, white rounded section cards, and cream blessing boxes with orange dashed borders. `body.rosh-hashanah` implements this related palette. The screenshot is a secondary reference; do not mislabel the green Sukkot PDF as blue.

## Improvements that preserve the approved style

The reference splits some prayer panels across pages and leaves substantial blank space on the last page. Preserve its design language while improving page breaks; do not reproduce those artifacts deliberately. Keep a short prayer and its label together. Use labels plus color so conditional instructions survive grayscale printing.

Visual references: [page 1](sukkot-page-1.png), [page 2](sukkot-page-2.png), [page 3](sukkot-page-3.png).
