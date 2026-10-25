'use client';

import { useId, useRef, useSyncExternalStore, type KeyboardEvent } from 'react';
import {
  DEFAULT_DARK,
  DEFAULT_LIGHT,
  THEME_COLOR_ID,
  THEME_IDS,
  THEME_STORAGE_KEY,
  THEMES,
  type ThemeId,
} from '@/lib/themes';
import { placeMenu } from './menu';

type Choice = ThemeId | 'system';

/** The picker's options in order: the four themes, then "match my system". */
const CHOICES: readonly Choice[] = [...THEME_IDS, 'system'];

// The chosen theme lives on <html data-theme>, set before paint by an inline
// script in the root layout. This store mirrors that attribute into React.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}
const getSnapshot = (): Choice =>
  (document.documentElement.dataset.theme as ThemeId | undefined) ?? 'system';
const getServerSnapshot = (): Choice => 'system';

/** Keep the browser's theme-color on the chosen theme (see THEME_COLOR_ID). */
function syncThemeColor(choice: Choice) {
  let meta = document.getElementById(THEME_COLOR_ID) as HTMLMetaElement | null;
  if (choice === 'system') {
    meta?.remove();
    return;
  }
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.id = THEME_COLOR_ID;
    document.head.prepend(meta);
  }
  meta.content = THEMES[choice].tokens.paper;
}

let fadeTimer: number | undefined;

function applyChoice(choice: Choice) {
  const root = document.documentElement;
  // Cross-fade the colour change instead of snapping (skipped for reduced motion in CSS).
  // A second change during the fade restarts it rather than cutting it short.
  root.classList.add('theme-changing');
  window.clearTimeout(fadeTimer);
  fadeTimer = window.setTimeout(() => root.classList.remove('theme-changing'), 320);

  if (choice === 'system') delete root.dataset.theme;
  else root.dataset.theme = choice;
  syncThemeColor(choice);
  try {
    if (choice === 'system') localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, choice);
  } catch {
    // Storage can be unavailable (private mode); the theme still applies for this visit.
  }
}

function Swatch({ id, size = 'md' }: { id: ThemeId; size?: 'sm' | 'md' }) {
  const { paper, ink, java, go } = THEMES[id].tokens;
  const box = size === 'sm' ? 'h-4 w-4' : 'h-7 w-7';
  return (
    <span
      aria-hidden="true"
      className={`${box} relative inline-block shrink-0 overflow-hidden rounded-[0.3rem] border border-rule-strong`}
      style={{ background: paper }}
    >
      <span className="absolute inset-x-[22%] top-[24%] h-px" style={{ background: ink }} />
      <span
        className="absolute bottom-[22%] left-[22%] h-[28%] w-[24%] rounded-[1px]"
        style={{ background: java }}
      />
      <span
        className="absolute right-[22%] bottom-[22%] h-[28%] w-[24%] rounded-[1px]"
        style={{ background: go }}
      />
    </span>
  );
}

/** Half Paper, half Night ink: "follow the system setting". */
function SystemSwatch({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 'h-4 w-4' : 'h-7 w-7';
  return (
    <span
      aria-hidden="true"
      className={`${box} inline-block shrink-0 rounded-[0.3rem] border border-rule-strong`}
      style={{
        background: `linear-gradient(135deg, ${THEMES[DEFAULT_LIGHT].tokens.paper} 50%, ${THEMES[DEFAULT_DARK].tokens.paper} 50%)`,
      }}
    />
  );
}

export default function ThemePicker() {
  const choice = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const current = choice === 'system' ? null : THEMES[choice];

  const choose = (next: Choice) => {
    applyChoice(next);
    menuRef.current?.hidePopover();
    buttonRef.current?.focus();
  };

  // A radio group is one Tab stop; the arrow keys move through it and select
  // as they go, so the page previews each theme. Enter, Space or a click
  // chooses and closes the menu.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const at = CHOICES.indexOf(choice);
    const moves: Partial<Record<string, number>> = {
      ArrowDown: at + 1,
      ArrowRight: at + 1,
      ArrowUp: at - 1,
      ArrowLeft: at - 1,
      Home: 0,
      End: CHOICES.length - 1,
    };
    const target = moves[event.key];
    if (target === undefined) return;
    event.preventDefault();
    const next = CHOICES[(target + CHOICES.length) % CHOICES.length];
    applyChoice(next);
    menuRef.current?.querySelector<HTMLElement>(`[data-choice="${next}"]`)?.focus();
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        popoverTarget={menuId}
        className="inline-flex h-9 items-center gap-2 rounded-md px-2 font-sans text-label font-medium text-ink-2 transition-colors hover:bg-chip hover:text-ink"
        aria-label={`Theme: ${current?.name ?? 'match system'}`}
        title="Change theme"
      >
        {current ? <Swatch id={current.id} size="sm" /> : <SystemSwatch size="sm" />}
        <span className="max-md:sr-only">Theme</span>
      </button>

      <div
        ref={menuRef}
        id={menuId}
        popover="auto"
        className="menu w-72 font-sans"
        onToggle={(event) => {
          if ((event as unknown as ToggleEvent).newState === 'open' && buttonRef.current) {
            placeMenu(buttonRef.current, event.currentTarget, 'end');
          }
        }}
      >
        <p className="px-2.5 pt-1.5 pb-2 text-caption font-semibold text-ink-3">Reading theme</p>
        <div
          role="radiogroup"
          aria-label="Reading theme"
          className="space-y-0.5"
          onKeyDown={onKeyDown}
        >
          {CHOICES.map((id) => {
            const checked = choice === id;
            return (
              <div key={id}>
                {id === 'system' && <div aria-hidden="true" className="mx-2.5 my-1 h-px bg-rule" />}
                <button
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  tabIndex={checked ? 0 : -1}
                  data-choice={id}
                  onClick={() => choose(id)}
                  className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors ${
                    checked ? 'bg-chip' : 'hover:bg-chip'
                  }`}
                >
                  {id === 'system' ? <SystemSwatch /> : <Swatch id={id} />}
                  <span className="min-w-0">
                    <span className="block text-label font-semibold text-ink">
                      {id === 'system' ? 'Match my system' : THEMES[id].name}
                    </span>
                    <span className="block text-caption text-ink-3">
                      {id === 'system'
                        ? `${THEMES[DEFAULT_LIGHT].name} or ${THEMES[DEFAULT_DARK].name}, by your setting`
                        : THEMES[id].description}
                    </span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
