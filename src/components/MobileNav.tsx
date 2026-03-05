'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import type { Section } from '@/types/section';

interface MobileNavProps {
  sections: Pick<Section, 'id' | 'title' | 'label'>[];
}

export default function MobileNav({ sections }: MobileNavProps) {
  const [open, setOpen] = useState(false);

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
          onClick={() => setOpen(true)}
          className="rounded-md p-2"
          style={{ color: 'var(--text-secondary)', background: 'var(--bg-elevated)' }}
          aria-label="Open menu"
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
      <div
        className="fixed inset-0 z-50 lg:hidden"
        onClick={() => setOpen(false)}
        style={{
          background: 'rgba(0,0,0,0.6)',
          opacity: open ? 1 : 0,
          transition: 'opacity 0.2s ease',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        <div
          className="absolute left-0 top-0 h-full w-72"
          style={{
            background: 'var(--bg-surface)',
            borderRight: '1px solid var(--border-dim)',
            transform: open ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.24s ease',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute right-3 top-3 rounded p-1.5"
            style={{ color: 'var(--text-secondary)', background: 'var(--bg-elevated)' }}
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
    </>
  );
}
