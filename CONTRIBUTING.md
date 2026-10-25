# Contributing

This project is content-first. Most contributions are corrections, clarifications or new sections rather than framework changes. Thank you for helping Java developers learn Go.

## Setup

```bash
bun install
bun run dev
```

Before opening a pull request, run:

```bash
bun run check   # type-check, lint, formatting, tests
bun run build   # also validates every section's content
```

## Project structure

| Path                                 | Purpose                                                        |
| ------------------------------------ | -------------------------------------------------------------- |
| `src/data/sections/<id>.ts`          | One file per section, named after its URL id                   |
| `src/data/sections/index.ts`         | Reading order, parts, and build-time content validation        |
| `src/types/section.ts`               | The `Block` schema every section is written in                 |
| `src/components/SectionRenderer.tsx` | Lays blocks out on the page; code is highlighted at build time |
| `src/components/blocks/`             | Prose, headings, notes, callouts, code, tables and figures     |
| `src/components/diagrams/`           | The drawings figures show, plus the shared drawing kit         |
| `src/lib/placement.ts`               | Which blocks go in the text column, the margin, or both        |
| `src/lib/themes.ts`                  | The four themes' colours: the only place colours are defined   |
| `src/lib/site.ts`                    | Site URL, author, and the Go/Java versions the content targets |

## Adding a section

1. Create `src/data/sections/my-topic.ts`. The file name must match the section `id`, because the "Suggest an edit" link is built from it.

   ```ts
   import type { SectionContent } from '@/types/section';

   const section: SectionContent = {
     id: 'my-topic', // URL: /sections/my-topic
     label: 'My Topic', // title shown everywhere
     summary: 'One or two sentences. Used for search, the home page and meta descriptions.',
     blocks: [
       { type: 'prose', text: 'Start from what a Java developer already knows.' },
       // …
     ],
   };

   export default section;
   ```

2. Import it in `src/data/sections/index.ts` and add it to the right part of the `outline`. Section numbers are derived from the order, so nothing else needs renumbering.
3. Run `bun run build` and fix anything the content validator reports.

## Block types

Text fields support inline markup: `` `code` ``, `**bold**`, `[links](/sections/id#heading)`, and a blank line for a new paragraph.

| Block        | Use it for                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------ |
| `prose`      | Paragraphs                                                                                 |
| `heading`    | A top-level heading (`h2`); appears in the table of contents and search                    |
| `subheading` | A nested heading (`h3`)                                                                    |
| `list`       | Bulleted or (`ordered: true`) numbered lists                                               |
| `compare`    | Java and Go, side by side when they fit. Set `javaLang`/`goLang` for non-code (`xml`…)     |
| `codeblock`  | A single snippet: `go`, `java`, `bash`, `xml`, `json`, `yaml`, `sql`, `dockerfile`, `text` |
| `note`       | Short asides: `info`, `java`, `warn`, `tip`, `engine` (production concerns), `why`         |
| `why`        | The "Why Go does this" explanation under a comparison                                      |
| `callout`    | A titled panel; `tone` is `go`, `java`, `info`, `engine` or `warn`                         |
| `table`      | Rows of cells. Two columns without a `head` render as Java → Go; otherwise pass `head`     |
| `figure`     | A diagram from `src/components/diagrams`, with a `caption` and an `alt` description        |

`java`, `tip` and `info` notes are placed in the margin beside the block just before them, when that block leaves the margin free and the note is under 400 characters; otherwise they show as an aside in the text column. Warnings always stay in the text column. You never position blocks by hand.

## Adding a diagram

Every section has at least one `figure`, and the build fails without one.

1. Add an id to `src/lib/diagram-ids.ts`.
2. Draw it in the matching file in `src/components/diagrams/` with the primitives in `kit.tsx` (`Panel`, `Box`, `T`, `Arrow`, …) and register it in `index.ts`. Colours come from CSS classes, never hex values, so the drawing works in all four themes.
3. Keep every panel at most 360 units wide; put two ideas in two panels rather than one wide drawing, so text stays readable on phones. `bun run test` checks this.
4. Only use terms the section itself introduces, and check the drawing against the section text: a wrong diagram is worse than none.
5. Write the `alt` text to describe what is drawn, for readers who cannot see it.

Internal links are checked at build time: a link to a missing section or heading anchor fails the build. Heading anchors are the slugified heading text (`'Goroutine leaks'` → `#goroutine-leaks`).

## Content guidelines

- **Be accurate and current.** The guide targets the Go and Java versions in `src/lib/site.ts`. When a feature is recent, name the version that introduced it. Compile non-trivial Go snippets before submitting (`go vet` and `go run`).
- **Compare like with like.** Pair idiomatic modern Java (records, try-with-resources, virtual threads) with idiomatic Go. Don't compare against Java nobody writes anymore.
- **Explain the why.** A comparison without the reasoning behind Go's choice teaches syntax, not the mental model.
- **Prefer the standard library.** Introduce third-party libraries only when they are the de facto choice, and say so.
- **Keep lines short.** Code never scrolls sideways, and at full width it never wraps either (`src/lib/code-layout.ts`). A comparison sits side by side only if every line is 49 columns or fewer, otherwise Java stacks above Go. A code block stays in the text column up to 71 columns and takes the full width beyond that, which moves a margin note after it inline. The build fails on a line over 102 columns, which would wrap even at full width.
- **Use consistent terms:** goroutine, receiver, zero value, method set, interface satisfaction.

## Design notes

The visual system is documented in [`.impeccable.md`](./.impeccable.md). In short: four themes, amber means Java and teal means Go in every one (never swap them), and colours come only from `src/lib/themes.ts`, whose contrast the tests check. Check desktop and phone widths, and at least one light and one dark theme, after layout changes, and keep interactions keyboard-accessible.

## SEO

- Site-wide metadata: `src/app/layout.tsx`; per-section metadata and structured data: `src/app/sections/[id]/page.tsx`.
- Open Graph images are generated per section at build time (`src/app/sections/[id]/opengraph-image.tsx`).
- Changing a section `id` changes its URL. Avoid it; if you must, update any inbound links.
