import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ReactNode } from 'react';
import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/site';
import { THEMES } from '@/lib/themes';
import { ARCHIVO_BASELINE, WORDMARK_ARROW } from '@/lib/wordmark';

export const socialImageSize = {
  width: 1200,
  height: 630,
} as const;

export const socialImageAlt = siteConfig.ogImageAlt;

type FontOptions = NonNullable<ConstructorParameters<typeof ImageResponse>[1]>['fonts'];

/** Social cards always use Night ink, the default dark theme. */
const COLORS = THEMES.night.tokens;

/**
 * Satori cannot read variable or WOFF2 fonts, so /public/fonts holds static
 * WOFF instances cut from the site's variable fonts with fontTools:
 *   archivo-expanded-800      Archivo  wdth 125   wght 800
 *   archivo-semiexpanded-700  Archivo  wdth 112.5 wght 700
 *   piazzolla-400             Piazzolla opsz 24   wght 400
 * with the GSUB table removed: Satori's font parser rejects its chaining
 * substitutions, and these cards need no ligatures or alternates.
 * If the files are missing the image still renders with the default font.
 */
async function loadFonts(): Promise<FontOptions> {
  try {
    const dir = join(process.cwd(), 'public', 'fonts');
    const [expanded, semiExpanded, serif] = await Promise.all([
      readFile(join(dir, 'archivo-expanded-800.woff')),
      readFile(join(dir, 'archivo-semiexpanded-700.woff')),
      readFile(join(dir, 'piazzolla-400.woff')),
    ]);
    return [
      { name: 'Archivo Expanded', data: expanded, style: 'normal', weight: 800 },
      { name: 'Archivo', data: semiExpanded, style: 'normal', weight: 700 },
      { name: 'Piazzolla', data: serif, style: 'normal', weight: 400 },
    ];
  } catch (error) {
    console.warn('[social-image] fonts unavailable, using the default font:', error);
    return undefined;
  }
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
}

const frame = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '60px 76px 54px',
  backgroundColor: COLORS.paper,
  color: COLORS.ink,
  fontFamily: 'Archivo',
} as const;

/**
 * "Java → Go", the running header's wordmark. Every item is one em tall (line
 * height 1), so the arrow is drawn in a one-em box with the baseline where
 * Archivo's falls.
 */
function Wordmark({ size }: { size: number }) {
  const { stroke, path, width, before, after } = WORDMARK_ARROW;
  return (
    <div
      style={{
        display: 'flex',
        fontFamily: 'Archivo Expanded',
        lineHeight: 1,
        fontSize: size,
        letterSpacing: '-0.01em',
      }}
    >
      <span style={{ color: COLORS.java }}>Java</span>
      <svg
        width={(size * width) / 1000}
        height={size}
        viewBox={`0 ${-ARCHIVO_BASELINE} ${width} 1000`}
        fill="none"
        stroke={COLORS.ink3}
        strokeWidth={stroke}
        style={{ marginLeft: (size * before) / 1000, marginRight: (size * after) / 1000 }}
      >
        <path d={path} />
      </svg>
      <span style={{ color: COLORS.go }}>Go</span>
    </div>
  );
}

/** A hairline, then the wordmark on the left and something on the right. */
function Footer({ right }: { right: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ height: 1, backgroundColor: COLORS.ruleStrong }} />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 22,
          lineHeight: 1,
          color: COLORS.ink3,
        }}
      >
        <Wordmark size={24} />
        {right}
      </div>
    </div>
  );
}

/** The site-wide card. */
export async function createSocialImage() {
  return new ImageResponse(
    <div style={frame}>
      <div style={{ fontSize: 24, color: COLORS.ink3 }}>
        {`A field guide · Go ${siteConfig.versions.go} · Java ${siteConfig.versions.java}`}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div
          style={{
            display: 'flex',
            gap: 34,
            fontFamily: 'Archivo Expanded',
            fontSize: 150,
            lineHeight: 0.9,
            letterSpacing: '-0.04em',
          }}
        >
          <span style={{ color: COLORS.java }}>Java</span>
          <span>to</span>
          <span style={{ color: COLORS.go }}>Go</span>
        </div>
        <div
          style={{
            fontFamily: 'Piazzolla',
            fontSize: 34,
            lineHeight: 1.4,
            color: COLORS.ink2,
            maxWidth: 900,
          }}
        >
          Go, taught from the Java you already know: side by side, with the reasoning underneath.
        </div>
      </div>

      <Footer right={<span>{new URL(siteConfig.url).host}</span>} />
    </div>,
    { ...socialImageSize, fonts: await loadFonts() },
  );
}

/** A card for one section: part, number, title and summary. */
export async function createSectionImage(input: {
  number: string;
  total: number;
  label: string;
  part: string;
  summary: string;
}) {
  const titleSize = input.label.length > 26 ? 72 : input.label.length > 16 ? 88 : 104;

  return new ImageResponse(
    <div style={frame}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 26, color: COLORS.ink3, paddingTop: 10 }}>{input.part}</div>
        <div
          style={{
            fontFamily: 'Archivo Expanded',
            fontSize: 150,
            lineHeight: 0.8,
            letterSpacing: '-0.04em',
            color: COLORS.faint,
          }}
        >
          {input.number}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 26, maxWidth: 1000 }}>
        <div
          style={{
            fontFamily: 'Archivo Expanded',
            fontSize: titleSize,
            lineHeight: 1,
            letterSpacing: '-0.03em',
            color: COLORS.ink,
          }}
        >
          {input.label}
        </div>
        <div style={{ fontFamily: 'Piazzolla', fontSize: 31, lineHeight: 1.4, color: COLORS.ink2 }}>
          {truncate(input.summary, 150)}
        </div>
      </div>

      <Footer right={<span>{`Section ${input.number} of ${input.total}`}</span>} />
    </div>,
    { ...socialImageSize, fonts: await loadFonts() },
  );
}
