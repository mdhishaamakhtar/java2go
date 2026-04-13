import React from 'react';
import { JavaMark } from './BrandMarks';

// ─── Note ──────────────────────────────────────────────────────────────────

const NOTE_STYLES = {
  info: {
    bg: 'var(--note-info-bg)',
    border: 'var(--note-info-border)',
    text: 'var(--note-info-text)',
    icon: 'ℹ',
  },
  java: {
    bg: 'var(--note-java-bg)',
    border: 'var(--note-java-border)',
    text: 'var(--note-java-text)',
    icon: '',
  },
  warn: {
    bg: 'var(--note-warn-bg)',
    border: 'var(--note-warn-border)',
    text: 'var(--note-warn-text)',
    icon: '!',
  },
  tip: {
    bg: 'var(--note-tip-bg)',
    border: 'var(--note-tip-border)',
    text: 'var(--note-tip-text)',
    icon: '→',
  },
  engine: {
    bg: 'var(--note-engine-bg)',
    border: 'var(--note-engine-border)',
    text: 'var(--note-engine-text)',
    icon: '⚙',
  },
  why: {
    bg: 'var(--note-why-bg)',
    border: 'var(--note-why-border)',
    text: 'var(--note-why-text)',
    icon: '?',
  },
} as const;

export type NoteType = keyof typeof NOTE_STYLES;

export function Note({ children, type = 'info' }: { children: React.ReactNode; type?: NoteType }) {
  const s = NOTE_STYLES[type];
  const icon =
    type === 'java' ? <JavaMark size={14} /> : <span className="opacity-80">{s.icon}</span>;
  return (
    <div
      className="my-3 rounded-lg"
      style={{
        padding: '14px 16px',
        background: s.bg,
        border: `1px solid ${s.border}`,
        boxShadow: `inset 0 1px 0 color-mix(in srgb, ${s.border} 38%, transparent)`,
      }}
    >
      <span
        className="inline-flex items-start gap-2.5"
        style={{ color: s.text, fontSize: 'var(--text-label)', lineHeight: 1.7 }}
      >
        <span className="mt-[1px] shrink-0">{icon}</span>
        <span>{children}</span>
      </span>
    </div>
  );
}

// ─── Prose ─────────────────────────────────────────────────────────────────

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="my-2.5 leading-relaxed"
      style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-body)', lineHeight: 1.9 }}
    >
      {children}
    </p>
  );
}

// ─── H (h3) ────────────────────────────────────────────────────────────────

export function H({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="mb-2 pb-1.5 font-bold"
      style={{
        color: 'var(--text-primary)',
        fontSize: 'var(--text-heading)',
        fontWeight: 700,
        lineHeight: 1.25,
        margin: '34px 0 12px',
        borderBottom: '1px solid var(--border-dim)',
        paddingBottom: 8,
      }}
    >
      {children}
    </h3>
  );
}

// ─── H2 (h4) ───────────────────────────────────────────────────────────────

export function H2({ children }: { children: React.ReactNode }) {
  return (
    <h4
      className="font-semibold uppercase tracking-widest"
      style={{
        color: 'var(--text-muted)',
        fontSize: 'var(--text-label)',
        fontWeight: 600,
        margin: '22px 0 6px',
      }}
    >
      {children}
    </h4>
  );
}

// ─── Tag (inline code) ─────────────────────────────────────────────────────

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <code
      style={{
        background: 'var(--bg-elevated)',
        color: 'var(--syn-keyword)',
        padding: '1px 6px',
        borderRadius: 4,
        fontSize: '0.875rem',
        fontFamily: 'monospace',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {children}
    </code>
  );
}

// ─── Callout ───────────────────────────────────────────────────────────────

export function Callout({
  title,
  children,
  color,
}: {
  title: string;
  children: React.ReactNode;
  color?: string;
}) {
  const c = color || 'var(--accent-blue)';
  return (
    <div
      className="my-4 rounded-lg"
      style={{
        padding: '16px 18px',
        background: 'var(--bg-panel)',
        border: `1px solid color-mix(in srgb, ${c} 30%, var(--border-subtle))`,
        boxShadow: `inset 0 1px 0 color-mix(in srgb, ${c} 28%, transparent)`,
      }}
    >
      <div
        className="mb-2 font-bold uppercase tracking-widest"
        style={{ color: c, fontSize: 'var(--text-caption)' }}
      >
        {title}
      </div>
      <div
        style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-body)', lineHeight: 1.85 }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── WhyBox ────────────────────────────────────────────────────────────────

export function WhyBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="my-2.5 rounded-lg"
      style={{
        padding: '14px 16px',
        background: 'var(--note-why-bg)',
        border: '1px solid var(--note-why-border)',
        boxShadow: 'inset 0 1px 0 color-mix(in srgb, var(--note-why-border) 40%, transparent)',
      }}
    >
      <span
        className="mr-2 font-bold uppercase tracking-widest"
        style={{ color: 'var(--note-why-text)', fontSize: 'var(--text-caption)' }}
      >
        Why Go does this
      </span>
      <span
        style={{ color: 'var(--note-why-text)', fontSize: 'var(--text-label)', lineHeight: 1.7 }}
      >
        {children}
      </span>
    </div>
  );
}
