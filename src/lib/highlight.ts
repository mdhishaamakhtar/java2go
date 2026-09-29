import 'server-only';
import { createHighlighter, type Highlighter, type ThemeRegistration } from 'shiki';
import type { CodeLang } from '@/types/section';
import theme from './shiki-theme.json';

const THEME_NAME = 'java2go-dark';

const LANGS = [
  'go',
  'java',
  'bash',
  'xml',
  'json',
  'yaml',
  'sql',
  'dockerfile',
  'properties',
] as const satisfies readonly Exclude<CodeLang, 'text'>[];

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({
    themes: [theme as ThemeRegistration],
    langs: [...LANGS],
  }).catch((error: unknown) => {
    // Let the next call retry instead of caching a rejected promise forever.
    highlighterPromise = null;
    throw error;
  });
  return highlighterPromise;
}

/** Drop leading blank lines and trailing whitespace, keep first-line indentation. */
export function normalizeCode(code: string): string {
  return code.replace(/^(?:[ \t]*\n)+/, '').trimEnd();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function plainHtml(code: string): string {
  return `<pre class="shiki" tabindex="0"><code>${escapeHtml(code)}</code></pre>`;
}

/**
 * Highlight code to HTML at build time. Highlighting is an enhancement: if
 * Shiki fails for any reason, the code still renders as plain, escaped text
 * rather than failing the whole page.
 */
export async function highlight(code: string, lang: CodeLang): Promise<string> {
  const source = normalizeCode(code);
  if (lang === 'text') return plainHtml(source);

  try {
    const highlighter = await getHighlighter();
    return highlighter.codeToHtml(source, { lang, theme: THEME_NAME });
  } catch (error) {
    console.error(`[highlight] Falling back to plain text for a ${lang} block:`, error);
    return plainHtml(source);
  }
}
