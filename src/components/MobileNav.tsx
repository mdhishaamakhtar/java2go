'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import type { Section } from '@/types/section';

interface MobileNavProps {
  sections: Pick<Section, 'id' | 'title' | 'label'>[];
}

export default function MobileNav({ sections }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const drawerId = useId();
  const titleId = useId();
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const triggerButton = openButtonRef.current;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
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
  }, [drawerId, open]);

  return (
    <>
      {/* Header bar (mobile only) */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 lg:hidden"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-dim)' }}
      >
        <div>
          <div
            style={{
              color: 'var(--accent-cyan)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            ◎ Go for
          </div>
          <div style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 700 }}>
            Java Developers
          </div>
        </div>
        <button
          ref={openButtonRef}
          onClick={() => setOpen(true)}
          type="button"
          className="rounded-md p-3"
          style={{
            color: 'var(--text-secondary)',
            background: 'var(--bg-elevated)',
            minWidth: 44,
            minHeight: 44,
          }}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls={drawerId}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {/* Slide-over overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setOpen(false)}
          style={{
            background: 'rgba(0,0,0,0.6)',
            opacity: 1,
            transition: 'opacity 0.2s ease',
          }}
        >
          <div
            id={drawerId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="absolute left-0 top-0 h-full w-72 max-w-[85vw]"
            style={{
              background: 'var(--bg-surface)',
              borderRight: '1px solid var(--border-dim)',
              transform: 'translateX(0)',
              transition: 'transform 0.24s ease',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id={titleId} className="sr-only">
              Navigation menu
            </h2>
            <button
              ref={closeButtonRef}
              onClick={() => setOpen(false)}
              type="button"
              className="absolute right-3 top-3 rounded p-2.5"
              style={{
                color: 'var(--text-secondary)',
                background: 'var(--bg-elevated)',
                minWidth: 44,
                minHeight: 44,
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
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <Sidebar sections={sections} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
