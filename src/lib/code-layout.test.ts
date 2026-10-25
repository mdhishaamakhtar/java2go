import { expect, test } from 'bun:test';
import {
  CODE_FONT_REM,
  FOLIO_COLUMNS,
  FOLIO_WIDTH_REM,
  indentOf,
  longestLine,
  normalizeCode,
  paneWidthRem,
  READING_COLUMNS,
  READING_WIDTH_REM,
  SIDE_BY_SIDE_COLUMNS,
} from './code-layout';

test('normalising drops leading blank lines and trailing space, not indentation', () => {
  expect(normalizeCode('\n  \n    x := 1\n\n')).toBe('    x := 1');
});

test('indentation counts spaces and tabs as columns', () => {
  expect(indentOf('func main() {')).toBe(0);
  expect(indentOf('    return nil')).toBe(4);
  expect(indentOf('\t\tx := 1')).toBe(8);
  expect(indentOf('   ')).toBe(3);
});

test('the longest line counts tabs as four columns', () => {
  expect(longestLine('ab\nabcd\na')).toBe(4);
  expect(longestLine('\tx')).toBe(5);
});

test('the text column fits 71 columns of code, the folio 102, half the folio 49', () => {
  expect(READING_COLUMNS).toBe(71);
  expect(FOLIO_COLUMNS).toBe(102);
  expect(SIDE_BY_SIDE_COLUMNS).toBe(49);
});

test('two panes of the widest side-by-side code fit the folio, one column more does not', () => {
  const fold = 3 * 0.0625; // two borders and the fold
  expect(2 * paneWidthRem(SIDE_BY_SIDE_COLUMNS) + fold).toBeLessThanOrEqual(FOLIO_WIDTH_REM);
  expect(2 * paneWidthRem(SIDE_BY_SIDE_COLUMNS + 1) + fold).toBeGreaterThan(FOLIO_WIDTH_REM);
});

test('the measurements match globals.css', async () => {
  const css = await Bun.file(new URL('../app/globals.css', import.meta.url)).text();
  const rem = (pattern: RegExp) => Number(css.match(pattern)?.[1]);
  const reading = rem(/--reading-width:\s*([\d.]+)rem/);
  const margin = rem(/--margin-width:\s*([\d.]+)rem/);
  const gap = rem(/--margin-gap:\s*([\d.]+)rem/);
  const shiki = css.match(/\.shiki \{[^}]*\}/)?.[0] ?? '';

  expect(reading).toBe(READING_WIDTH_REM);
  expect(reading + gap + margin).toBe(FOLIO_WIDTH_REM);
  expect(shiki).toContain(`font-size: ${CODE_FONT_REM}rem;`);
  expect(shiki).toContain('padding: 0.95rem 1.125rem 1rem;');
});
