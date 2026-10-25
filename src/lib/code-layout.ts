/**
 * Measurements for laying code out so that it never scrolls sideways and, at
 * full width, never wraps either. They mirror globals.css (`--reading-width`,
 * the folio, `.shiki`), and code-layout.test.ts keeps the two in step.
 */

export const TAB_WIDTH = 4;

/** The text column. */
export const READING_WIDTH_REM = 40;

/** The text column, the gap and the margin: the widest any block gets. */
export const FOLIO_WIDTH_REM = 56.5;

export const CODE_FONT_REM = 0.8125;

/** One column of Martian Mono at the site's 87.5% width (measured). */
const COLUMN_REM = 0.65 * CODE_FONT_REM;

/** `.shiki` padding, left and right together. */
const CODE_PADDING_REM = 2.25;

/** A 1px border, or the 1px fold between two panes. */
const HAIRLINE_REM = 0.0625;

/** Normalise a snippet for display: drop leading blank lines and trailing whitespace. */
export function normalizeCode(code: string): string {
  return code.replace(/^(?:[ \t]*\n)+/, '').trimEnd();
}

/** Width of a line's leading whitespace, in columns. */
export function indentOf(line: string): number {
  let columns = 0;
  for (const char of line) {
    if (char === ' ') columns += 1;
    else if (char === '\t') columns += TAB_WIDTH;
    else break;
  }
  return columns;
}

/** The longest line in columns, counting a tab as TAB_WIDTH. */
export function longestLine(code: string): number {
  return Math.max(
    ...code.split('\n').map((line) => line.replace(/\t/g, ' '.repeat(TAB_WIDTH)).length),
  );
}

/** How wide a pane must be to show `columns` of code without wrapping. */
export function paneWidthRem(columns: number): number {
  return columns * COLUMN_REM + CODE_PADDING_REM;
}

/**
 * The most columns a framed code block in the text column shows without
 * wrapping. A block with longer lines takes the full folio width instead.
 */
export const READING_COLUMNS = Math.floor(
  (READING_WIDTH_REM - 2 * HAIRLINE_REM - CODE_PADDING_REM) / COLUMN_REM,
);

/** The most columns any code shows without wrapping: a block across the whole folio. */
export const FOLIO_COLUMNS = Math.floor(
  (FOLIO_WIDTH_REM - 2 * HAIRLINE_REM - CODE_PADDING_REM) / COLUMN_REM,
);

/** The most columns each half of a comparison shows when it sits side by side. */
export const SIDE_BY_SIDE_COLUMNS = Math.floor(
  ((FOLIO_WIDTH_REM - 3 * HAIRLINE_REM) / 2 - CODE_PADDING_REM) / COLUMN_REM,
);
