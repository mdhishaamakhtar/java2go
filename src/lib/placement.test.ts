import { expect, test } from 'bun:test';
import type { Block } from '@/types/section';
import { READING_COLUMNS } from './code-layout';
import { MARGIN_NOTE_MAX_CHARS, placeBlocks } from './placement';

const prose: Block = { type: 'prose', text: 'Some text.' };
const code: Block = { type: 'codeblock', lang: 'go', code: 'x := 1' };
const compare: Block = { type: 'compare', java: 'int x = 1;', go: 'x := 1' };
const table: Block = { type: 'table', rows: [['a', 'b']] };
const javaNote: Block = { type: 'note', noteType: 'java', text: 'Coming from Java.' };
const tip: Block = { type: 'note', noteType: 'tip', text: 'A tip.' };
const warn: Block = { type: 'note', noteType: 'warn', text: 'Careful.' };
const engine: Block = { type: 'note', noteType: 'engine', text: 'In production.' };

test('a note after a reading-column block goes in the margin', () => {
  expect(placeBlocks([code, javaNote])).toEqual(['reading', 'margin']);
  expect(placeBlocks([prose, tip])).toEqual(['reading', 'margin']);
});

test('a note after a full-width block becomes an aside under it', () => {
  expect(placeBlocks([compare, javaNote])).toEqual(['full', 'aside']);
  expect(placeBlocks([table, tip])).toEqual(['full', 'aside']);
});

test('a note after another margin note is an aside, so two notes never share a row', () => {
  expect(placeBlocks([code, javaNote, tip])).toEqual(['reading', 'margin', 'aside']);
});

test('a note at the very start has no anchor and is an aside', () => {
  expect(placeBlocks([javaNote, prose])).toEqual(['aside', 'reading']);
});

test('long notes stay inline', () => {
  const long: Block = {
    type: 'note',
    noteType: 'info',
    text: 'x'.repeat(MARGIN_NOTE_MAX_CHARS + 1),
  };
  const edge: Block = { type: 'note', noteType: 'info', text: 'x'.repeat(MARGIN_NOTE_MAX_CHARS) };
  expect(placeBlocks([code, long])).toEqual(['reading', 'aside']);
  expect(placeBlocks([code, edge])).toEqual(['reading', 'margin']);
});

test('code too long for the text column spans the page, and its note becomes an aside', () => {
  const fits: Block = { type: 'codeblock', lang: 'go', code: `\n${'x'.repeat(READING_COLUMNS)}\n` };
  const long: Block = { type: 'codeblock', lang: 'go', code: 'x'.repeat(READING_COLUMNS + 1) };
  expect(placeBlocks([fits, tip])).toEqual(['reading', 'margin']);
  expect(placeBlocks([long, tip])).toEqual(['full', 'aside']);
});

test('warnings stay in the text column and engine notes span the page', () => {
  expect(placeBlocks([code, warn])).toEqual(['reading', 'reading']);
  expect(placeBlocks([code, engine])).toEqual(['reading', 'full']);
});
