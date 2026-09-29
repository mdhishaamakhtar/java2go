# Contributing

This project is content-first. Most contributions are corrections, clarifications or new sections rather than framework changes. Thank you for helping Java developers learn Go.

## Setup

```bash
bun install
bun run dev
```

Before opening a pull request, run:

```bash
bun run check   # type-check, lint, formatting
bun run build   # also validates every section's content
```

## Project structure

| Path                                 | Purpose                                                        |
| ------------------------------------ | -------------------------------------------------------------- |
| `src/data/sections/<id>.ts`          | One file per section, named after its URL id                   |
| `src/data/sections/index.ts`         | Reading order, parts, and build-time content validation        |
| `src/types/section.ts`               | The `Block` schema every section is written in                 |
| `src/components/SectionRenderer.tsx` | Turns blocks into HTML; code is highlighted at build time      |
| `src/components/ui.tsx`              | Prose, headings, notes, callouts, lists and tables             |
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
| `compare`    | Java on the left, Go on the right. Set `javaLang`/`goLang` for non-code (`xml`, `bash`…)   |
| `codeblock`  | A single snippet: `go`, `java`, `bash`, `xml`, `json`, `yaml`, `sql`, `dockerfile`, `text` |
| `note`       | Short asides: `info`, `java`, `warn`, `tip`, `engine` (production concerns), `why`         |
| `why`        | The "Why Go does this" explanation under a comparison                                      |
| `callout`    | A titled panel; `tone` is `go`, `java`, `info`, `engine` or `warn`                         |
| `table`      | Rows of cells. Two columns without a `head` render as Java → Go; otherwise pass `head`     |

Internal links are checked at build time: a link to a missing section or heading anchor fails the build. Heading anchors are the slugified heading text (`'Goroutine leaks'` → `#goroutine-leaks`).

## Content guidelines

- **Be accurate and current.** The guide targets the Go and Java versions in `src/lib/site.ts`. When a feature is recent, name the version that introduced it. Compile non-trivial Go snippets before submitting (`go vet` and `go run`).
- **Compare like with like.** Pair idiomatic modern Java (records, try-with-resources, virtual threads) with idiomatic Go. Don't compare against Java nobody writes anymore.
- **Explain the why.** A comparison without the reasoning behind Go's choice teaches syntax, not the mental model.
- **Prefer the standard library.** Introduce third-party libraries only when they are the de facto choice, and say so.
- **Keep snippets small.** Side-by-side code reads best when lines stay under about 60 characters.
- **Use consistent terms:** goroutine, receiver, zero value, method set, interface satisfaction.

## Design notes

The visual system is documented in [`.impeccable.md`](./.impeccable.md). In short: dark theme, amber means Java and cyan means Go (never swap them), and colours come from the tokens in `src/app/globals.css`. Check both desktop and mobile after layout changes, and keep interactions keyboard-accessible.

## SEO

- Site-wide metadata: `src/app/layout.tsx`; per-section metadata and structured data: `src/app/sections/[id]/page.tsx`.
- Open Graph images are generated per section at build time (`src/app/sections/[id]/opengraph-image.tsx`).
- Changing a section `id` changes its URL. Avoid it; if you must, update any inbound links.
