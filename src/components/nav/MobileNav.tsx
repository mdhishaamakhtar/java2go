'use client';

import { useEffect, useRef } from 'react';
import type { Part, SectionLink } from '@/types/section';
import { CloseIcon, MenuIcon } from '../icons';
import Brand from './Brand';
import SearchButton from './SearchButton';
import Sidebar from './Sidebar';

/**
 * Sticky header + slide-in drawer below the lg breakpoint. The drawer is a
 * native modal <dialog>: focus trapping, Escape, `inert` background and the
 * top layer come from the browser rather than hand-rolled handlers.
 */
export default function MobileNav({ parts, sections }: { parts: Part[]; sections: SectionLink[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openDrawer = () => dialogRef.current?.showModal();
  const closeDrawer = () => dialogRef.current?.close();

  // If the viewport grows past the breakpoint while the drawer is open, close it
  // so the page is not left scroll-locked behind an invisible modal.
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 64rem)');
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) dialogRef.current?.close();
    };
    desktop.addEventListener('change', onChange);
    return () => desktop.removeEventListener('change', onChange);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-(--mobile-header-height) items-center justify-between gap-2 border-b border-line-dim bg-surface pr-2 pl-4 lg:hidden">
        <Brand />
        <div className="flex items-center gap-1">
          <SearchButton variant="icon" />
          <button
            type="button"
            onClick={openDrawer}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-secondary transition-colors hover:bg-elevated hover:text-primary"
            aria-label="Open navigation"
            aria-haspopup="dialog"
          >
            <MenuIcon size={22} />
          </button>
        </div>
      </header>

      <dialog
        ref={dialogRef}
        className="drawer lg:hidden"
        aria-label="Guide navigation"
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDrawer();
        }}
      >
        <div className="flex h-full flex-col border-r border-line-dim bg-surface">
          <div className="flex items-center justify-between gap-2 py-3 pr-2 pl-4">
            <Brand onNavigate={closeDrawer} />
            <button
              type="button"
              onClick={closeDrawer}
              className="inline-flex h-11 w-11 items-center justify-center rounded-md text-secondary transition-colors hover:bg-elevated hover:text-primary"
              aria-label="Close navigation"
              autoFocus
            >
              <CloseIcon size={20} />
            </button>
          </div>
          <Sidebar parts={parts} sections={sections} onNavigate={closeDrawer} />
        </div>
      </dialog>
    </>
  );
}
