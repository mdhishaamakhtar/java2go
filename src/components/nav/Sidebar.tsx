'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef } from 'react';
import type { Part, SectionLink } from '@/types/section';
import { BookIcon } from '../icons';

interface SidebarProps {
  parts: Part[];
  sections: SectionLink[];
  /** Called after a link is followed, e.g. to close the mobile drawer. */
  onNavigate?: () => void;
}

const itemBase =
  'group flex items-center gap-3 rounded-md px-3 py-[0.4375rem] text-label leading-snug transition-colors sidebar-collapsed:justify-center sidebar-collapsed:px-0';

export default function Sidebar({ parts, sections, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const activeRef = useRef<HTMLAnchorElement>(null);
  // The list renders twice (desktop sidebar + mobile drawer); keep ids unique.
  const idPrefix = useId();

  // Bring the current section into view in the (scrollable) list.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' });
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname === `${href}/`;
  const homeActive = pathname === '/';

  return (
    <nav aria-label="Guide sections" className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 [scrollbar-width:thin] overflow-y-auto overscroll-contain px-3 pt-2 pb-6 sidebar-collapsed:px-2">
        <Link
          href="/"
          ref={homeActive ? activeRef : undefined}
          onClick={onNavigate}
          aria-current={homeActive ? 'page' : undefined}
          title="Overview"
          className={`${itemBase} ${
            homeActive
              ? 'bg-elevated text-primary'
              : 'text-secondary hover:bg-hover hover:text-primary'
          }`}
        >
          <span
            className={`flex w-6 shrink-0 justify-center ${homeActive ? 'text-go' : 'text-muted'}`}
          >
            <BookIcon size={15} />
          </span>
          <span className="sidebar-collapsed:sr-only">Overview</span>
        </Link>

        {parts.map((part) => {
          const items = sections.filter((s) => s.partId === part.id);
          const headingId = `${idPrefix}-${part.id}`;
          return (
            <div key={part.id} className="mt-5 sidebar-collapsed:mt-3">
              <p
                id={headingId}
                className="px-3 pb-1.5 text-[0.75rem] font-semibold tracking-[0.08em] text-muted uppercase sidebar-collapsed:sr-only"
              >
                {part.title}
              </p>
              <div
                aria-hidden="true"
                className="mx-auto mb-3 hidden h-px w-6 bg-line sidebar-collapsed:block"
              />
              <ul aria-labelledby={headingId} className="space-y-px">
                {items.map((s) => {
                  const href = `/sections/${s.id}`;
                  const active = isActive(href);
                  return (
                    <li key={s.id}>
                      <Link
                        href={href}
                        ref={active ? activeRef : undefined}
                        onClick={onNavigate}
                        aria-current={active ? 'page' : undefined}
                        title={s.label}
                        className={`${itemBase} ${
                          active
                            ? 'bg-elevated font-medium text-primary'
                            : 'text-secondary hover:bg-hover hover:text-primary'
                        }`}
                      >
                        <span
                          className={`w-6 shrink-0 text-center font-mono text-[0.75rem] tabular-nums transition-colors ${
                            active ? 'text-go' : 'text-muted group-hover:text-secondary'
                          }`}
                        >
                          {s.number}
                        </span>
                        <span className="min-w-0 sidebar-collapsed:sr-only">{s.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
