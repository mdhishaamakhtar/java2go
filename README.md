<!-- markdownlint-disable MD033 -->

<p align="center">
  <img src="./public/og-image.svg" alt="Java2Go: Java to Go, side-by-side examples, mental model shifts, and practical service patterns">
</p>

# Go for Java Developers

**[java2go.hishaam.dev](https://java2go.hishaam.dev)** · A guide to Go for developers who already know Java.

Every concept starts from the Java you know, shows idiomatic Go next to it, and explains _why_ Go made a different choice, so you build the mental model instead of translating syntax. The content is written against **Go 1.27** and **Java 25**, and calls out when a feature is recent.

## What's inside

31 sections in seven parts:

| Part                     | Sections                                                                                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Orientation**          | Go mental model · Packages & imports · Dependency management                                                                                              |
| **Types & Data**         | Types & variables · Strings & formatting · Structs · Interfaces · Pointers · `any` · Slices & maps                                                        |
| **Functions & Errors**   | Functions · Defer · Error handling · Blank identifier                                                                                                     |
| **Concurrency**          | Goroutines · Channels · Sync primitives · Goroutine management · Context · Defer (advanced)                                                               |
| **Generics & Iterators** | Generics · Iterators                                                                                                                                      |
| **Building Services**    | Init & main lifecycle · Project layout & ecosystem · JSON & HTTP APIs · HTTP concurrency model · Testing · Logging & observability · Tooling & deployment |
| **Wrap-up**              | Common gotchas · Recap                                                                                                                                    |

Site features:

- Java and Go examples side by side, syntax-highlighted at build time
- A drawn diagram in every section, explaining its hardest idea, with a caption and screen-reader description
- A field-guide layout: asides such as "Coming from Java" sit in the margin beside the text they belong to
- Four reading themes (Paper, Lamplight, Night ink, Chalkboard) that follow your system setting until you pick one
- Full-text search across sections, headings and Java vocabulary (<kbd>⌘K</kbd> / <kbd>Ctrl K</kbd> or <kbd>/</kbd>)
- A running header with the contents, an "on this page" jump list that tracks your scroll, and linkable headings
- Keyboard- and screen-reader-friendly throughout, with every theme checked for WCAG contrast by the test suite
- Static pages with per-section Open Graph images, structured data, a sitemap and robots rules

## Tech stack

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Shiki](https://img.shields.io/badge/Shiki-4-2D2D2D?style=for-the-badge)](https://shiki.style/)
[![Bun](https://img.shields.io/badge/Bun-1.3-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)

## Run locally

Requires [Bun](https://bun.sh/) 1.3+ (or Node.js 20.9+ with npm).

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command            | What it does                                        |
| ------------------ | --------------------------------------------------- |
| `bun run dev`      | Start the development server                        |
| `bun run build`    | Production build (also validates all guide content) |
| `bun run start`    | Serve the production build                          |
| `bun run test`     | Unit tests (theme contrast, layout rules, diagrams) |
| `bun run check`    | Type-check, lint, verify formatting and run tests   |
| `bun run lint:fix` | Fix lint problems where possible                    |
| `bun run format`   | Format everything with Prettier                     |

## Project structure

```text
src/
├── app/                    routes, metadata, OG images, sitemap, search index
├── components/             content blocks, diagrams, header and navigation, search
├── data/sections/          the guide: one file per section, ordered in index.ts
├── lib/                    themes, highlighting, layout rules, slugs, search, site config
└── types/section.ts        the content block schema
```

Content is plain TypeScript data. `next build` validates it and fails with a clear message on empty blocks, malformed tables, duplicate ids, a section without a figure, or internal links that point to a missing section or heading.

## Contributing

Corrections and new content are welcome. Read [CONTRIBUTING.md](./CONTRIBUTING.md) for how sections are structured and how to add one.

## License

[GPL-3.0](./LICENSE) © Md Hishaam Akhtar
