import type { ReactNode } from 'react';
import type { NoteType, Tone } from '@/types/section';
import { JavaMark } from '../BrandMarks';
import { RichText, splitParagraphs } from '../RichText';

function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <div className={`space-y-[0.8em] ${className ?? ''}`}>
      {splitParagraphs(text).map((paragraph, i) => (
        <p key={i}>
          <RichText text={paragraph} />
        </p>
      ))}
    </div>
  );
}

function Label({ children, color }: { children: ReactNode; color: string }) {
  return (
    <p
      className="mb-1.5 flex items-center gap-1.5 font-sans text-caption leading-none font-bold [font-stretch:112.5%]"
      style={{ color }}
    >
      {children}
    </p>
  );
}

const MARGIN_NOTE: Record<'java' | 'tip' | 'info', { label: string; color: string }> = {
  java: { label: 'Coming from Java', color: 'var(--java)' },
  tip: { label: 'Tip', color: 'var(--go)' },
  info: { label: 'Note', color: 'var(--ink3)' },
};

/**
 * "Coming from Java", tips and notes. In the margin (wide screens) a note
 * hangs from a coloured top rule beside the block it belongs to; as an aside
 * (narrow screens, or no free margin) it is indented under a left rule.
 */
export function MarginNote({
  type,
  text,
  inMargin,
}: {
  type: 'java' | 'tip' | 'info';
  text: string;
  inMargin: boolean;
}) {
  const { label, color } = MARGIN_NOTE[type];
  return (
    <aside
      className={`mt-(--block-gap) max-w-measure border-l-2 pl-4 font-sans text-note leading-[1.55] text-ink-2 ${
        inMargin ? 'in-margin folio:border-t folio:border-l-0 folio:pt-2.5 folio:pl-0' : ''
      }`}
      style={{ borderColor: color }}
    >
      <Label color={color}>
        {type === 'java' && <JavaMark size={14} />}
        {label}
      </Label>
      <Paragraphs text={text} />
    </aside>
  );
}

/** Warnings stay in the text column: nobody should be able to skim past one. */
export function Warning({ text }: { text: string }) {
  return (
    <aside
      className="mt-(--block-gap) border-l-[3px] border-warn bg-sunk py-3.5 pr-4 pl-4 text-[1.0625rem] leading-[1.65] text-copy"
      aria-label="Watch out"
    >
      <Label color="var(--warn)">Watch out</Label>
      <Paragraphs text={text} />
    </aside>
  );
}

/** The reasoning behind a design choice, set as a pull quote. */
export function PullQuote({ text }: { text: string }) {
  return (
    <aside className="mt-[calc(var(--block-gap)+0.5rem)] border-l-2 border-go py-1 pl-5">
      <Label color="var(--go)">Why Go does this</Label>
      <Paragraphs
        text={text}
        className="font-serif text-body-lg leading-[1.55] text-ink italic [&_code]:not-italic"
      />
    </aside>
  );
}

/**
 * Production and runtime detail, boxed across the full width: "In production"
 * notes and "Under the hood" callouts.
 */
export function EngineBox({ title, text }: { title?: string; text: string }) {
  return (
    <aside className="span-full mt-10 border border-rule bg-sunk px-5 py-5 sm:px-7">
      <Label color="var(--ink3)">{title ? 'Under the hood' : 'In production'}</Label>
      {title && (
        <p className="mt-2 font-sans text-[1.0625rem] font-bold text-ink [font-stretch:112.5%]">
          <RichText text={title} />
        </p>
      )}
      <Paragraphs
        text={text}
        className="mt-2 max-w-measure text-[1.0625rem] leading-[1.65] text-copy"
      />
    </aside>
  );
}

const TONE_COLOR: Record<Exclude<Tone, 'engine'>, string> = {
  go: 'var(--go)',
  java: 'var(--java)',
  info: 'var(--ink3)',
  warn: 'var(--warn)',
};

/** A titled panel in the text column; the tone shows as the top rule. */
export function Callout({
  title,
  text,
  tone = 'info',
}: {
  title: string;
  text: string;
  tone?: Tone;
}) {
  if (tone === 'engine') return <EngineBox title={title} text={text} />;
  return (
    <section
      className="mt-[calc(var(--block-gap)+0.5rem)] border border-t-2 border-rule bg-sunk px-5 py-4"
      style={{ borderTopColor: TONE_COLOR[tone] }}
    >
      <p className="font-sans text-[1.0625rem] leading-snug font-bold text-ink [font-stretch:112.5%]">
        <RichText text={title} />
      </p>
      <Paragraphs text={text} className="mt-2 text-[1.0625rem] leading-[1.65] text-copy" />
    </section>
  );
}

/** Render any `note` block in its placement. */
export function Note({
  type,
  text,
  inMargin,
}: {
  type: NoteType;
  text: string;
  inMargin: boolean;
}) {
  switch (type) {
    case 'java':
    case 'tip':
    case 'info':
      return <MarginNote type={type} text={text} inMargin={inMargin} />;
    case 'warn':
      return <Warning text={text} />;
    case 'engine':
      return <EngineBox text={text} />;
    case 'why':
      return <PullQuote text={text} />;
  }
}
