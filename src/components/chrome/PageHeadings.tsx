'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { SectionHeading } from '@/types/section';

interface PageHeadingsValue {
  headings: SectionHeading[];
  setHeadings: (headings: SectionHeading[]) => void;
}

const PageHeadingsContext = createContext<PageHeadingsValue | null>(null);

/**
 * The running header lives in the root layout, but the headings belong to the
 * current page. Section pages register theirs here so the header's "§ current
 * heading" menu and the Contents drawer can list them.
 */
export default function PageHeadingsProvider({ children }: { children: ReactNode }) {
  const [headings, setHeadings] = useState<SectionHeading[]>([]);
  return (
    <PageHeadingsContext.Provider value={{ headings, setHeadings }}>
      {children}
    </PageHeadingsContext.Provider>
  );
}

export function usePageHeadings(): SectionHeading[] {
  return useContext(PageHeadingsContext)?.headings ?? [];
}

/** Rendered by a section page; clears itself when the page unmounts. */
export function RegisterHeadings({ headings }: { headings: SectionHeading[] }) {
  const setHeadings = useContext(PageHeadingsContext)?.setHeadings;
  useEffect(() => {
    setHeadings?.(headings);
    return () => setHeadings?.([]);
  }, [headings, setHeadings]);
  return null;
}

/** Offset below which a heading counts as "current" (clears the sticky header). */
const ACTIVE_OFFSET = 120;

/** Scroll-spy: the id of the heading the reader is currently in. */
export function useActiveHeading(headings: SectionHeading[]): string | undefined {
  const [activeId, setActiveId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      let current: string | undefined;
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

  // After navigating to a page without headings, the old id no longer applies.
  return headings.some((h) => h.id === activeId) ? activeId : undefined;
}
