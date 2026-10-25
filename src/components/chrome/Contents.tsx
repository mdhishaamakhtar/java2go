'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef } from 'react';
import type { Part, SectionLink } from '@/types/section';
import { toRoman } from '@/lib/roman';
import { siteConfig } from '@/lib/site';
import { CloseIcon, GitHubIcon } from '../icons';
import { usePageHeadings } from './PageHeadings';

/** Three short rules: a table of contents, not a hamburger. */
function ContentsGlyph() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <path d="M2.5 4h2M6.5 4h7M2.5 8h2M6.5 8h7M2.5 12h2M6.5 12h5" />
    </svg>
  );
}

/**
 * "Contents" button and the drawer it opens: every part and section, the
 * current one marked, plus this page's headings. A native modal <dialog>
 * gives focus trapping, Escape and an inert background for free.
 */
export default function Contents({ parts, sections }: { parts: Part[]; sections: SectionLink[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);
  const pathname = usePathname();
  const headings = usePageHeadings();
  const idPrefix = useId();

  const isActive = (href: string) => pathname === href || pathname === `${href}/`;
  const open = () => {
    dialogRef.current?.showModal();
    activeRef.current?.scrollIntoView({ block: 'center' });
  };
  const close = () => dialogRef.current?.close();

  // Following a link inside the drawer closes it.
  useEffect(() => close(), [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        className="inline-flex h-9 items-center gap-2 rounded-md px-2 font-sans text-label font-medium text-ink-2 transition-colors hover:bg-chip hover:text-ink"
      >
        <ContentsGlyph />
        <span className="max-sm:sr-only">Contents</span>
      </button>

      <dialog
        ref={dialogRef}
        className="drawer"
        aria-label="Contents"
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div className="flex h-full flex-col border-r border-rule-strong bg-paper font-sans">
          <div className="flex items-center justify-between gap-2 border-b border-rule py-2 pr-2 pl-5">
            <p className="text-label font-bold text-ink [font-stretch:112.5%]">Contents</p>
            <button
              type="button"
              onClick={close}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-ink-2 transition-colors hover:bg-chip hover:text-ink"
              aria-label="Close contents"
              autoFocus
            >
              <CloseIcon size={18} />
            </button>
          </div>

          <nav
            aria-label="Guide sections"
            className="min-h-0 flex-1 [scrollbar-width:thin] overflow-y-auto overscroll-contain px-3 pt-3 pb-8"
          >
            <Link
              href="/"
              onClick={close}
              aria-current={pathname === '/' ? 'page' : undefined}
              className={`block rounded-md px-3 py-2 text-label transition-colors ${
                pathname === '/' ? 'bg-chip font-semibold text-ink' : 'text-ink-2 hover:bg-chip'
              }`}
            >
              Overview
            </Link>

            {parts.map((part, p) => {
              const items = sections.filter((s) => s.partId === part.id);
              const headingId = `${idPrefix}-${part.id}`;
              return (
                <div key={part.id} className="mt-5">
                  <p
                    id={headingId}
                    className="flex items-baseline gap-2 px-3 pb-1.5 text-caption font-bold text-ink-3 [font-stretch:112.5%]"
                  >
                    <span className="tabular-nums">{toRoman(p + 1)}</span>
                    {part.title}
                  </p>
                  <ul aria-labelledby={headingId}>
                    {items.map((s) => {
                      const href = `/sections/${s.id}`;
                      const active = isActive(href);
                      return (
                        <li key={s.id}>
                          <Link
                            href={href}
                            ref={active ? activeRef : undefined}
                            onClick={close}
                            aria-current={active ? 'page' : undefined}
                            className={`flex items-baseline gap-3 rounded-md px-3 py-1.5 text-label leading-snug transition-colors ${
                              active
                                ? 'bg-chip font-semibold text-ink'
                                : 'text-ink-2 hover:bg-chip hover:text-ink'
                            }`}
                          >
                            <span
                              className={`w-6 shrink-0 font-mono text-micro tabular-nums ${
                                active ? 'text-go' : 'text-ink-3'
                              }`}
                            >
                              {s.number}
                            </span>
                            <span className="min-w-0">{s.label}</span>
                          </Link>
                          {active && headings.length > 0 && (
                            <ol
                              aria-label="On this page"
                              className="mt-1 mb-2 ml-[2.6rem] space-y-0.5 border-l border-rule"
                            >
                              {headings.map((h) => (
                                <li key={h.id}>
                                  <a
                                    href={`#${h.id}`}
                                    onClick={close}
                                    className={`-ml-px block border-l border-transparent py-1 text-caption leading-snug text-ink-3 transition-colors hover:border-ink-3 hover:text-ink ${
                                      h.level === 3 ? 'pl-6' : 'pl-3'
                                    }`}
                                  >
                                    {h.text}
                                  </a>
                                </li>
                              ))}
                            </ol>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </nav>

          <div className="flex items-center justify-between gap-3 border-t border-rule px-5 py-3 text-caption text-ink-3">
            <span>{sections.length} sections · GPL-3.0</span>
            <a
              href={siteConfig.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-chip hover:text-ink"
              aria-label="Source on GitHub (opens in a new tab)"
            >
              <GitHubIcon size={16} />
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
}
