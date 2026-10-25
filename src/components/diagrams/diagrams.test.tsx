import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { DIAGRAM_IDS } from '@/lib/diagram-ids';
import diagrams from '.';
import { PANEL_MAX_WIDTH } from './kit';

describe.each(DIAGRAM_IDS)('diagram %s', (id) => {
  const Diagram = diagrams[id];
  const markup = renderToStaticMarkup(<Diagram />);
  const widths = [...markup.matchAll(/viewBox="0 0 (\d+(?:\.\d+)?) \d+(?:\.\d+)?"/g)].map((m) =>
    Number(m[1]),
  );

  test('draws at least one panel', () => {
    expect(widths.length).toBeGreaterThan(0);
  });

  test(`no panel is wider than ${PANEL_MAX_WIDTH}, so text stays readable on phones`, () => {
    for (const width of widths) expect(width).toBeLessThanOrEqual(PANEL_MAX_WIDTH);
  });

  test('every drawing is hidden from screen readers (the figure carries the alt text)', () => {
    const svgs = markup.match(/<svg[^>]*>/g) ?? [];
    for (const svg of svgs) expect(svg).toContain('aria-hidden="true"');
  });
});

test('diagram sources take colours from the theme, never hard-coded values', () => {
  const dir = import.meta.dir;
  for (const file of readdirSync(dir).filter(
    (f) => f.endsWith('.tsx') && !f.endsWith('.test.tsx'),
  )) {
    const source = readFileSync(join(dir, file), 'utf8');
    expect({ file, colours: source.match(/#[0-9a-fA-F]{3,8}\b|rgb\(/g) }).toEqual({
      file,
      colours: null,
    });
  }
});
