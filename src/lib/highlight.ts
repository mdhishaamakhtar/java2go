import { createHighlighter, type Highlighter } from 'shiki';
import theme from './shiki-theme.json';

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [theme as Parameters<typeof createHighlighter>[0]['themes'][number]],
      langs: ['go', 'java'],
    });
  }
  return highlighterPromise;
}

export async function highlight(code: string, lang: 'go' | 'java'): Promise<string> {
  const hl = await getHighlighter();
  return hl.codeToHtml(code.trim(), {
    lang,
    theme: 'go2java-dark',
  });
}
