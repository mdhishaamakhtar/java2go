import { WORDMARK_ARROW } from '@/lib/wordmark';

interface MarkProps {
  size?: number;
  className?: string;
}

/** Amber coffee cup. Decorative: the adjacent text always names the language. */
export function JavaMark({ size = 16, className }: MarkProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      width={size}
      height={size}
      style={{ display: 'block', flex: 'none' }}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.5 9.5C8.5 8.95 8.95 8.5 9.5 8.5H15.6C16.15 8.5 16.6 8.95 16.6 9.5V14.2C16.6 15.19 15.79 16 14.8 16H9.5C8.95 16 8.5 15.55 8.5 15V9.5Z"
        fill="var(--java)"
      />
      <path
        d="M16.25 10.15H17.15C18.39 10.15 19.4 11.16 19.4 12.4C19.4 13.64 18.39 14.65 17.15 14.65H16.25"
        stroke="var(--java)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M7.7 17.55H17.7" stroke="var(--java)" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M11.2 5.2C10.35 6.05 12.5 6.2 11.3 7.45"
        stroke="var(--java)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M13.7 4.6C12.95 5.35 14.95 5.55 13.85 6.7"
        stroke="var(--java)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// The gopher's face is mixed from the Go colour, so it reads the same in every theme.
const GOPHER_FACE = 'color-mix(in srgb, var(--go) 22%, black)';
const GOPHER_TEETH = 'color-mix(in srgb, var(--go) 12%, white)';

/** Teal gopher head. Decorative: the adjacent text always names the language. */
export function GoMark({ size = 16, className }: MarkProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      width={size}
      height={size}
      style={{ display: 'block', flex: 'none' }}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8.35" cy="7.15" r="1.85" fill="var(--go)" />
      <circle cx="16.1" cy="7.15" r="1.85" fill="var(--go)" />
      <ellipse cx="12.2" cy="12.7" rx="7.2" ry="5.7" fill="var(--go)" />
      <circle cx="9.8" cy="11.6" r="0.95" style={{ fill: GOPHER_FACE }} />
      <circle cx="14.65" cy="11.6" r="0.95" style={{ fill: GOPHER_FACE }} />
      <path
        d="M11.2 14.45C11.55 14.8 11.95 14.98 12.4 14.98C12.85 14.98 13.25 14.8 13.6 14.45"
        style={{ stroke: GOPHER_FACE }}
        strokeWidth="1"
        strokeLinecap="round"
      />
      <rect x="10.9" y="14.95" width="1.15" height="1.65" rx="0.3" style={{ fill: GOPHER_TEETH }} />
      <rect
        x="12.35"
        y="14.95"
        width="1.15"
        height="1.65"
        rx="0.3"
        style={{ fill: GOPHER_TEETH }}
      />
    </svg>
  );
}

/**
 * The arrow between "Java" and "Go" in the wordmark, sized in ems so it scales
 * with the type and sitting on the baseline (see src/lib/wordmark.ts).
 */
export function WordmarkArrow({ className }: { className?: string }) {
  const { stroke, path, width, height, before, after } = WORDMARK_ARROW;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={`inline-block align-baseline ${className ?? ''}`}
      style={{
        width: `${width / 1000}em`,
        height: `${height / 1000}em`,
        marginInline: `${before / 1000}em ${after / 1000}em`,
      }}
      viewBox={`0 ${-height} ${width} ${height}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
    >
      <path d={path} />
    </svg>
  );
}
