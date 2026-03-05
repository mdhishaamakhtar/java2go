'use client';

import { useState } from 'react';
import type { Section } from '@/types/section';
import Sidebar from './Sidebar';

interface DesktopSidebarProps {
  sections: Pick<Section, 'id' | 'title' | 'label'>[];
}

export default function DesktopSidebar({ sections }: DesktopSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="sticky top-0 hidden h-screen shrink-0 flex-col overflow-hidden lg:flex"
      style={{
        width: collapsed ? 78 : 280,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-dim)',
        transition: 'width 0.25s ease',
      }}
    >
      <div
        className={
          collapsed
            ? 'flex items-center justify-center px-2 pt-2'
            : 'flex items-center justify-end px-2 pt-2'
        }
      >
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="rounded-md px-2 py-1 text-xs"
          style={{
            color: 'var(--text-secondary)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
          }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
      <Sidebar sections={sections} collapsed={collapsed} />
    </aside>
  );
}
