'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { GoMark } from './BrandMarks';
import Sidebar from './Sidebar';
import type { Section } from '@/types/section';

interface MobileNavProps {
  sections: Pick<Section, 'id' | 'title' | 'label'>[];
}

export default function MobileNav({ sections }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const drawerId = useId();
  const titleId = useId();
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);

  const openDrawer = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setMounted(true);
    requestAnimationFrame(() => setOpen(true));
  };

  const closeDrawer = () => {
    setOpen(false);
    closeTimerRef.current = window.setTimeout(() => {
      setMounted(false);
      closeTimerRef.current = null;
    }, 220);
  };

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const triggerButton = openButtonRef.current;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => closeButtonRef.current?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDrawer();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const drawer = document.getElementById(drawerId);
      if (!drawer) {
        return;
      }

      const focusable = drawer.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      triggerButton?.focus();
    };
  }, [drawerId, mounted]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 lg:hidden"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-dim)' }}
      >
        <div>
          <div
            className="inline-flex items-center gap-1.5"
            style={{
              color: 'var(--accent-cyan)',
              fontSize: 'var(--text-caption)',
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            <GoMark size={12} />
            <span>Go for</span>
          </div>
          <div style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700 }}>
            Java Developers
          </div>
        </div>
        <button
          ref={openButtonRef}
          onClick={openDrawer}
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md"
          style={{
            color: 'var(--text-secondary)',
            background: 'var(--bg-elevated)',
          }}
          aria-label="Open menu"
          aria-expanded={mounted}
          aria-controls={drawerId}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ display: 'block' }}
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {mounted && (
        <div
          className="drawer-backdrop fixed inset-0 z-50 lg:hidden"
          data-state={open ? 'open' : 'closed'}
          onClick={closeDrawer}
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          <div
            id={drawerId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="drawer-panel absolute left-0 top-0 h-full w-80 max-w-[88vw]"
            data-state={open ? 'open' : 'closed'}
            style={{
              background: 'var(--bg-surface)',
              borderRight: '1px solid var(--border-dim)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id={titleId} className="sr-only">
              Navigation menu
            </h2>
            <button
              ref={closeButtonRef}
              onClick={closeDrawer}
              type="button"
              className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-md"
              style={{
                color: 'var(--text-secondary)',
                background: 'var(--bg-elevated)',
              }}
              aria-label="Close menu"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ display: 'block' }}
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <Sidebar sections={sections} onClose={closeDrawer} />
          </div>
        </div>
      )}
    </>
  );
}
