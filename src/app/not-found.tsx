import type { Metadata } from 'next';
import Link from 'next/link';
import { kicker, pageTitle, secondaryAction } from '@/components/actions';
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
      <p className={kicker}>404</p>
      <h1 className={`mt-3 ${pageTitle}`}>This page doesn’t exist</h1>
      <p className="mt-5 text-body-lg leading-[1.6] text-ink-2">
        The link may be out of date, or the section may have moved. Search the guide, or pick up
        from one of the most-read sections.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <NotFoundSearch />
        <Link href="/" className={secondaryAction}>
          Back to the contents
        </Link>
      </div>

      <ul className="mt-12 divide-y divide-rule border-y border-rule">
        {picks.map((section) => (
          <li key={section.id}>
            <Link
              href={`/sections/${section.id}`}
              className="group flex items-center gap-3 py-3.5 font-sans text-body font-semibold text-ink transition-colors hover:text-go"
            >
              <span className="w-7 font-mono text-caption font-normal text-ink-3 tabular-nums">
                {section.number}
              </span>
              <span className="flex-1">{section.label}</span>
              <ArrowRightIcon
                size={16}
                className="text-ink-3 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
