'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Section } from '@/types/section';
import { GoMark } from './BrandMarks';

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
          <GoMark size={18} />
        </div>
      ) : (
        <div className="mb-1 px-5 pb-4" style={{ borderBottom: '1px solid var(--border-dim)' }}>
          <div
            className="inline-flex items-center gap-2"
            style={{
              color: 'var(--accent-cyan)',
              fontSize: 'var(--text-caption)',
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 2,
            }}
          >
            <GoMark size={14} />
            <span>Go for</span>
          </div>
          <div
            style={{
              color: 'var(--text-primary)',
              fontSize: '1.0625rem',
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
              : 'mb-2 flex items-center gap-2.5 rounded-md px-3 py-2.5 transition-colors'
          }
          style={{
            background: pathname === '/' ? 'var(--bg-elevated)' : 'transparent',
            color: pathname === '/' ? 'var(--text-primary)' : 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: 'var(--text-label)',
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
            <GoMark size={collapsed ? 14 : 12} />
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
                fontSize: 'var(--text-label)',
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
                    lineHeight: 1.45,
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
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', lineHeight: 1.6 }}>
            21 sections · MIT License
          </div>
        </div>
      )}
    </nav>
  );
}
