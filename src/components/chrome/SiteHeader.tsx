'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Part, SectionLink } from '@/types/section';
import { WordmarkArrow } from '../BrandMarks';
import Contents from './Contents';
import HeadingMenu from './HeadingMenu';
import SearchButton from './SearchButton';
import ThemePicker from './ThemePicker';

/**
 * The running header: the wordmark, where you are, and the four tools
 * (contents, on this page, search, theme). It replaces the old sidebar.
 */
export default function SiteHeader({
  parts,
  sections,
}: {
  parts: Part[];
  sections: SectionLink[];
}) {
  const pathname = usePathname();
  const current = sections.find(
    (s) => pathname === `/sections/${s.id}` || pathname === `/sections/${s.id}/`,
  );

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper">
      <div className="mx-auto flex h-(--header-height) w-full max-w-[76rem] items-center gap-2 px-3 sm:px-5">
        <Link
          href="/"
          className="shrink-0 rounded-md px-1.5 py-1 font-sans text-label font-extrabold tracking-[-0.01em] text-ink [font-stretch:125%]"
          aria-label="Java to Go, home"
        >
          <span className="text-java">Java</span>
          <WordmarkArrow className="text-ink-3" />
          <span className="text-go">Go</span>
        </Link>

        {current && (
          <p className="ml-1 hidden min-w-0 items-baseline gap-2 truncate border-l border-rule pl-3 font-sans text-label text-ink-3 lg:flex">
            <span className="font-mono text-micro tabular-nums">{current.number}</span>
            <span className="truncate text-ink-2">{current.label}</span>
          </p>
        )}

        <div className="ml-auto flex min-w-0 items-center gap-0.5">
          <div className="flex max-w-[22rem] min-w-0 max-sm:max-w-[9rem]">
            <HeadingMenu />
          </div>
          <Contents parts={parts} sections={sections} />
          <SearchButton />
          <ThemePicker />
        </div>
      </div>
    </header>
  );
}
