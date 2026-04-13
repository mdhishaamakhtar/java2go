import React from 'react';

interface MarkProps {
  size?: number;
  className?: string;
  title?: string;
}

export function JavaMark({ size = 16, className, title = 'Java' }: MarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      style={{ display: 'block', flex: 'none' }}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <path
        d="M8.5 9.5C8.5 8.95 8.95 8.5 9.5 8.5H15.6C16.15 8.5 16.6 8.95 16.6 9.5V14.2C16.6 15.19 15.79 16 14.8 16H9.5C8.95 16 8.5 15.55 8.5 15V9.5Z"
        fill="var(--accent-java)"
      />
      <path
        d="M16.25 10.15H17.15C18.39 10.15 19.4 11.16 19.4 12.4C19.4 13.64 18.39 14.65 17.15 14.65H16.25"
        stroke="var(--accent-java)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M7.7 17.55H17.7"
        stroke="var(--accent-java)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M11.2 5.2C10.35 6.05 12.5 6.2 11.3 7.45"
        stroke="var(--accent-java)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M13.7 4.6C12.95 5.35 14.95 5.55 13.85 6.7"
        stroke="var(--accent-java)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GoMark({ size = 16, className, title = 'Go' }: MarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      style={{ display: 'block', flex: 'none' }}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <circle cx="8.35" cy="7.15" r="1.85" fill="var(--accent-cyan)" />
      <circle cx="16.1" cy="7.15" r="1.85" fill="var(--accent-cyan)" />
      <ellipse cx="12.2" cy="12.7" rx="7.2" ry="5.7" fill="var(--accent-cyan)" />
      <circle cx="9.8" cy="11.6" r="0.95" fill="var(--bg-base)" />
      <circle cx="14.65" cy="11.6" r="0.95" fill="var(--bg-base)" />
      <path
        d="M11.2 14.45C11.55 14.8 11.95 14.98 12.4 14.98C12.85 14.98 13.25 14.8 13.6 14.45"
        stroke="var(--bg-base)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <rect x="10.9" y="14.95" width="1.15" height="1.65" rx="0.3" fill="#E7F8F4" />
      <rect x="12.35" y="14.95" width="1.15" height="1.65" rx="0.3" fill="#E7F8F4" />
    </svg>
  );
}

export function JavaToGoLockup({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      <JavaMark size={22} className="shrink-0" />
      <span
        className="text-xs"
        style={{ color: 'var(--text-muted)', letterSpacing: 1.5, transform: 'translateY(-0.5px)' }}
      >
        →
      </span>
      <GoMark size={22} className="shrink-0" />
    </span>
  );
}

interface LanguageLabelProps {
  language: 'java' | 'go';
  children: React.ReactNode;
  size?: number;
  className?: string;
}

export function LanguageLabel({ language, children, size = 14, className }: LanguageLabelProps) {
  const Mark = language === 'java' ? JavaMark : GoMark;
  const color = language === 'java' ? 'var(--accent-java)' : 'var(--note-info-text)';

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        color,
        minWidth: 0,
        verticalAlign: 'middle',
      }}
    >
      <Mark size={size} className="shrink-0" />
      <span style={{ minWidth: 0, flex: 1 }}>{children}</span>
    </span>
  );
}
