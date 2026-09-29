import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/site';

export const socialImageSize = {
  width: 1200,
  height: 630,
} as const;

export const socialImageAlt = siteConfig.ogImageAlt;

type FontOptions = NonNullable<ConstructorParameters<typeof ImageResponse>[1]>['fonts'];

const COLORS = {
  base: '#080812',
  primary: '#e2e2f0',
  body: '#c9cada',
  muted: '#8b8ba7',
  java: '#c9b85a',
  go: '#4ec9b0',
  blue: '#4a7aff',
} as const;

/**
 * Barlow is read from /public/fonts. If the files are missing the image still
 * renders with the default font instead of failing the build or the request.
 */
async function loadFonts(): Promise<FontOptions> {
  try {
    const dir = join(process.cwd(), 'public', 'fonts');
    const [regular, bold] = await Promise.all([
      readFile(join(dir, 'barlow-latin-400-normal.woff')),
      readFile(join(dir, 'barlow-latin-700-normal.woff')),
    ]);
    return [
      { name: 'Barlow', data: regular, style: 'normal', weight: 400 },
      { name: 'Barlow', data: bold, style: 'normal', weight: 700 },
    ];
  } catch (error) {
    console.warn('[social-image] Barlow fonts unavailable, using the default font:', error);
    return undefined;
  }
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
}

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 42 }}>
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: 999,
          background: COLORS.java,
          boxShadow: `28px 0 0 ${COLORS.go}`,
        }}
      />
      <div
        style={{
          fontSize: 20,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          fontWeight: 700,
          color: COLORS.muted,
        }}
      >
        {siteConfig.name}
      </div>
    </div>
  );
}

interface FooterItem {
  text: string;
  color?: string;
}

/** Satori only applies flex `gap` to direct children, so items render as a flat list. */
function Footer({ items }: { items: FooterItem[] }) {
  const tags = items.flatMap((item, i) => [
    ...(i > 0 ? [{ text: '·', color: COLORS.muted }] : []),
    item,
  ]);
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <div
        style={{
          display: 'flex',
          gap: 14,
          fontSize: 18,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontWeight: 700,
          color: COLORS.muted,
        }}
      >
        {tags.map((tag, i) => (
          <span key={i} style={{ color: tag.color ?? COLORS.muted }}>
            {tag.text}
          </span>
        ))}
      </div>
      <div
        style={{
          fontSize: 18,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontWeight: 700,
          color: COLORS.blue,
        }}
      >
        {new URL(siteConfig.url).host}
      </div>
    </div>
  );
}

const frame = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '54px 74px',
  backgroundColor: COLORS.base,
  color: COLORS.primary,
  fontFamily: 'Barlow',
} as const;

/** The site-wide card: JAVA → TO GO. */
export async function createSocialImage() {
  return new ImageResponse(
    <div style={frame}>
      <Logo />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'baseline', flexWrap: 'wrap' }}>
          {(['Java', 'to Go'] as const).map((word, i) => (
            <div
              key={word}
              style={{
                fontSize: 136,
                lineHeight: 0.88,
                fontWeight: 700,
                letterSpacing: '-0.04em',
                color: i === 0 ? COLORS.java : COLORS.go,
                textTransform: 'uppercase',
              }}
            >
              {word}
            </div>
          ))}
        </div>
        <div
          style={{
            width: 140,
            height: 2,
            background: `linear-gradient(90deg, ${COLORS.java} 0%, ${COLORS.go} 100%)`,
          }}
        />
        <div style={{ fontSize: 31, lineHeight: 1.42, color: COLORS.body }}>
          Side-by-side examples, mental model shifts, and practical service patterns.
        </div>
      </div>

      <Footer
        items={[
          { text: 'Java-first', color: COLORS.java },
          { text: 'Go-native', color: COLORS.go },
          { text: 'Reference guide' },
        ]}
      />
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
  const titleSize = input.label.length > 26 ? 76 : input.label.length > 16 ? 92 : 108;

  return new ImageResponse(
    <div style={frame}>
      <Logo />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 1000 }}>
        <div
          style={{
            display: 'flex',
            gap: 16,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          <span style={{ color: COLORS.go }}>{input.number}</span>
          <span style={{ color: COLORS.muted }}>{input.part}</span>
        </div>
        <div
          style={{
            fontSize: titleSize,
            lineHeight: 1,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: COLORS.primary,
          }}
        >
          {input.label}
        </div>
        <div
          style={{
            width: 140,
            height: 2,
            background: `linear-gradient(90deg, ${COLORS.java} 0%, ${COLORS.go} 100%)`,
          }}
        />
        <div style={{ fontSize: 30, lineHeight: 1.4, color: COLORS.body, maxWidth: 940 }}>
          {truncate(input.summary, 150)}
        </div>
      </div>

      <Footer
        items={[
          { text: 'Java-first', color: COLORS.java },
          { text: 'Go-native', color: COLORS.go },
          { text: `Section ${input.number} of ${input.total}` },
        ]}
      />
    </div>,
    { ...socialImageSize, fonts: await loadFonts() },
  );
}
