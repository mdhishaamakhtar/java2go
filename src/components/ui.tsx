import type { ComponentType } from 'react';
import type { NoteType, Tone } from '@/types/section';
import { JavaMark, GoMark } from './BrandMarks';
import { GaugeIcon, InfoIcon, LightbulbIcon, LinkIcon, QuestionIcon, WarningIcon } from './icons';
import { RichText, splitParagraphs } from './RichText';

// ─── Paragraph helpers ─────────────────────────────────────────────────────

function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {splitParagraphs(text).map((paragraph, i) => (
        <p key={i} className={className}>
          <RichText text={paragraph} />
        </p>
      ))}
    </>
  );
}

// ─── Prose ─────────────────────────────────────────────────────────────────

export function Prose({ text }: { text: string }) {
  return (
    <Paragraphs text={text} className="my-4 max-w-measure text-body leading-[1.75] text-copy" />
  );
}

export function BulletList({ items, ordered }: { items: string[]; ordered?: boolean }) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag
      className={`my-4 max-w-measure space-y-2 pl-6 text-body leading-[1.7] text-copy marker:text-muted ${
        ordered ? 'list-decimal marker:font-mono marker:text-caption' : 'list-disc'
      }`}
    >
      {items.map((item, i) => (
        <li key={i} className="pl-1">
          <RichText text={item} />
        </li>
      ))}
    </Tag>
  );
}

// ─── Headings ──────────────────────────────────────────────────────────────

function AnchorLink({ id, label }: { id: string; label: string }) {
  return (
    <a
      href={`#${id}`}
      className="ml-2 inline-flex translate-y-[-0.1em] items-center rounded p-1 align-middle text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-go focus-visible:opacity-100"
      aria-label={`Link to “${label}”`}
    >
      <LinkIcon size={16} />
    </a>
  );
}

export function Heading({ id, text }: { id: string; text: string }) {
  return (
    <h2
      id={id}
      className="group mt-16 mb-4 border-b border-line-dim pb-2.5 text-heading leading-tight font-bold tracking-[-0.01em] text-primary first:mt-0"
    >
      <RichText text={text} />
      <AnchorLink id={id} label={text} />
    </h2>
  );
}

export function Subheading({ id, text }: { id: string; text: string }) {
  return (
    <h3
      id={id}
      className="group mt-10 mb-3 text-subheading leading-snug font-semibold text-primary"
    >
      <RichText text={text} />
      <AnchorLink id={id} label={text} />
    </h3>
  );
}

// ─── Notes ─────────────────────────────────────────────────────────────────

const NOTE_META: Record<NoteType, { label: string; Icon: ComponentType<{ size?: number }> }> = {
  info: { label: 'Note', Icon: InfoIcon },
  java: { label: 'Coming from Java', Icon: JavaMark },
  warn: { label: 'Watch out', Icon: WarningIcon },
  tip: { label: 'Tip', Icon: LightbulbIcon },
  engine: { label: 'In production', Icon: GaugeIcon },
  why: { label: 'Why', Icon: QuestionIcon },
};

export function Note({ type, text, label }: { type: NoteType; text: string; label?: string }) {
  const { label: defaultLabel, Icon } = NOTE_META[type];
  const [first = '', ...rest] = splitParagraphs(text);
  const color = `var(--note-${type}-text)`;

  return (
    <aside
      className="my-6 flex max-w-measure gap-3 rounded-lg border px-4 py-3.5 text-label leading-[1.7]"
      style={{
        background: `var(--note-${type}-bg)`,
        borderColor: `var(--note-${type}-border)`,
        color: `color-mix(in srgb, ${color} 42%, var(--text-primary))`,
      }}
    >
      <span className="mt-[0.3em] shrink-0" style={{ color }}>
        <Icon size={16} />
      </span>
      <div className="min-w-0 space-y-2">
        <p>
          <strong className="mr-1.5 font-semibold" style={{ color }}>
            {label ?? defaultLabel}.
          </strong>
          <RichText text={first} />
        </p>
        {rest.map((paragraph, i) => (
          <p key={i}>
            <RichText text={paragraph} />
          </p>
        ))}
      </div>
    </aside>
  );
}

// ─── Callout ───────────────────────────────────────────────────────────────

const TONE_COLOR: Record<Tone, string> = {
  go: 'var(--accent-cyan)',
  java: 'var(--accent-java)',
  info: 'var(--accent-link)',
  engine: 'var(--note-engine-text)',
  warn: 'var(--note-warn-text)',
};

export function Callout({
  title,
  text,
  tone = 'info',
}: {
  title: string;
  text: string;
  tone?: Tone;
}) {
  const color = TONE_COLOR[tone];
  return (
    <section
      className="my-7 max-w-measure rounded-lg border bg-panel px-5 py-4"
      style={{ borderColor: `color-mix(in srgb, ${color} 32%, var(--border-subtle))` }}
    >
      <p className="mb-2 text-caption font-bold tracking-[0.08em] uppercase" style={{ color }}>
        {title}
      </p>
      <div className="space-y-3 text-body leading-[1.75] text-copy">
        <Paragraphs text={text} />
      </div>
    </section>
  );
}

// ─── Table ─────────────────────────────────────────────────────────────────

function HeadLabel({
  label,
  index,
  isDefault,
}: {
  label: string;
  index: number;
  isDefault: boolean;
}) {
  if (!isDefault) return <>{label}</>;
  const Mark = index === 0 ? JavaMark : GoMark;
  return (
    <span className={`inline-flex items-center gap-2 ${index === 0 ? 'text-java' : 'text-go'}`}>
      <Mark size={14} />
      {label}
    </span>
  );
}

/** Mobile rows stack; each cell is prefixed by its column's mark or name. */
function CellPrefix({
  label,
  index,
  isDefault,
}: {
  label: string;
  index: number;
  isDefault: boolean;
}) {
  if (isDefault) {
    const Mark = index === 0 ? JavaMark : GoMark;
    return (
      <span className="mt-[0.3em] shrink-0 sm:hidden">
        <Mark size={13} />
      </span>
    );
  }
  return (
    <span className="block shrink-0 text-caption font-semibold text-muted sm:hidden">{label}</span>
  );
}

export function DataTable({ rows, head }: { rows: string[][]; head?: string[] }) {
  const isDefault = !head;
  const labels = head ?? ['Java', 'Go'];

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-line-panel bg-panel">
      <table className="w-full border-collapse text-left text-label leading-[1.6] max-sm:block">
        <thead className="max-sm:sr-only">
          <tr className="border-b border-line-panel bg-surface">
            {labels.map((label, i) => (
              <th
                key={i}
                scope="col"
                className="px-4 py-2.5 align-bottom text-caption font-semibold text-secondary"
                style={{ width: `${100 / labels.length}%` }}
              >
                <HeadLabel label={label} index={i} isDefault={isDefault} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="max-sm:block">
          {rows.map((row, r) => (
            <tr
              key={r}
              className="border-b border-line-dim last:border-b-0 max-sm:block max-sm:space-y-1.5 max-sm:px-4 max-sm:py-3"
            >
              {row.map((cell, c) => (
                <td
                  key={c}
                  className={`px-4 py-3 align-top max-sm:p-0 ${
                    isDefault ? 'max-sm:flex max-sm:gap-2' : 'max-sm:block'
                  } ${c === 0 ? 'text-copy' : 'text-primary'}`}
                >
                  <CellPrefix label={labels[c]} index={c} isDefault={isDefault} />
                  <span className="min-w-0">
                    <RichText text={cell} />
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
