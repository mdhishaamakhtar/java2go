import Link from 'next/link';
import type { ReactNode } from 'react';
import { ExternalIcon } from './icons';

// `code` | **bold** | [text](href) | line break
const TOKEN = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\)|\n)/g;
const LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

export function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-[0.3rem] border border-line bg-elevated px-[0.35em] py-[0.1em] font-mono text-[0.86em] [overflow-wrap:anywhere] text-link [font-variant-ligatures:none]">
      {children}
    </code>
  );
}

function RichLink({ href, children }: { href: string; children: ReactNode }) {
  const className =
    'font-medium text-link underline decoration-link/40 underline-offset-[0.2em] transition-colors hover:decoration-link';

  if (href.startsWith('/') || href.startsWith('#')) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className} target="_blank" rel="noreferrer">
      {children}
      <ExternalIcon size={12} className="ml-0.5 inline-block align-[-0.05em]" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/** Render one paragraph's worth of inline markup. */
export function RichText({ text }: { text: string }) {
  const tokens = text.split(TOKEN).filter(Boolean);
  return (
    <>
      {tokens.map((token, i) => {
        if (token === '\n') return <br key={i} />;
        if (token.length > 2 && token.startsWith('`') && token.endsWith('`')) {
          return <InlineCode key={i}>{token.slice(1, -1)}</InlineCode>;
        }
        if (token.length > 4 && token.startsWith('**') && token.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-primary">
              {/* Bold may contain `code` or links, so parse its contents too */}
              <RichText text={token.slice(2, -2)} />
            </strong>
          );
        }
        const link = LINK.exec(token);
        if (link) {
          return (
            <RichLink key={i} href={link[2]}>
              {link[1]}
            </RichLink>
          );
        }
        return token;
      })}
    </>
  );
}

/** Split text on blank lines into paragraphs. */
export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}
