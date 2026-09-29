import type { CodeLang } from '@/types/section';
import { GoMark, JavaMark, LanguageLabel } from './BrandMarks';
import CopyButton from './CopyButton';

const LANG_NAMES: Record<CodeLang, string> = {
  go: 'Go',
  java: 'Java',
  bash: 'Shell',
  xml: 'XML',
  json: 'JSON',
  yaml: 'YAML',
  sql: 'SQL',
  dockerfile: 'Dockerfile',
  properties: 'Properties',
  text: 'Text',
};

interface CodeBlockProps {
  /** Pre-highlighted HTML from `highlight()`. */
  html: string;
  /** The exact source shown, used for copy-to-clipboard. */
  code: string;
  lang: CodeLang;
  label?: string;
  /** Which side of the Java/Go story this snippet belongs to, if any. */
  side?: 'java' | 'go';
}

export default function CodeBlock({ html, code, lang, label, side }: CodeBlockProps) {
  const title = label || LANG_NAMES[lang];
  const brand = side ?? (lang === 'go' || lang === 'java' ? lang : undefined);

  return (
    <figure className="m-0 flex min-w-0 flex-col overflow-hidden rounded-lg border border-line bg-surface">
      <figcaption className="flex min-h-11 items-center justify-between gap-3 border-b border-line bg-elevated py-1.5 pr-1.5 pl-3.5">
        <span className="min-w-0 text-caption leading-snug font-medium">
          {side ? (
            // In a Java/Go pair the label colour says which side is which
            <LanguageLabel language={side} size={14}>
              {title}
            </LanguageLabel>
          ) : brand ? (
            <span className="inline-flex min-w-0 items-center gap-2 align-middle text-secondary">
              {brand === 'go' ? <GoMark size={14} /> : <JavaMark size={14} />}
              <span className="min-w-0">{title}</span>
            </span>
          ) : (
            <span className="text-secondary">{title}</span>
          )}
        </span>
        <CopyButton text={code} label={title} />
      </figcaption>
      <div className="min-w-0 flex-1 [&_pre]:h-full" dangerouslySetInnerHTML={{ __html: html }} />
    </figure>
  );
}
