'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { SearchEntry } from '@/lib/search';
import SearchDialog from './SearchDialog';

export type IndexState =
  | { status: 'idle' | 'loading' }
  | { status: 'ready'; entries: SearchEntry[] }
  | { status: 'error' };

interface SearchContextValue {
  open: () => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function useSearch(): SearchContextValue {
  const value = useContext(SearchContext);
  if (!value) throw new Error('useSearch must be used inside <SearchProvider>');
  return value;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
}

function isSearchEntryList(value: unknown): value is SearchEntry[] {
  return (
    Array.isArray(value) &&
    value.every((e) => typeof e?.href === 'string' && typeof e?.title === 'string')
  );
}

/**
 * Owns the search dialog and its index. The index is a static JSON file,
 * fetched on first open so it adds nothing to normal page loads.
 */
export default function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState<IndexState>({ status: 'idle' });
  const loading = useRef(false);

  const loadIndex = useCallback(async () => {
    if (loading.current) return;
    loading.current = true;
    setIndex({ status: 'loading' });
    try {
      const response = await fetch('/search-index.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: unknown = await response.json();
      if (!isSearchEntryList(data)) throw new Error('Unexpected search index format');
      setIndex({ status: 'ready', entries: data });
    } catch (error) {
      console.error('[search] Could not load the search index:', error);
      setIndex({ status: 'error' });
    } finally {
      loading.current = false;
    }
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    if (index.status === 'idle' || index.status === 'error') void loadIndex();
  }, [index.status, loadIndex]);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isPaletteShortcut = event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey);
      const isSlash = event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey;
      if (isPaletteShortcut || (isSlash && !isTypingTarget(event.target))) {
        event.preventDefault();
        open();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <SearchContext.Provider value={{ open }}>
      {children}
      <SearchDialog index={index} onRetry={loadIndex} open={isOpen} onClose={close} />
    </SearchContext.Provider>
  );
}
