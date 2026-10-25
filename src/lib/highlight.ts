import 'server-only';
import {
  createCssVariablesTheme,
  createHighlighter,
  type Highlighter,
  type ShikiTransformer,
} from 'shiki';
import type { CodeLang } from '@/types/section';
import { indentOf, normalizeCode } from './code-layout';

// Token colours come from CSS variables (`--shiki-token-*`), which globals.css
// maps onto the active reading theme, so one build serves all four themes.
const theme = createCssVariablesTheme({
  name: 'java2go-themed',
  variablePrefix: '--shiki-',
  fontStyle: false,
});

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
    themes: [theme],
    langs: [...LANGS],
  }).catch((error: unknown) => {
    // Let the next call retry instead of caching a rejected promise forever.
    highlighterPromise = null;
    throw error;
  });
  return highlighterPromise;
}

/**
 * Code never scrolls sideways; a line too long for its box wraps (see
 * `.shiki` in globals.css). Each line carries its own indentation as
 * `--indent`, so a wrapped line continues two columns in from where it
 * started, not at the left edge.
 */
function wrappableLines(lines: string[]): ShikiTransformer {
  return {
    name: 'java2go:wrappable-lines',
    line(node, line) {
      node.properties.style = `--indent:${indentOf(lines[line - 1] ?? '')}ch`;
    },
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** The same structure Shiki produces, without colours. */
function plainHtml(code: string): string {
  const lines = code
    .split('\n')
    .map(
      (line) =>
        `<span class="line" style="--indent:${indentOf(line)}ch">${escapeHtml(line)}</span>`,
    )
    .join('\n');
  return `<pre class="shiki"><code>${lines}</code></pre>`;
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
    return highlighter.codeToHtml(source, {
      lang,
      theme: theme.name!,
      // Nothing scrolls, so the block needs no keyboard focus stop.
      tabindex: false,
      transformers: [wrappableLines(source.split('\n'))],
    });
  } catch (error) {
    console.error(`[highlight] Falling back to plain text for a ${lang} block:`, error);
    return plainHtml(source);
  }
}
