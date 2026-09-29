'use client';

import { useSyncExternalStore } from 'react';
import type { Part, SectionLink } from '@/types/section';
import { SIDEBAR_STORAGE_KEY } from '@/lib/sidebar';
import { siteConfig } from '@/lib/site';
import { GitHubIcon, SidebarIcon } from '../icons';
import Brand from './Brand';
import SearchButton from './SearchButton';
import Sidebar from './Sidebar';

// The collapsed flag lives on <html data-sidebar>, set before paint by an inline
// script in the root layout. This store just mirrors that attribute into React.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-sidebar'],
  });
  return () => observer.disconnect();
}
const getSnapshot = () => document.documentElement.dataset.sidebar === 'collapsed';
const getServerSnapshot = () => false;

function setCollapsed(collapsed: boolean) {
  const root = document.documentElement;
  if (collapsed) root.dataset.sidebar = 'collapsed';
  else delete root.dataset.sidebar;
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? 'collapsed' : 'expanded');
  } catch {
    // Storage can be unavailable (private mode, blocked cookies); the toggle still works.
  }
}

export default function DesktopSidebar({
  parts,
  sections,
}: {
  parts: Part[];
  sections: SectionLink[];
}) {
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <aside className="app-sidebar sticky top-0 hidden h-dvh shrink-0 flex-col overflow-hidden border-r border-line-dim bg-surface lg:flex">
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3 sidebar-collapsed:flex-col sidebar-collapsed:px-2">
        <Brand />
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-elevated hover:text-primary"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <SidebarIcon size={18} />
        </button>
      </div>

      <div className="px-4 pb-2 sidebar-collapsed:flex sidebar-collapsed:justify-center sidebar-collapsed:px-2">
        <SearchButton variant="sidebar" />
      </div>

      <Sidebar parts={parts} sections={sections} />

      <div className="flex items-center justify-between gap-3 border-t border-line-dim px-5 py-3 text-caption text-muted sidebar-collapsed:justify-center sidebar-collapsed:px-2">
        <span className="sidebar-collapsed:hidden">
          {sections.length} sections · Go {siteConfig.versions.go}
        </span>
        <a
          href={siteConfig.repoUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-elevated hover:text-primary"
          aria-label="Source on GitHub (opens in a new tab)"
          title="Source on GitHub"
        >
          <GitHubIcon size={16} />
        </a>
      </div>
    </aside>
  );
}
