/**
 * The four reading themes. This file is the single source of truth for every
 * colour on the site: the root layout turns it into CSS custom properties,
 * the theme picker draws its swatches from it, the social images use Night
 * ink, and `themes.test.ts` checks every pairing for WCAG contrast.
 *
 * Amber always means Java and teal always means Go, in every theme.
 */

export const THEME_IDS = ['paper', 'lamp', 'night', 'chalk'] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export const THEME_STORAGE_KEY = 'java2go:theme';

/** Used when the reader has not picked a theme: light and dark system preference. */
export const DEFAULT_LIGHT: ThemeId = 'paper';
export const DEFAULT_DARK: ThemeId = 'night';

export interface ThemeTokens {
  /** Page background. */
  paper: string;
  /** Inset surfaces: code, tables, boxed asides. */
  sunk: string;
  /** Inline code, hover fills, the picker's active row. */
  chip: string;
  /** Hairlines and dividers. */
  rule: string;
  /** Borders that must be seen: code frames, inputs, the fold of a comparison. */
  ruleStrong: string;
  /** Headings and emphasis. */
  ink: string;
  /** Long-form body copy. */
  copy: string;
  /** Supporting text: subtitles, margin notes. */
  ink2: string;
  /** Metadata, labels and numbers. Still readable text (4.5:1). */
  ink3: string;
  /** Decorative only, never text: the large section numerals. */
  faint: string;
  java: string;
  go: string;
  warn: string;
  synKeyword: string;
  synString: string;
  synConstant: string;
  synFunction: string;
  synComment: string;
  synPunctuation: string;
}

export interface Theme {
  id: ThemeId;
  name: string;
  /** One line for the picker. */
  description: string;
  scheme: 'light' | 'dark';
  tokens: ThemeTokens;
}

export const THEMES: Record<ThemeId, Theme> = {
  paper: {
    id: 'paper',
    name: 'Paper',
    description: 'Light, like a printed manual',
    scheme: 'light',
    tokens: {
      paper: '#f3f0e9',
      sunk: '#fbfaf6',
      chip: '#e7e2d6',
      rule: '#ddd6c8',
      ruleStrong: '#c4baa6',
      ink: '#1d1a15',
      copy: '#38332b',
      ink2: '#4f493d',
      ink3: '#655e4f',
      faint: '#e0d9cb',
      java: '#875b0b',
      go: '#0f6a59',
      warn: '#a2321e',
      synKeyword: '#6c3687',
      synString: '#3c6614',
      synConstant: '#a0431b',
      synFunction: '#1b5891',
      synComment: '#686152',
      synPunctuation: '#4f493d',
    },
  },
  lamp: {
    id: 'lamp',
    name: 'Lamplight',
    description: 'Warm charcoal under a desk lamp',
    scheme: 'dark',
    tokens: {
      paper: '#1a1814',
      sunk: '#211e19',
      chip: '#2c2821',
      rule: '#2f2a22',
      ruleStrong: '#4a4336',
      ink: '#f2ebdc',
      copy: '#d3cab8',
      ink2: '#b6ac98',
      ink3: '#a1977f',
      faint: '#2e2a23',
      java: '#dfad52',
      go: '#66c9b1',
      warn: '#ef9580',
      synKeyword: '#d6aae3',
      synString: '#b8d18f',
      synConstant: '#eea06d',
      synFunction: '#93c3ea',
      synComment: '#a0957f',
      synPunctuation: '#b6ac98',
    },
  },
  night: {
    id: 'night',
    name: 'Night ink',
    description: 'Blue-black, closest to the original',
    scheme: 'dark',
    tokens: {
      paper: '#0d0f17',
      sunk: '#12151f',
      chip: '#1c2030',
      rule: '#20243a',
      ruleStrong: '#353b56',
      ink: '#e9eaf4',
      copy: '#bfc1d4',
      ink2: '#a2a5bc',
      ink3: '#9093ad',
      faint: '#1d2133',
      java: '#d8b862',
      go: '#4fcbb2',
      warn: '#ee8a7c',
      synKeyword: '#b7a9ff',
      synString: '#a3d79e',
      synConstant: '#f2a77e',
      synFunction: '#8fc6ff',
      synComment: '#8f94b3',
      synPunctuation: '#a2a5bc',
    },
  },
  chalk: {
    id: 'chalk',
    name: 'Chalkboard',
    description: 'Slate green with chalk-white lines',
    scheme: 'dark',
    tokens: {
      paper: '#18221f',
      sunk: '#1d2926',
      chip: '#283631',
      rule: '#2b3a35',
      ruleStrong: '#435650',
      ink: '#eef3eb',
      copy: '#ccd7d0',
      ink2: '#adbdb5',
      ink3: '#9aada4',
      faint: '#24322e',
      java: '#eec770',
      go: '#93e2de',
      warn: '#f6a58f',
      synKeyword: '#e8badb',
      synString: '#c9df98',
      synConstant: '#f5ab86',
      synFunction: '#a3d0f3',
      synComment: '#9aada3',
      synPunctuation: '#adbdb5',
    },
  },
};

const toVar = (key: string) => `--${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;

function declarations(theme: Theme): string {
  const vars = Object.entries(theme.tokens).map(([key, value]) => `${toVar(key)}:${value}`);
  return [`color-scheme:${theme.scheme}`, ...vars].join(';');
}

/**
 * CSS for every theme. With no `data-theme` on <html> (no stored choice, or no
 * JavaScript) the system colour scheme decides between Paper and Night ink.
 */
export function themeCss(): string {
  const rules = THEME_IDS.map((id) => `:root[data-theme='${id}']{${declarations(THEMES[id])}}`);
  return [
    `:root{${declarations(THEMES[DEFAULT_LIGHT])}}`,
    `@media (prefers-color-scheme:dark){:root:not([data-theme]){${declarations(
      THEMES[DEFAULT_DARK],
    )}}}`,
    ...rules,
  ].join('\n');
}

/**
 * The browser's own chrome (theme-color: Android's address bar, an installed
 * app's title bar) follows the system by default, through the light/dark pair
 * in the root layout's viewport. A theme the reader picks adds one more
 * theme-color with this id at the top of <head>; the first match wins, and
 * React, which re-renders its own pair on every navigation, never touches it.
 */
export const THEME_COLOR_ID = 'theme-color-choice';

/**
 * Runs in <head> before first paint so a stored theme never flashes. Kept tiny
 * and dependency-free; storage access can throw in private modes.
 */
export const themeInitScript = `try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(${JSON.stringify(THEME_IDS)}.indexOf(t)>-1){document.documentElement.dataset.theme=t;var m=document.createElement('meta');m.name='theme-color';m.id=${JSON.stringify(
  THEME_COLOR_ID,
)};m.content=${JSON.stringify(
  Object.fromEntries(THEME_IDS.map((id) => [id, THEMES[id].tokens.paper])),
)}[t];document.head.prepend(m)}}catch(e){}`;

// ─── Contrast ──────────────────────────────────────────────────────────────

function luminance(hex: string): number {
  const channels = hex
    .replace('#', '')
    .match(/../g)!
    .map((c) => {
      const v = parseInt(c, 16) / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/** WCAG 2 contrast ratio between two `#rrggbb` colours. */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
