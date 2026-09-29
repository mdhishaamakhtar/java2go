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

/** Full-width trigger with shortcut hint (desktop), or an icon button (mobile header). */
export default function SearchButton({ variant }: { variant: 'sidebar' | 'icon' }) {
  const { open } = useSearch();
  const isApple = useIsApplePlatform();

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={open}
        className="inline-flex h-11 w-11 items-center justify-center rounded-md text-secondary transition-colors hover:bg-elevated hover:text-primary"
        aria-label="Search the guide"
        aria-haspopup="dialog"
      >
        <SearchIcon size={20} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={open}
      aria-haspopup="dialog"
      aria-keyshortcuts="Meta+K Control+K /"
      title="Search (⌘K / Ctrl K)"
      className="flex h-10 w-full items-center gap-2.5 rounded-md border border-line bg-canvas px-3 text-label text-muted transition-colors hover:border-muted/50 hover:text-secondary sidebar-collapsed:w-10 sidebar-collapsed:justify-center sidebar-collapsed:px-0"
    >
      <SearchIcon size={16} className="shrink-0" />
      <span className="flex-1 text-left sidebar-collapsed:sr-only">Search</span>
      <kbd className="rounded border border-line px-1.5 py-0.5 font-sans text-[0.75rem] leading-none text-muted sidebar-collapsed:hidden">
        {isApple ? '⌘K' : 'Ctrl K'}
      </kbd>
    </button>
  );
}
