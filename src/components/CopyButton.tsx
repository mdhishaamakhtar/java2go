'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckIcon, CopyIcon, WarningIcon } from './icons';

type CopyState = 'idle' | 'copied' | 'failed';

/** execCommand fallback for browsers or contexts without the async Clipboard API. */
function legacyCopy(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  try {
    textarea.select();
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}

const STATUS_MESSAGE: Record<CopyState, string> = {
  idle: '',
  copied: 'Code copied to clipboard',
  failed: 'Copy failed. Select the code and copy it manually.',
};

export default function CopyButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<CopyState>('idle');
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  async function copy() {
    let ok: boolean;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      ok = legacyCopy(text);
    }

    setState(ok ? 'copied' : 'failed');
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setState('idle'), ok ? 1800 : 4000);
  }

  const tone =
    state === 'copied'
      ? 'text-go border-go/40'
      : state === 'failed'
        ? 'text-[var(--note-warn-text)] border-[var(--note-warn-border)]'
        : 'text-muted border-line hover:border-muted/60 hover:text-primary';

  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label} code`}
        className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-caption leading-none font-medium transition-colors ${tone}`}
      >
        {state === 'copied' ? (
          <CheckIcon size={14} />
        ) : state === 'failed' ? (
          <WarningIcon size={14} />
        ) : (
          <CopyIcon size={14} />
        )}
        <span aria-hidden="true" className="max-sm:hidden">
          {state === 'copied' ? 'Copied' : state === 'failed' ? 'Failed' : 'Copy'}
        </span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {STATUS_MESSAGE[state]}
      </span>
    </>
  );
}
