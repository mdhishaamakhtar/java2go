import type { CodeLang } from '@/types/section';
import { GoMark, JavaMark } from '../BrandMarks';
import CopyButton from '../CopyButton';

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

export interface CodeProps {
  /** Pre-highlighted HTML from `highlight()`. */
  html: string;
  /** The exact source shown, used for copy-to-clipboard. */
  code: string;
  lang: CodeLang;
  label?: string;
  /** Which side of a Java/Go comparison this snippet is. Colours the label. */
  side?: 'java' | 'go';
}

/** A labelled snippet without its own frame: the shared inside of every code block. */
export function CodePane({ html, code, lang, label, side }: CodeProps) {
  const title = label || LANG_NAMES[lang];
  const brand = side ?? (lang === 'go' || lang === 'java' ? lang : undefined);
  const Mark = brand === 'java' ? JavaMark : brand === 'go' ? GoMark : null;
  const tint = side === 'java' ? 'text-java' : side === 'go' ? 'text-go' : 'text-ink-2';

  return (
    <figure className="m-0 flex min-w-0 flex-col">
      <figcaption className="flex min-h-10 items-center justify-between gap-3 border-b border-rule py-1.5 pr-1.5 pl-3.5">
        <span
          className={`inline-flex min-w-0 items-center gap-2 font-sans text-caption leading-snug font-semibold ${tint}`}
        >
          {Mark && <Mark size={14} className="shrink-0" />}
          <span className="min-w-0">{title}</span>
        </span>
        <CopyButton text={code} label={title} />
      </figcaption>
      <div className="min-w-0 flex-1 [&_pre]:h-full" dangerouslySetInnerHTML={{ __html: html }} />
    </figure>
  );
}

/**
 * A standalone snippet: in the text column, or across the folio (`wide`) when
 * its lines are too long for the column.
 */
export default function CodeBlock({ wide, ...props }: CodeProps & { wide?: boolean }) {
  return (
    <div
      className={`mt-(--block-gap) overflow-hidden rounded-[0.3rem] border border-rule-strong bg-sunk ${wide ? 'span-full' : ''}`}
    >
      <CodePane {...props} />
    </div>
  );
}
