import Link from 'next/link';
import type { Section } from '@/types/section';
import { ArrowLeftIcon, ArrowRightIcon } from './icons';

function Turn({ section, direction }: { section: Section; direction: 'prev' | 'next' }) {
  const isNext = direction === 'next';
  return (
    <Link
      href={`/sections/${section.id}`}
      rel={isNext ? 'next' : 'prev'}
      className={`group flex min-w-0 flex-col gap-1 py-2 ${isNext ? 'items-end text-right' : 'items-start'}`}
    >
      <span className="inline-flex items-center gap-1.5 font-sans text-caption font-bold text-ink-3 [font-stretch:112.5%] tabular-nums transition-colors group-hover:text-go">
        {!isNext && <ArrowLeftIcon size={14} />}
        {section.number}
        {isNext && <ArrowRightIcon size={14} />}
      </span>
      <span className="font-sans text-body leading-snug font-semibold text-ink underline decoration-transparent decoration-[0.08em] underline-offset-[0.25em] transition-colors group-hover:decoration-go">
        {section.label}
      </span>
    </Link>
  );
}

/** Book-style page turns: the previous section on the left, the next on the right. */
export default function PageTurn({ prev, next }: { prev?: Section; next?: Section }) {
  return (
    <nav
      aria-label="Previous and next sections"
      className="mt-6 grid grid-cols-2 gap-6 border-t border-rule pt-5"
    >
      {prev ? <Turn section={prev} direction="prev" /> : <span />}
      {next ? <Turn section={next} direction="next" /> : <span />}
    </nav>
  );
}
