# Field Guide redesign

Status: draft for approval · 2026-10-24 · reviewed by a builder check

## Why

The guide's content is strong, but the site feels like a wall of information, and it still reads as an AI-generated docs template: a deep-navy dark theme, a permanent numbered sidebar, rounded cards, and coloured callout boxes stacked one after another. An earlier pass with impeccable improved the fonts, but the overall look hasn't changed.

The goal is to make the guide feel like a well-made **engineering manual / field guide** that people enjoy learning from. The text column should be calmer and more spacious. Asides should move out of the main text. Each section should have a drawing that explains its hardest idea, and the reader should be able to pick the light or dark look they want. The technical depth stays exactly as it is.

Readers are experienced Java developers learning Go (see `.impeccable.md`, "Users").

## Reference mockups

Two brainstorming mockups are in `docs/superpowers/mockups/`. Open them in a browser. They are references, not specs. Where they disagree with this document, this document wins.

- **`field-guide-dark.html`:** the layout, the four themes with a working switcher, and the Pointers diagram, already drawn as theme-aware SVG. Port the layout and the diagram's drawing style from here. **Ignore its fonts**, Newsreader and IBM Plex, which are both banned. Also ignore its small, widely spaced uppercase mono labels, which are the cliché the anti-goals rule out.
- **`typography.html`:** four type pairings. **Pairing 4, "Engineering manual", is the chosen one.** Use its sizes, widths and weights as the starting point.

## Goals

1. **A new visual identity** based on the "Field Guide" mockup: a reading column with a right-hand margin, large section numbers, captioned figures, and book-style page turns.
2. **Engineering-manual typography:** Archivo Expanded for headings and labels, Piazzolla for body text, and Martian Mono for code.
3. **Four themes** with a picker: Paper (light), Lamplight, Night ink and Chalkboard (dark).
4. **Less dense pages:** asides move into the margin, so the main text column carries only the main argument.
5. **One explanatory diagram in every one of the 31 sections**, all shipped in this release.
6. **Everything restyled consistently:** the home page, section pages, search, 404/error pages, and the social images.

## Non-goals (this release)

- Rewriting the prose. Wording changes only where a block has to move (for example, a note that becomes a margin note keeps its text), or where drawing a diagram exposes a factual mistake in the text (see "Diagram accuracy").
- Runnable code or an in-browser Go playground.
- The "predict the output" quizzes and progress route from the Route & Predict mockup, and the linked Java↔Go lines from the Translation Desk mockup. They are parked for a later release.
- Accounts, server-side state, or analytics changes.

## Anti-goals: if any of these happen, the release has failed even if it ships

- **Looking like the AI editorial cliché:** cream paper, an italic display serif, and small, widely spaced uppercase mono labels everywhere. The Field Guide mockup leaned this way, and the new type system has to avoid it. Labels use Archivo, not tracked mono caps. Italic is reserved for asides, not used as decoration. The Paper theme itself stays, because the owner chose it. What the release must avoid is that combination of type habits. The builder may tune Paper towards a less yellow off-white.
- **Gamification or cuteness:** mascots, confetti, badges or streaks.
- **Decoration that competes with the code.** The code examples are still the product.
- **Diagrams that are pretty but wrong,** or that only redraw the code without adding understanding. A diagram that misstates Go semantics is worse than no diagram.
- **Breaking URLs or anchors.** `/sections/{id}` and heading anchors must keep working.
- **Accessibility regressions** in any theme.

## Constraints

- **Stack:** Next.js 16, React 19, Tailwind 4 with tokens as CSS variables in `src/app/globals.css`, Shiki highlighting at build time, and Bun. Pages remain static.
- **Content:** content stays as typed TypeScript data in `src/data/sections/*`, with the block schema in `src/types/section.ts`. `next build` must keep validating content, and should also validate any new block types, such as a figure that names a missing diagram.
- **Fonts:**
  - Self-host the fonts, as the site does today with `@fontsource`, rather than loading Google Fonts at runtime.
  - Don't use any face on impeccable's lists: Inter, Roboto, Open Sans, Lato, Montserrat, Arial, Helvetica, Fraunces, Geist, Mona Sans, Plus Jakarta Sans, Space Grotesk, Space Mono, Recoleta, Instrument Sans/Serif, Playfair, Cormorant, Lora, Crimson, Newsreader, Syne, IBM Plex, DM Sans/Serif, Outfit.
- **Code fonts:** ligatures stay off, so readers see the characters they type (`:=`, `!=`, `<-`).
- **Accessibility:**
  - Body text at least 4.5:1 contrast and large text at least 3:1 in **all four themes**, including code token colours and comments, because comments carry teaching.
  - Keyboard and screen-reader navigation at least as good as today.
  - `prefers-reduced-motion` respected.
  - Every diagram has a text alternative and a caption.
- **Theme behaviour:** no flash of the wrong theme on load. The theme must be applied before first paint, the same way `sidebarInitScript` works today.
- **Colour identity:** amber always means Java and cyan/teal always means Go, in every theme, in diagrams, and in social images. Their exact values can be tuned per theme for contrast.

## Decided by the owner

- **Direction:** the Field Guide layout (mockup A), not Translation Desk or Route & Predict.
- **Typography:** Pairing 4, "Engineering manual":
  - **Headings and labels:** Archivo at its expanded width (`wdth` ≈ 112–125) and heavy weights. Normal width is fine for small UI labels.
  - **Body:** Piazzolla, using its optical sizes.
  - **Code:** Martian Mono, slightly condensed (`wdth` ≈ 87.5) so code lines fit.
- **Themes:** all four ship, and the reader can switch between them.
- **Diagrams:** all 31 sections get a diagram in this release, not just a pilot pair.
- **Diagram accuracy:**
  - **No owner review of each diagram.** A careful independent technical check is enough: a reviewer who did not draw the diagram, such as a fresh agent session.
  - **Text mistakes get fixed.** If drawing a diagram exposes a mistake in the section's text, fix the text, and list every such change for the owner.

## My calls (the owner can overrule any of these while reviewing)

### Theme behaviour

- **First visit:** follow the system colour scheme, using **Paper** in light mode and **Night ink** in dark mode. Night ink is closest to today's site, so returning readers get continuity.
- **Remembering the choice:** a picked theme is stored in `localStorage` and applies across the site. If storage is unavailable, the site falls back to the system default.
- **Picker:** a compact control in the running header that shows four swatches with names. Changing theme must not reload the page.
- **Chalkboard:** diagram strokes get a subtle rough-chalk texture, an SVG filter applied to shapes only, never to text. The other themes use clean strokes.

The mockup palettes were starting points:

| Theme      | Background | Text      | Java      | Go        |
| ---------- | ---------- | --------- | --------- | --------- |
| Paper      | `#f4efe5`  | `#221e18` | `#9a6a12` | `#17705f` |
| Lamplight  | `#1a1814`  | `#ece4d4` | `#dcaa4f` | `#62c6ae` |
| Night ink  | `#0d0f17`  | `#e3e4ef` | `#d6b65e` | `#4ec9b0` |
| Chalkboard | `#18221f`  | `#e9eee6` | `#ecc56c` | `#8fe0dc` |

Each theme needs a complete token set: surfaces, rules, muted text, code background, inline-code chip, and syntax colours. Tune them for contrast.

### Layout

- **Section page:** a reading column (prose capped at about 68ch) plus a right-hand **margin column**. The page opens with the part name, a large faint section number, the title in Archivo Expanded, and the section summary as the subtitle.
- **What sits in the reading column vs across the full width:**
  - **Reading column:** prose, lists, headings, warnings, pull quotes, and **code blocks** whose lines fit it (up to 71 columns). Keeping code in the reading column leaves the margin free beside it, and that is where most notes land.
  - **Full width (reading column plus margin):** Java/Go **comparisons**, tables, figures, "Under the hood" boxes, and code blocks with lines too long for the reading column. Nothing ever goes wider than this.
  - **Code never scrolls sideways** and, at full width, never wraps (the build rejects a line over 102 columns). A comparison sits side by side when both halves fit at full width (49 columns each) and otherwise stacks, Java above Go; most comparisons stack, since their longest line is typically 60–70 characters. On narrow screens long lines wrap with a hanging indent. _(Revised after review: an earlier version let wide comparisons run past the margin, which broke the page's edges.)_
- **Margin note placement:** a margin note belongs to the block just before it.
  - **That block is in the reading column** (code, prose, a list, a pull quote, a callout): the note sits in the margin **beside that block**, top-aligned with it. This covers 32 of the 49 margin notes: 22 after a code block, 4 after a pull quote, 3 after prose, 2 after a list and 1 after a callout.
  - **That block spans the full width** (a comparison or a table): there is no free margin, so the note renders **inline as a compact aside directly under it**. This covers 17 notes: 13 after a comparison, 4 after a table.
  - The rule is automatic. Content files don't mark notes.
- **Margin collapse:** below the width where the margin fits, every margin note folds back into the text flow as a compact aside, directly after the block it belongs to.
- **Navigation:** the permanent sidebar goes away. In its place:
  - A slim **running header**: the brand ("Java → Go"), the current part and section, **Contents**, the **⌘K search**, and the theme picker.
  - **Contents** opens a drawer or overlay listing all parts and sections, with the current one marked. This drawer replaces the mobile nav too.
  - **On this page** leaves the margin, because full-width blocks would keep colliding with it. It becomes a current-heading indicator in the running header ("§ Nil pointers ▾") that opens the heading list, and the list also appears inside the Contents drawer.
  - **Page turns** at the bottom: "← 06 Interfaces · 08 any →", replacing `SectionPager`'s card style.
- **Home page:** same identity. The title spread uses Archivo Expanded, the error-handling comparison stays, and the contents read like a book's table of contents, grouped by part, with section numbers. No hero gradients, cards or badges.

### Content blocks: how each existing type renders

| Block                                   | Count today    | New treatment                                                                                                      |
| --------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------ |
| `note` · `java`                         | 14             | Margin note, "Coming from Java", amber                                                                             |
| `note` · `tip`                          | 21             | Margin note, "Rule of thumb", teal                                                                                 |
| `note` · `info`                         | 14             | Margin note, "Note", neutral                                                                                       |
| `note` · `warn`                         | 17             | **Stays in the text column**, because readers must not skim past it. "Watch out" treatment, unmistakable but calm. |
| `note` · `engine`, `callout` · `engine` | 7 + 3          | Full-width boxed aside, "Under the hood"                                                                           |
| `why`                                   | —              | Pull quote in the text column, labelled "The why"                                                                  |
| `callout` (go / info / java / warn)     | 11 / 4 / 2 / 5 | Boxed panel with a title, with the tone shown by a rule or label colour, not a filled background                   |
| `compare`                               | —              | Java and Go joined by a fold: side by side when both halves fit, otherwise Java stacked above Go                   |
| `codeblock`, `table`, `list`, headings  | —              | Restyled in the new type system. No change in behaviour.                                                           |

- **Long notes:** a note too long to sit comfortably in the margin renders inline as an aside instead. Use one automatic rule, such as a character threshold, not per-note manual flags.

### Diagrams

- **New block type:** `{ type: 'figure'; diagram: DiagramId; caption: string; alt: string }`. `diagram` names a component in a diagram registry, and the build fails on an unknown id. Figures are numbered per section (Fig. 7.1, 7.2…).
- **How they're drawn:** inline SVG React components that take every colour from the theme tokens through CSS variables, as in the mockup, so one drawing works in all four themes. Text in diagrams uses Martian Mono for code identifiers and Piazzolla or Archivo for annotations.
- **Shared toolkit:** a small set of SVG primitives (box, labelled arrow, lane, bracket, callout) so 31 diagrams look like one family.
- **Accuracy is a hard requirement.** Each diagram must agree with its section's text and with Go 1.27 / Java 25 semantics.
  - **Independent check:** every diagram gets an independent technical check by a reviewer who did not draw it. The reviewer checks it against the section text and the language semantics, and the diagram ships only once that check passes.
  - **Text mistakes:** if a diagram exposes a mistake in the text, fix the text. Record each fix (section, old wording, new wording, why) in a "Text corrections" list in the release PR description, and tell the owner at the end.
- **Placement:** each figure sits next to the idea it explains, usually right after that heading's first paragraph.
- **Phone width:** every diagram must stay legible at phone width, with text no smaller than about 11px on screen. It can re-flow (for example, side-by-side panels stack) rather than just scaling down.
- **Vocabulary:** a diagram only uses terms its section introduces. If a subject below needs a term the section never mentions, change the subject or label the term in plain words. Don't add new jargon.
- **Checkpoint before the full run:** build the toolkit and the **Pointers** page (layout, all four themes, its figure) plus **Slices & Maps** and **Context** figures first. The owner reviews these in the browser **for look and feel**, not accuracy, before the other 28 diagrams are built on the same toolkit.
- **Proposed subjects:** one per section. The builder may adjust a subject if a better one explains the section's hardest idea, but must keep one per section. Numbers match the site's own numbering, 00–30.

| #   | Section                    | Diagram                                                                                                                                                                                                               |
| --- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 00  | Go Mental Model            | A Java app as a class hierarchy inside a framework container, next to a Go app as flat packages of structs and functions wired together in `main`                                                                     |
| 01  | Packages & Imports         | A module tree showing exported (Capitalised) vs unexported names crossing package boundaries, and which packages may import an `internal/` package                                                                    |
| 02  | Dependency Management      | Semantic import versioning: `example.com/lib` and `example.com/lib/v2` as two separate modules in one build graph, with `go.mod` and `go.sum` roles                                                                   |
| 03  | Types & Variables          | Zero values: a grid of types next to their zero values (`0`, `""`, `false`, `nil`, a zeroed struct), compared with Java's defaults and `null`                                                                         |
| 04  | Strings & Formatting       | `"héllo"` as UTF-8 bytes with indices vs runes: `len` = 6, 5 runes, `s[1]` is a byte                                                                                                                                  |
| 05  | Structs                    | Embedding vs inheritance: an embedded struct laid out inside the outer struct, with promoted methods, next to Java's `extends`                                                                                        |
| 06  | Interfaces                 | The consumer owns the interface: a consumer package declares a small interface, and types in other packages satisfy it implicitly, with no `implements` arrow back                                                    |
| 07  | Pointers                   | Already drawn in the mockup: Java `m2 = m1`, two names and one object, vs Go `m2 := m1`, two names and two objects                                                                                                    |
| 08  | any / interface{}          | An interface value as a (type, value) pair: a nil interface (nil, nil) vs an interface holding a nil `*T` (`*T`, nil), which `!= nil`                                                                                 |
| 09  | Slices & Maps              | A slice header (ptr, len, cap) over a backing array; a sub-slice sharing the array; `append` past capacity moving to a new array                                                                                      |
| 10  | Functions                  | Middleware as nested functions: a request passing through `logging(auth(handler))` and back out                                                                                                                       |
| 11  | Defer                      | Deferred calls pushed onto a stack as the function runs, and popped last-in, first-out on return                                                                                                                      |
| 12  | Error Handling             | A wrap chain built by `%w` as nested boxes, and `errors.Is` / `errors.As` walking down it                                                                                                                             |
| 13  | Blank Identifier           | Annotated code: one snippet with callouts on the five places `_` appears, including the compile-time interface check                                                                                                  |
| 14  | Goroutines                 | Scheduling models: Java platform threads (one OS thread each), Java virtual threads, and Go goroutines (M:N): `GOMAXPROCS` goroutines running on OS threads while others are parked on network I/O, channels or locks |
| 15  | Channels                   | Timelines: an unbuffered channel as a rendezvous where both sides wait, vs a buffered channel as a bounded queue that blocks only when full or empty                                                                  |
| 16  | Sync Primitives            | `RWMutex` lanes: several readers overlapping, then a writer running alone                                                                                                                                             |
| 17  | Goroutine Management       | A worker pool: a producer feeding a jobs channel, N workers, a results channel and fan-in, with the cancellation path                                                                                                 |
| 18  | Context                    | A context tree from `Background` through `WithTimeout` and `WithCancel`. Cancellation flows down to descendants, never up.                                                                                            |
| 19  | Defer — Advanced           | Every exit path (normal return, early error return, panic) funnelling through the deferred `close(ch)` / unlock                                                                                                       |
| 20  | Generics                   | Constraints as type sets: `any` ⊃ `comparable` ⊃ a union such as `~int \| ~float64`, with where a given type falls                                                                                                    |
| 21  | Iterators                  | Push-iterator control flow: `for range` hands the body to the iterator as `yield`. Each `yield(v)` runs the body, and `break` makes `yield` return false.                                                             |
| 22  | Init & Main Lifecycle      | Startup order: imported packages' variables and `init()` first, then this package, then `main()` → `run()` → signal → graceful shutdown                                                                               |
| 23  | Project Layout & Ecosystem | The typical service directory tree, with allowed import directions (`cmd/` → `internal/…`)                                                                                                                            |
| 24  | JSON & HTTP APIs           | A request's path: server timeouts, middleware chain, `ServeMux` pattern match (`GET /users/{id}`), handler, JSON encode, error-to-status mapping                                                                      |
| 25  | HTTP Concurrency Model     | Three models side by side: Spring MVC thread-per-request, WebFlux event loop, Go goroutine-per-request, showing what is blocked while waiting on I/O                                                                  |
| 26  | Testing                    | A table-driven test: table rows fanning out into named `t.Run` subtests, one failing in isolation                                                                                                                     |
| 27  | Logging & Observability    | The `slog` pipeline: Logger → Handler (JSON to stdout). A context-aware handler adds the request ID, and `LogValuer` redacts a secret on the way.                                                                     |
| 28  | Tooling & Deployment       | A multi-stage container build: source → build stage → one static binary → minimal runtime image, next to a JVM image's layers. No size numbers unless the section states them.                                        |
| 29  | Common Gotchas             | The loop-variable copy: `for _, v := range s { v.X = 1 }` changes a copy, and the slice elements are untouched                                                                                                        |
| 30  | Go Mental Model — Recap    | A visual index: Java concepts mapped to their Go counterparts, each linked to its section number                                                                                                                      |

### Brand and project files

- **Social images:** the Open Graph and Twitter images (`src/lib/social-image.tsx`), `public/og-image.svg` and the README banner adopt the new fonts and the Night ink palette. Satori needs static font files (TTF/OTF/WOFF), not variable fonts.
- **`.impeccable.md`:** rewrite it to describe the new system. The current text says "deep space dark only, Barlow, calm, no playfulness", and this release replaces all of that.
- **Old fonts:** remove Barlow and Fira Code once nothing uses them.

## Left to the builder

- The component structure, and how the existing `ui.tsx`, `Compare`, `CodeBlock`, `OnThisPage`, `SectionPager` and nav components are reshaped or replaced.
- How Shiki serves four themes, for example the CSS-variables theme or multiple themes with per-theme variables, as long as it is still done at build time.
- Exact token values per theme (within the contrast constraint), spacing scale, breakpoints and the margin-collapse width.
- The SVG toolkit's API, and how diagrams are organised in the codebase.
- The threshold rule for notes too long for the margin.
- Font packages: `@fontsource` / `@fontsource-variable` or vendored files.
- Motion: theme-change cross-fade, drawer transition. Keep it short and respect reduced motion.

## Done means

- Every page renders in all four themes with no contrast failures and no flash of the wrong theme.
- All 31 sections have a figure, each with a caption and alt text, and each has passed an independent technical check.
- Any text corrections are listed in the PR description and reported to the owner.
- `bun run build` and `bun run check` pass.
- No URL or heading anchor has changed.
- Search, keyboard navigation and the mobile layout work.
- Social images and `.impeccable.md` are updated, and Barlow and Fira Code are gone.
