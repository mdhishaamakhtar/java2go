import { describe, expect, test } from 'bun:test';
import { contrast, THEME_IDS, THEMES, themeCss, type ThemeTokens } from './themes';

type Key = keyof ThemeTokens;

/** Text colours and the surfaces they are read on. Body text needs 4.5:1. */
const TEXT_ON: [Key[], Key[]][] = [
  [
    ['ink', 'copy', 'ink2', 'ink3', 'java', 'go', 'warn'],
    ['paper', 'sunk'],
  ],
  [['ink', 'copy', 'ink2', 'ink3'], ['chip']],
  [
    [
      'synKeyword',
      'synString',
      'synConstant',
      'synFunction',
      'synComment',
      'synPunctuation',
      'ink',
    ],
    ['sunk'],
  ],
];

describe.each(THEME_IDS)('theme %s', (id) => {
  const tokens = THEMES[id].tokens;

  test('every token is a #rrggbb colour', () => {
    for (const value of Object.values(tokens)) expect(value).toMatch(/^#[0-9a-f]{6}$/);
  });

  for (const [fgs, bgs] of TEXT_ON) {
    for (const fg of fgs) {
      for (const bg of bgs) {
        test(`${fg} on ${bg} is at least 4.5:1`, () => {
          expect(contrast(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(4.5);
        });
      }
    }
  }

  test('strong rules are visible against the page (3:1 is not required, 1.5:1 is)', () => {
    expect(contrast(tokens.ruleStrong, tokens.paper)).toBeGreaterThanOrEqual(1.5);
  });
});

test('contrast() matches known WCAG values', () => {
  expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5);
  expect(contrast('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
});

test('themeCss() covers every theme plus the system fallback', () => {
  const css = themeCss();
  for (const id of THEME_IDS) expect(css).toContain(`:root[data-theme='${id}']`);
  expect(css).toContain('prefers-color-scheme:dark');
  expect(css).toContain('--syn-keyword:');
});
