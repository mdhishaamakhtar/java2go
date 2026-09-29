'use client';

import { useEffect, useState } from 'react';
import type { SectionHeading } from '@/types/section';

/** Offset below which a heading counts as "current" (clears the page top padding). */
const ACTIVE_OFFSET = 140;

/** Sticky right-rail table of contents with scroll-spy, for wide screens. */
export default function OnThisPage({ headings }: { headings: SectionHeading[] }) {
  const [activeId, setActiveId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      let current = elements[0].id;
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= ACTIVE_OFFSET) current = el.id;
        else break;
      }
      // At the very bottom, the last heading may never reach the offset.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = elements[elements.length - 1].id;
      }
      setActiveId(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="On this page" className="text-caption">
      <p className="mb-3 font-semibold text-secondary">On this page</p>
      <ul className="space-y-0.5 border-l border-line-dim">
        {headings.map((heading) => {
          const active = heading.id === activeId;
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                aria-current={active ? 'location' : undefined}
                className={`-ml-px block border-l py-1 leading-snug transition-colors ${
                  heading.level === 3 ? 'pl-6' : 'pl-3'
                } ${
                  active
                    ? 'border-go text-primary'
                    : 'border-transparent text-muted hover:border-line hover:text-secondary'
                }`}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
