import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRightIcon } from '@/components/icons';
import NotFoundSearch from '@/components/search/NotFoundSearch';
import sections from '@/data/sections';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false },
};

const suggestions = ['mental-model', 'goroutines', 'errors', 'interfaces', 'json-http'];

export default function NotFound() {
  const picks = suggestions
    .map((id) => sections.find((s) => s.id === id))
    .filter((s) => s !== undefined);

  return (
    <div className="mx-auto w-full max-w-[46rem] px-5 pt-16 pb-20 sm:px-8 lg:pt-24">
      <p className="font-mono text-caption text-muted">404</p>
      <h1 className="mt-2 text-[clamp(2rem,4.2vw,2.875rem)] leading-[1.08] font-bold tracking-[-0.02em] text-primary">
        This page doesn’t exist
      </h1>
      <p className="mt-4 text-body-lg leading-[1.65] text-secondary">
        The link may be out of date, or the section may have moved. Search the guide, or pick up
        from one of the most-read sections.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <NotFoundSearch />
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-lg border border-line px-5 text-label font-medium text-primary transition-colors hover:border-muted/60 hover:bg-surface"
        >
          Back to the contents
        </Link>
      </div>

      <ul className="mt-12 divide-y divide-line-dim border-y border-line-dim">
        {picks.map((section) => (
          <li key={section.id}>
            <Link
              href={`/sections/${section.id}`}
              className="group flex items-center gap-3 py-3.5 text-body text-primary transition-colors hover:text-go"
            >
              <span className="font-mono text-caption text-muted tabular-nums">
                {section.number}
              </span>
              <span className="flex-1">{section.label}</span>
              <ArrowRightIcon
                size={16}
                className="text-muted transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
