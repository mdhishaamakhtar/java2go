'use client';

import { useState } from 'react';

interface CodeBlockProps {
  highlightedHtml: string;
  lang: 'go' | 'java';
  label?: string;
  rawCode: string;
}

export default function CodeBlock({ highlightedHtml, lang, label, rawCode }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(rawCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const isJava = lang === 'java';
  const headerBg = 'var(--bg-elevated)';
  const bodyBg = 'var(--bg-surface)';
  const borderC = 'var(--border-subtle)';
  const labelC = 'var(--text-muted)';
  const btnC = copied ? 'var(--accent-cyan)' : labelC;

  return (
    <div
      className="min-w-0 flex-1 overflow-hidden rounded-lg"
      style={{ border: `1px solid ${borderC}` }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3.5"
        style={{ background: headerBg, borderBottom: `1px solid ${borderC}`, padding: '6px 14px' }}
      >
        <span style={{ color: labelC, fontSize: 10, fontFamily: 'monospace', letterSpacing: 1 }}>
          {label || (isJava ? '☕  java' : '◎  go')}
        </span>
        <button
          onClick={copy}
          type="button"
          style={{
            background: 'none',
            border: `1px solid ${borderC}`,
            borderRadius: 4,
            color: btnC,
            cursor: 'pointer',
            fontSize: 10,
            minWidth: 44,
            minHeight: 44,
            padding: '8px 12px',
            fontFamily: 'monospace',
            transition: 'color 0.2s',
          }}
        >
          {copied ? 'copied' : 'copy'}
        </button>
      </div>

      {/* Code */}
      <div
        style={{ background: bodyBg }}
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
    </div>
  );
}
