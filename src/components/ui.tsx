import React from 'react';

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
    icon: '☕',
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
  return (
    <div
      className="my-3 rounded-lg"
      style={{
        padding: '10px 14px',
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderLeft: `3px solid ${s.border}`,
      }}
    >
      <span style={{ color: s.text, fontSize: 13 }}>
        <span className="mr-2 opacity-80">{s.icon}</span>
        {children}
      </span>
    </div>
  );
}

// ─── Prose ─────────────────────────────────────────────────────────────────

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="my-2.5 leading-relaxed"
      style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.9 }}
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
        fontSize: 15,
        fontWeight: 700,
        margin: '26px 0 8px',
        borderBottom: '1px solid var(--border-dim)',
        paddingBottom: 6,
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
        color: '#a0a0c0',
        fontSize: 13,
        fontWeight: 600,
        margin: '18px 0 4px',
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
        fontSize: 12,
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
        padding: '14px 16px',
        background: '#0a0a16',
        border: '1px solid #2a2a4a',
        borderLeft: `3px solid ${c}`,
      }}
    >
      <div className="mb-2 font-bold uppercase tracking-widest" style={{ color: c, fontSize: 11 }}>
        {title}
      </div>
      <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.85 }}>
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
        padding: '10px 14px',
        background: 'var(--note-why-bg)',
        border: '1px solid var(--note-why-border)',
        borderLeft: '3px solid #2e7a7a',
      }}
    >
      <span
        className="mr-2 font-bold uppercase tracking-widest"
        style={{ color: '#5a9a9a', fontSize: 11 }}
      >
        Why Go does this
      </span>
      <span style={{ color: 'var(--note-why-text)', fontSize: 13 }}>{children}</span>
    </div>
  );
}
