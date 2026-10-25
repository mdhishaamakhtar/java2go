'use client';

import { primaryAction } from '../actions';
import { SearchIcon } from '../icons';
import { useSearch } from './SearchProvider';

export default function NotFoundSearch() {
  const { open } = useSearch();
  return (
    <button type="button" onClick={open} aria-haspopup="dialog" className={primaryAction}>
      <SearchIcon size={16} />
      Search the guide
    </button>
  );
}
