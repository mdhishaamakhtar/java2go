import Link from 'next/link';
import type { Section } from '@/types/section';
import { ArrowLeftIcon, ArrowRightIcon } from './icons';

function PagerLink({ section, direction }: { section: Section; direction: 'prev' | 'next' }) {
  const isNext = direction === 'next';
  return (
    <Link
      href={`/sections/${section.id}`}
      rel={isNext ? 'next' : 'prev'}
      className={`group flex min-w-0 flex-1 flex-col gap-1.5 rounded-lg border border-line-dim bg-surface p-4 transition-colors hover:border-line hover:bg-elevated ${
        isNext ? 'items-end text-right' : 'items-start'
      }`}
    >
      <span className="inline-flex items-center gap-1.5 text-caption text-muted">
        {!isNext && (
          <ArrowLeftIcon size={14} className="transition-transform group-hover:-translate-x-0.5" />
        )}
        {isNext ? 'Next' : 'Previous'}
        {isNext && (
          <ArrowRightIcon size={14} className="transition-transform group-hover:translate-x-0.5" />
        )}
      </span>
      <span className="text-label font-medium text-primary">
        <span className="mr-2 font-mono text-caption text-muted tabular-nums">
          {section.number}
        </span>
        {section.label}
      </span>
    </Link>
  );
}

export default function SectionPager({ prev, next }: { prev?: Section; next?: Section }) {
  return (
    <nav aria-label="Previous and next sections" className="mt-16 flex flex-col gap-3 sm:flex-row">
      {prev ? (
        <PagerLink section={prev} direction="prev" />
      ) : (
        <div className="flex-1 max-sm:hidden" />
      )}
      {next ? (
        <PagerLink section={next} direction="next" />
      ) : (
        <div className="flex-1 max-sm:hidden" />
      )}
    </nav>
  );
}
