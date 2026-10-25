'use client';

import { useId, useRef } from 'react';
import { ChevronRightIcon } from '../icons';
import { placeMenu } from './menu';
import { useActiveHeading, usePageHeadings } from './PageHeadings';

/**
 * "§ Nil pointers ▾": where you are on the page, and a jump list of every
 * heading. Renders nothing on pages without headings.
 */
export default function HeadingMenu() {
  const headings = usePageHeadings();
  const activeId = useActiveHeading(headings);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  if (headings.length === 0) return null;
  const active = headings.find((h) => h.id === activeId);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        popoverTarget={menuId}
        className="group inline-flex h-9 max-w-full min-w-0 items-center gap-1.5 rounded-md px-2 font-sans text-label text-ink-2 transition-colors hover:bg-chip hover:text-ink"
        aria-label={active ? `On this page, current: ${active.text}` : 'On this page'}
      >
        <span aria-hidden="true" className="font-serif text-body text-ink-3">
          §
        </span>
        <span className="min-w-0 truncate">{active?.text ?? 'On this page'}</span>
        <ChevronRightIcon size={14} className="shrink-0 rotate-90 text-ink-3" />
      </button>

      <div
        ref={menuRef}
        id={menuId}
        popover="auto"
        className="menu max-h-[min(32rem,70dvh)] w-[min(24rem,calc(100vw-1.5rem))] overflow-y-auto font-sans"
        onToggle={(event) => {
          if ((event as unknown as ToggleEvent).newState === 'open' && buttonRef.current) {
            placeMenu(buttonRef.current, event.currentTarget, 'start');
          }
        }}
      >
        <nav aria-label="On this page">
          <p className="px-2.5 pt-1.5 pb-2 text-caption font-semibold text-ink-3">On this page</p>
          <ol>
            {headings.map((h) => {
              const current = h.id === activeId;
              return (
                <li key={h.id}>
                  <a
                    href={`#${h.id}`}
                    onClick={() => menuRef.current?.hidePopover()}
                    aria-current={current ? 'location' : undefined}
                    className={`block rounded-md py-1.5 pr-2.5 text-label leading-snug transition-colors ${
                      h.level === 3 ? 'pl-7 text-ink-3' : 'pl-2.5 text-ink-2'
                    } ${current ? 'bg-chip font-semibold text-ink' : 'hover:bg-chip hover:text-ink'}`}
                  >
                    {h.text}
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </>
  );
}
