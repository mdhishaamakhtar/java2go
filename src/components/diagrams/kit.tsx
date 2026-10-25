import type { ReactNode } from 'react';

/**
 * Drawing primitives shared by every diagram. Colours come from the active
 * theme through CSS classes (`.dg …` in globals.css), so one drawing works in
 * all four themes. Geometry goes inside `.shapes` groups and text stays
 * outside them, so the Chalkboard grain roughens lines but never letters.
 *
 * Legibility rule: a panel's viewBox is at most PANEL_MAX_WIDTH wide (checked
 * by diagrams.test.tsx). Panels sit side by side on wide screens and stack on
 * phones, so a drawing is never shrunk below a readable size; wide ideas are
 * split into panels instead.
 */
export const PANEL_MAX_WIDTH = 360;

export type Tone = 'ink' | 'muted' | 'java' | 'go' | 'warn';
export type Fill = 'box' | 'chip' | 'java' | 'go' | 'warn' | 'none';
type Point = readonly [number, number];

/** A row of panels that wraps to a column on narrow screens. */
export function Panels({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,16.5rem),1fr))] items-start gap-x-8 gap-y-6">
      {children}
    </div>
  );
}

/** One drawing, with an optional heading above it in the tone's colour. */
export function Panel({
  width,
  height,
  title,
  tone = 'muted',
  children,
}: {
  width: number;
  height: number;
  title?: ReactNode;
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full" style={{ maxWidth: width * 1.25 }}>
      {title && (
        <p
          className="mb-2 font-sans text-caption font-bold [font-stretch:112.5%]"
          style={{ color: TONE_VAR[tone] }}
        >
          {title}
        </p>
      )}
      <svg viewBox={`0 0 ${width} ${height}`} className="dg block h-auto w-full" aria-hidden="true">
        {children}
      </svg>
    </div>
  );
}

const TONE_VAR: Record<Tone, string> = {
  ink: 'var(--ink)',
  muted: 'var(--ink3)',
  java: 'var(--java)',
  go: 'var(--go)',
  warn: 'var(--warn)',
};

const strokeClass = (tone: Tone) => `s-${tone}`;
const fillClass = (fill: Fill) =>
  fill === 'none' ? '' : fill === 'box' ? 'f-box' : fill === 'chip' ? 'f-chip' : `f-${fill}`;

export function Box({
  x,
  y,
  w,
  h,
  tone = 'ink',
  fill = 'box',
  dashed = false,
  r = 4,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  tone?: Tone;
  fill?: Fill;
  dashed?: boolean;
  r?: number;
}) {
  return (
    <g className="shapes">
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={r}
        className={`${strokeClass(tone)} ${fillClass(fill)}`}
        strokeDasharray={dashed ? '4 4' : undefined}
      />
    </g>
  );
}

export type TextKind = 'code' | 'small' | 'note' | 'label';

/** Text in a diagram. `code` is monospace, `note` is the italic serif for asides. */
export function T({
  x,
  y,
  children,
  kind = 'code',
  tone,
  anchor = 'start',
  weight,
}: {
  x: number;
  y: number;
  children: ReactNode;
  kind?: TextKind;
  tone?: 'java' | 'go' | 'warn' | 'num' | 'kw' | 'ink2';
  anchor?: 'start' | 'middle' | 'end';
  weight?: 500 | 600 | 700;
}) {
  const kindClass =
    kind === 'small' ? 't-sm' : kind === 'note' ? 't-note' : kind === 'label' ? 't-label' : '';
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      className={`${kindClass} ${tone ? `t-${tone}` : ''}`}
      fontWeight={weight}
    >
      {children}
    </text>
  );
}

/** A tinted run inside <T>, for a number or keyword within a line of code. */
export function Tok({
  children,
  tone,
}: {
  children: ReactNode;
  tone: 'java' | 'go' | 'warn' | 'num' | 'kw' | 'ink2';
}) {
  return <tspan className={`t-${tone}`}>{children}</tspan>;
}

export function Line({
  from,
  to,
  tone = 'muted',
  dashed = false,
}: {
  from: Point;
  to: Point;
  tone?: Tone;
  dashed?: boolean;
}) {
  return (
    <g className="shapes">
      <line
        x1={from[0]}
        y1={from[1]}
        x2={to[0]}
        y2={to[1]}
        className={strokeClass(tone)}
        strokeDasharray={dashed ? '4 4' : undefined}
      />
    </g>
  );
}

/** A dashed divider, e.g. the fold between two halves of a panel. */
export function Rule({ from, to }: { from: Point; to: Point }) {
  return (
    <g className="shapes">
      <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} className="s-rule" />
    </g>
  );
}

function arrowHead(tip: Point, from: Point, size: number, closed: boolean): string {
  const angle = Math.atan2(tip[1] - from[1], tip[0] - from[0]);
  const spread = closed ? Math.PI / 6 : Math.PI / 7;
  const a: Point = [
    tip[0] - size * Math.cos(angle - spread),
    tip[1] - size * Math.sin(angle - spread),
  ];
  const b: Point = [
    tip[0] - size * Math.cos(angle + spread),
    tip[1] - size * Math.sin(angle + spread),
  ];
  const path = `M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${tip[0]} ${tip[1]} L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
  return closed ? `${path} Z` : path;
}

/**
 * An arrow through `points` (a polyline), or a smooth cubic curve when
 * `curve` gives its two control points. The head points along the last segment.
 */
export function Arrow({
  points,
  curve,
  tone = 'ink',
  dashed = false,
  head = 'open',
}: {
  points: readonly Point[];
  curve?: readonly [Point, Point];
  tone?: Tone;
  dashed?: boolean;
  /** `triangle` is the hollow UML head for "extends" / "implements". */
  head?: 'open' | 'triangle' | 'none';
}) {
  const start = points[0];
  const end = points[points.length - 1];
  const d = curve
    ? `M${start[0]} ${start[1]} C${curve[0][0]} ${curve[0][1]}, ${curve[1][0]} ${curve[1][1]}, ${end[0]} ${end[1]}`
    : `M${points.map((p) => `${p[0]} ${p[1]}`).join(' L')}`;
  const before = curve ? curve[1] : points[points.length - 2];
  return (
    <g className="shapes">
      <path d={d} className={strokeClass(tone)} strokeDasharray={dashed ? '4 4' : undefined} />
      {head !== 'none' && (
        <path
          d={arrowHead(end, before, head === 'triangle' ? 11 : 7, head === 'triangle')}
          className={`${strokeClass(tone)} ${head === 'triangle' ? 'f-box' : ''}`}
          strokeLinejoin="round"
        />
      )}
    </g>
  );
}

/** A filled dot, e.g. a value or a moment on a timeline. */
export function Dot({ at, tone = 'ink', r = 3.5 }: { at: Point; tone?: Tone; r?: number }) {
  const fill = {
    ink: 'f-ink',
    muted: 'f-muted',
    java: 'f-java-solid',
    go: 'f-go-solid',
    warn: 'f-warn-solid',
  }[tone];
  return (
    <g className="shapes">
      <circle cx={at[0]} cy={at[1]} r={r} className={fill} />
    </g>
  );
}

/** A drawn tick or cross, centred on `at`. The site's fonts have no ✓ or ✗ glyphs. */
export function Mark({ at, kind }: { at: Point; kind: 'yes' | 'no' }) {
  const [x, y] = at;
  const d =
    kind === 'yes'
      ? `M${x - 5} ${y} L${x - 1.5} ${y + 4} L${x + 5.5} ${y - 4.5}`
      : `M${x - 4} ${y - 4} L${x + 4} ${y + 4} M${x + 4} ${y - 4} L${x - 4} ${y + 4}`;
  return (
    <g className="shapes">
      <path
        d={d}
        className={kind === 'yes' ? 's-go' : 's-warn'}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}
