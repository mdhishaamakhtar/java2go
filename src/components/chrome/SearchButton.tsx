'use client';

import { useSyncExternalStore } from 'react';
import { useSearch } from '../search/SearchProvider';
import { SearchIcon } from '../icons';

const noopSubscribe = () => () => {};

function useIsApplePlatform(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => /Mac|iPhone|iPad|iPod/.test(navigator.userAgent),
    () => false,
  );
}

/** Search trigger for the running header, with the shortcut hint on wider screens. */
export default function SearchButton() {
  const { open } = useSearch();
  const isApple = useIsApplePlatform();

  return (
    <button
      type="button"
      onClick={open}
      aria-haspopup="dialog"
      aria-keyshortcuts="Meta+K Control+K /"
      aria-label="Search the guide"
      title="Search (⌘K / Ctrl K)"
      className="inline-flex h-9 items-center gap-2 rounded-md px-2 font-sans text-label font-medium text-ink-2 transition-colors hover:bg-chip hover:text-ink"
    >
      <SearchIcon size={16} className="shrink-0" />
      <span className="max-md:sr-only">Search</span>
      <kbd className="rounded border border-rule-strong px-1.5 py-0.5 font-sans text-micro leading-none text-ink-3 max-lg:hidden">
        {isApple ? '⌘K' : 'Ctrl K'}
      </kbd>
    </button>
  );
}
