---
name: hebrew-holiday-guides
description: Create Hebrew RTL printable holiday instruction guides and PDFs in the user's approved Sukkot guide style, with prayer panels, chronological instructions, and clearly marked Shabbat variants. Use for requests such as מדריך לחג, PDF להדפסה, or כמו המדריך של סוכות/ראש השנה; not for ordinary website articles alone.
---

# Hebrew holiday guides

## Design authority

The user supplied `succot_guide_unified.pdf` and explicitly selected its design as the reference for future guides. Read [the visual specification](references/design.md) and view [the first reference page](references/sukkot-page-1.png) before designing. The full [reference PDF](references/succot_guide_unified.pdf) and remaining page previews preserve the actual example across sessions.

Use [assets/guide-template.html](assets/guide-template.html) and [assets/guide.css](assets/guide.css) as the starting point. The green Sukkot theme is the default. The `rosh-hashanah` theme provides the navy/blue/gold variant from the user's earlier screenshot. Do not default to the earlier sparse, plain-text six-page Sukkot draft.

## Content contract

- Write a usable chronological guide: preparations, candle lighting, evening prayers, Kiddush and meal, daytime observances, intermediate days if applicable, and conclusion of the holiday.
- Use numbered section headings and short practical paragraphs with bold action labels. Keep instructions visually separate from words to recite.
- When asked for a complete table-side guide like the reference, include verified full relevant blessings and Kiddush, not merely “read it in the siddur.” Do not claim completeness if required recitations are omitted. A specifically requested short overview may refer to a siddur.
- Establish location, community custom and calendar scenario from context. In the Chabad project the default is Chabad practice in Israel; label this. Do not silently apply diaspora second-day rules in Israel.
- For a unified guide, identify each conditional addition in words as well as color: “בשבת בלבד”, “במוצאי שבת”, etc. Blue text alone is not sufficient. Never make mutually exclusive alternatives look like consecutive instructions.
- Check halachic details and prayer texts against authoritative primary sources. The supplied PDF is a visual reference, not an authority overriding verified Chabad customs. For example, independently check Shabbat Hoshanot practice and directional lulav customs rather than copying them from the reference.
- Verify dates with the project's Hebrew-calendar library when applicable; do not invent local candle-lighting times. Use clearly labeled blanks if location/year is unspecified.
- Keep reviewed sources in the working source or a concise reference note. Preserve Hebrew Unicode and niqqud. Use the user's convention for divine names consistently.

## Production workflow

1. Copy the HTML/CSS assets to an output working directory and replace the demonstration text with the requested guide. Preserve semantic headings, RTL and the component classes.
2. Choose green by default or the explicitly requested holiday palette. Reuse the typography, cards, right-hand accents, blessing panels and scenario highlighting rather than redesigning from scratch.
3. Keep sections in natural chronological flow. Start a continuation page when necessary; repeat an appropriate heading. Keep each short blessing intact, and split long passages only at deliberate paragraph boundaries. Do not shrink all text merely to match the reference's three-page count.
4. Print with a browser/PDF engine that supports Hebrew shaping, using A4, CSS page size and background graphics. Disable automatic browser URL/date headers. The original PDF was produced with WeasyPrint 62.3; using the same engine is optional, not a dependency requirement.
5. Render and inspect **every** output page: readable niqqud, correct RTL, no clipped text, no footer collisions, no stranded labels, and no extra blank pages. Check the longest prayer, tables and all condition labels. PDF text extraction may be unreliable for the reference, so inspect page images too.
6. Save the editable source and final PDF. State the actual page count and what the guide contains. Only update article download links or publish when that is within the user's requested task.

## Preserving approved files

If the user supplies a finished PDF for download, preserve its exact bytes. Do not regenerate or overwrite it just because a generator exists. Generate a new candidate filename for future edits unless replacement is requested.

In the Chabad project the current approved Sukkot download is `public/uploads/holidays/sukkot-step-by-step.pdf`, copied from the user's `succot_guide_unified.pdf`. The older `scripts/build-sukkot-guide.mjs` produces the rejected plain layout and must not be treated as the style authority. The existing Rosh Hashanah renderer expects a particular fixed-page structure, so do not run it against this template unchanged.
