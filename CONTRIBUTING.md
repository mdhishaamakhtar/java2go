# Contributing

This project is content-first. Most contributions are section/content edits rather than framework changes.

## Project Structure

- `src/data/sections/`: all section content files
- `src/data/sections/index.ts`: section ordering and navigation sequence
- `src/types/section.ts`: content block schema (`Block` union)
- `src/components/SectionRenderer.tsx`: block renderer
- `src/components/ui.tsx`: visual primitives for prose, notes, callouts, headings

## How to Add a New Section

1. Create a new section file in `src/data/sections/` using naming pattern:
   - `s21MyTopic.ts` (number prefix controls sort/readability)
2. Export a `Section` object with:
   - `id` (URL segment, e.g. `my-topic`)
   - `title` (nav number, e.g. `"21"`)
   - `label` (display title)
   - `blocks` (content array)
3. Register the file in `src/data/sections/index.ts`:
   - add import
   - add to `sections` array in correct order
4. Run:
   - `npm run lint`
   - `npm run build`

## How to Change Existing Content

1. Edit the relevant file in `src/data/sections/`.
2. Keep Java and Go examples aligned in teaching intent.
3. Prefer small, explicit examples over large framework-heavy snippets.
4. Validate rendering for:
   - markdown-like text (`**bold**`, `` `inline code` ``)
   - compare blocks
   - long code blocks (horizontal overflow)
5. Run:
   - `npm run lint`
   - `npm run build`

## Block Types (from `src/types/section.ts`)

- `prose`: paragraph text
- `heading`: section heading
- `subheading`: smaller heading
- `compare`: side-by-side Java and Go code
- `codeblock`: single language code sample (`go` or `java`)
- `note`: highlighted helper text (`info`, `java`, `warn`, `tip`, `engine`, `why`)
- `callout`: emphasized explanatory block with title/color
- `why`: “Why Go does this” style explanation
- `table`: simple two-column mapping rows

## Content Authoring Guidelines

- Keep language precise and technically correct.
- Avoid introducing unnecessary libraries when standard library examples are enough.
- When comparing tools (Java vs Go), clearly separate:
  - default choice
  - performance-optimized choice
  - ORM vs SQL-first approach
- Keep terminology consistent across sections (e.g., “goroutine”, “receiver”, “zero value”).

## UI/UX Contribution Notes

- Preserve the design system variables in `src/app/globals.css`.
- Keep interactions lightweight (simple transitions, no heavy animation libraries).
- Ensure desktop and mobile navigation both remain usable after content or layout changes.

## SEO Notes

- Global metadata is in `src/app/layout.tsx`.
- Per-section canonical metadata is in `src/app/sections/[id]/page.tsx`.
- Sitemap and robots routes:
  - `src/app/sitemap.ts`
  - `src/app/robots.ts`

If changing URLs or section IDs, verify canonical, sitemap entries, and nav links remain consistent.
