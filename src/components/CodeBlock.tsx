'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { LanguageLabel } from './BrandMarks';

interface CodeBlockProps {
  highlightedHtml: string;
  lang: 'go' | 'java';
  label?: ReactNode;
  rawCode: string;
}

export default function CodeBlock({ highlightedHtml, lang, label, rawCode }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(rawCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const headerBg = 'var(--bg-elevated)';
  const bodyBg = 'var(--bg-surface)';
  const borderC = 'var(--border-subtle)';
  const labelC = 'var(--text-muted)';
  const btnC = copied ? 'var(--accent-cyan)' : labelC;
  const fallbackLabel =
    lang === 'java' ? (
      <LanguageLabel language="java" size={13}>
        java
      </LanguageLabel>
    ) : (
      <LanguageLabel language="go" size={13}>
        go
      </LanguageLabel>
    );

  return (
    <div
      className="min-w-0 flex-1 overflow-hidden rounded-lg"
      style={{ border: `1px solid ${borderC}` }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3.5"
        style={{ background: headerBg, borderBottom: `1px solid ${borderC}`, padding: '10px 14px' }}
      >
        <span
          className="min-w-0"
          style={{
            color: labelC,
            fontSize: '0.8125rem',
            fontFamily: 'monospace',
            letterSpacing: 0.8,
          }}
        >
          {label || fallbackLabel}
        </span>
        <button
          onClick={copy}
          type="button"
          className="inline-flex items-center justify-center rounded"
          style={{
            background: 'none',
            border: `1px solid ${borderC}`,
            borderRadius: 4,
            color: btnC,
            cursor: 'pointer',
            fontSize: '0.75rem',
            lineHeight: 1,
            padding: '7px 10px',
            fontFamily: 'monospace',
            transition: 'color 0.2s',
          }}
        >
          {copied ? 'copied' : 'copy'}
        </button>
      </div>

      {/* Code */}
      <div style={{ background: bodyBg }} dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
    </div>
  );
}
