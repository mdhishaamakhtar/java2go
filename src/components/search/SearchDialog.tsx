'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { searchEntries, type SearchEntry } from '@/lib/search';
import { CloseIcon, HashIcon, ReturnIcon, SearchIcon, WarningIcon } from '../icons';
import type { IndexState } from './SearchProvider';

interface SearchDialogProps {
  index: IndexState;
  onRetry: () => void;
  open: boolean;
  onClose: () => void;
}

const NO_ENTRIES: SearchEntry[] = [];

export default function SearchDialog({ index, onRetry, open, onClose }: SearchDialogProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const listId = useId();
  const optionId = (i: number) => `${listId}-option-${i}`;

  const entries = index.status === 'ready' ? index.entries : NO_ENTRIES;
  const results = searchEntries(entries, query);
  const active = results.length === 0 ? -1 : Math.min(activeIndex, results.length - 1);

  // Sync the controlled `open` prop with the native modal dialog.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Keep the highlighted option visible while arrowing through results.
  useEffect(() => {
    if (active < 0) return;
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  function reset() {
    setQuery('');
    setActiveIndex(0);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function go(entry: SearchEntry) {
    handleClose();
    router.push(entry.href);
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (results.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((active + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((active - 1 + results.length) % results.length);
    } else if (event.key === 'Home' && event.ctrlKey) {
      setActiveIndex(0);
    } else if (event.key === 'End' && event.ctrlKey) {
      setActiveIndex(results.length - 1);
    } else if (event.key === 'Enter' && active >= 0) {
      event.preventDefault();
      go(results[active]);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="palette"
      aria-label="Search the guide"
      onClose={handleClose}
      onClick={(event) => {
        // A click on the dialog element itself is a click on the backdrop.
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_24px_64px_-16px_rgb(0_0_0/0.7)]">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <SearchIcon size={18} className="shrink-0 text-muted" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onInputKeyDown}
            placeholder="Search sections and topics…"
            aria-label="Search sections and topics"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? optionId(active) : undefined}
            autoComplete="off"
            spellCheck={false}
            className="h-14 min-w-0 flex-1 bg-transparent text-body text-primary outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
          />
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-elevated hover:text-primary"
            aria-label="Close search"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Search results"
          className="max-h-[min(60vh,28rem)] overflow-y-auto overscroll-contain p-2"
        >
          {results.map((entry, i) => (
            <li
              key={entry.href}
              id={optionId(i)}
              role="option"
              aria-selected={i === active}
              data-index={i}
              onMouseMove={() => i !== active && setActiveIndex(i)}
            >
              <Link
                href={entry.href}
                tabIndex={-1}
                onClick={handleClose}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors ${
                  i === active ? 'bg-elevated text-primary' : 'text-secondary'
                }`}
              >
                <span className="w-6 shrink-0 text-center font-mono text-caption text-muted tabular-nums">
                  {entry.kind === 'section' ? (
                    entry.number
                  ) : (
                    <HashIcon size={14} className="mx-auto" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-label font-medium">{entry.title}</span>
                  <span className="block truncate text-caption text-muted">
                    {entry.kind === 'heading'
                      ? `${entry.number} · ${entry.context}`
                      : entry.context}
                  </span>
                </span>
                {i === active && <ReturnIcon size={14} className="shrink-0 text-muted" />}
              </Link>
            </li>
          ))}
        </ul>

        {(index.status === 'loading' || index.status === 'idle') && (
          <div className="space-y-2 p-3" role="status" aria-label="Loading search index">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-1.5">
                <div className="h-4 w-6 animate-pulse rounded bg-elevated" />
                <div className="h-4 flex-1 animate-pulse rounded bg-elevated" />
              </div>
            ))}
          </div>
        )}

        {index.status === 'error' && (
          <div className="px-6 pt-4 pb-8 text-center text-label text-secondary" role="alert">
            <WarningIcon size={20} className="mx-auto mb-2 text-[var(--note-warn-text)]" />
            <p>Search could not be loaded. Check your connection and try again.</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 rounded-md border border-line px-3 py-1.5 text-caption font-medium text-primary transition-colors hover:bg-elevated"
            >
              Retry
            </button>
          </div>
        )}

        {index.status === 'ready' && results.length === 0 && (
          <div className="px-6 pt-2 pb-8 text-center text-label text-secondary" role="status">
            <p>
              No results for <span className="text-primary">“{query.trim()}”</span>.
            </p>
            <p className="mt-1 text-caption text-muted">
              Try a Go term like <em>channel</em>, <em>interface</em> or <em>defer</em>, or a Java
              one like <em>ExecutorService</em>.
            </p>
          </div>
        )}

        <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-caption text-muted max-sm:hidden">
          <span>
            <Kbd>↑</Kbd> <Kbd>↓</Kbd> to navigate
          </span>
          <span>
            <Kbd>Enter</Kbd> to open
          </span>
          <span>
            <Kbd>Esc</Kbd> to close
          </span>
        </div>
      </div>
    </dialog>
  );
}

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex min-w-5 items-center justify-center rounded border border-line bg-elevated px-1 font-sans text-[0.75rem] text-secondary">
      {children}
    </kbd>
  );
}
