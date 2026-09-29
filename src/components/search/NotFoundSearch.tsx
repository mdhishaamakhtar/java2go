'use client';

import { SearchIcon } from '../icons';
import { useSearch } from './SearchProvider';

export default function NotFoundSearch() {
  const { open } = useSearch();
  return (
    <button
      type="button"
      onClick={open}
      aria-haspopup="dialog"
      className="inline-flex h-11 items-center gap-2 rounded-lg bg-go px-5 text-label font-semibold text-canvas transition-[filter] hover:brightness-110"
    >
      <SearchIcon size={16} />
      Search the guide
    </button>
  );
}
