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
      ? 'text-go border-go/50'
      : state === 'failed'
        ? 'text-warn border-warn/50'
        : 'text-ink-3 border-rule hover:border-rule-strong hover:text-ink';

  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label} code`}
        className={`inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border px-2 font-sans text-caption leading-none font-medium transition-colors ${tone}`}
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
