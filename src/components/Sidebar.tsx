'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Section } from '@/types/section';

interface SidebarProps {
  sections: Pick<Section, 'id' | 'title' | 'label'>[];
  onClose?: () => void;
  collapsed?: boolean;
}

export default function Sidebar({ sections, onClose, collapsed = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav className={collapsed ? 'flex h-full flex-col py-3' : 'flex h-full flex-col py-4'}>
      {/* Logo / title */}
      {collapsed ? (
        <div
          className="mb-1 flex justify-center pb-3"
          style={{ borderBottom: '1px solid var(--border-dim)' }}
        >
          <div
            style={{
              color: 'var(--accent-cyan)',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            ◎
          </div>
        </div>
      ) : (
        <div className="mb-1 px-5 pb-4" style={{ borderBottom: '1px solid var(--border-dim)' }}>
          <div
            style={{
              color: 'var(--accent-cyan)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 2,
            }}
          >
            ◎ Go for
          </div>
          <div
            style={{
              color: 'var(--text-primary)',
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: -0.3,
            }}
          >
            Java Developers
          </div>
        </div>
      )}

      {/* Section list */}
      <div
        className={
          collapsed ? 'flex-1 overflow-y-auto px-1 py-2' : 'flex-1 overflow-y-auto px-2 py-2'
        }
      >
        <Link
          href="/"
          onClick={onClose}
          className={
            collapsed
              ? 'mb-1 flex items-center justify-center rounded-md py-2 transition-colors'
              : 'mb-2 flex items-center gap-2.5 rounded-md px-3 py-2 transition-colors'
          }
          style={{
            background: pathname === '/' ? 'var(--bg-elevated)' : 'transparent',
            color: pathname === '/' ? 'var(--text-primary)' : 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: 13,
          }}
        >
          <span
            className="shrink-0 font-mono"
            style={{
              color: pathname === '/' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontSize: collapsed ? 11 : 10,
              minWidth: collapsed ? 24 : 20,
              textAlign: 'center',
            }}
          >
            ◎
          </span>
          {!collapsed && <span>Guide Home</span>}
          {!collapsed && pathname === '/' && (
            <span className="ml-auto" style={{ color: 'var(--accent-cyan)', fontSize: 8 }}>
              ●
            </span>
          )}
        </Link>

        {sections.map((s) => {
          const href = `/sections/${s.id}`;
          const active = pathname === href || pathname === `${href}/`;
          return (
            <Link
              key={s.id}
              href={href}
              onClick={onClose}
              className={
                collapsed
                  ? 'mb-1 flex items-center justify-center rounded-md py-2 transition-colors'
                  : 'mb-0.5 flex items-center gap-2.5 rounded-md px-3 py-2 transition-colors'
              }
              style={{
                background: active ? 'var(--bg-elevated)' : 'transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: 13,
              }}
            >
              <span
                className="shrink-0 font-mono"
                style={{
                  color: active ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  fontSize: collapsed ? 11 : 10,
                  minWidth: collapsed ? 24 : 20,
                  textAlign: 'center',
                }}
              >
                {s.title}
              </span>
              {!collapsed && (
                <span
                  style={{
                    opacity: 1,
                    transform: 'translateX(0)',
                    transition: 'opacity 0.2s ease, transform 0.2s ease',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                >
                  {s.label}
                </span>
              )}
              {!collapsed && active && (
                <span className="ml-auto" style={{ color: 'var(--accent-cyan)', fontSize: 8 }}>
                  ●
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="px-5 pt-3" style={{ borderTop: '1px solid var(--border-dim)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 10, lineHeight: 1.6 }}>
            21 sections · MIT License
          </div>
        </div>
      )}
    </nav>
  );
}
