import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/site';

export const socialImageSize = {
  width: 1200,
  height: 630,
} as const;

export const socialImageAlt = siteConfig.ogImageAlt;

async function loadFont(path: string) {
  return readFile(join(process.cwd(), path));
}

export async function createSocialImage() {
  const [barlowRegular, barlowBold] = await Promise.all([
    loadFont('node_modules/@fontsource/barlow/files/barlow-latin-400-normal.woff'),
    loadFont('node_modules/@fontsource/barlow/files/barlow-latin-700-normal.woff'),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#080812',
        color: '#e2e2f0',
      }}
    >
      {/* Content */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '54px 74px',
        }}
      >
        {/* Top: logo dots + Java2Go label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: '#c9b85a',
              boxShadow: '28px 0 0 #4ec9b0',
            }}
          />
          <div
            style={{
              fontFamily: 'Barlow',
              fontSize: 20,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: '#8b8ba7',
            }}
          >
            Java2Go
          </div>
        </div>

        {/* Center: title + subtitle */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            maxWidth: 620,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 18,
              alignItems: 'baseline',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                fontFamily: 'Barlow',
                fontSize: 136,
                lineHeight: 0.88,
                fontWeight: 700,
                letterSpacing: '-0.06em',
                color: '#c9b85a',
                textTransform: 'uppercase',
              }}
            >
              Java
            </div>
            <div
              style={{
                fontFamily: 'Barlow',
                fontSize: 136,
                lineHeight: 0.88,
                fontWeight: 700,
                letterSpacing: '-0.06em',
                color: '#4ec9b0',
                textTransform: 'uppercase',
              }}
            >
              to Go
            </div>
          </div>

          <div
            style={{
              width: 140,
              height: 2,
              background: 'linear-gradient(90deg, #c9b85a 0%, #4ec9b0 100%)',
            }}
          />

          <div
            style={{
              fontFamily: 'Barlow',
              fontSize: 31,
              lineHeight: 1.42,
              fontWeight: 400,
              color: '#c9cada',
            }}
          >
            Side-by-side examples, mental model shifts, and practical service patterns.
          </div>
        </div>

        {/* Bottom: tags left + domain right */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 14,
              fontFamily: 'Barlow',
              fontSize: 18,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: '#8b8ba7',
            }}
          >
            <span style={{ color: '#c9b85a' }}>Java-first</span>
            <span>·</span>
            <span style={{ color: '#4ec9b0' }}>Go-native</span>
            <span>·</span>
            <span>Reference guide</span>
          </div>

          <div
            style={{
              fontFamily: 'Barlow',
              fontSize: 18,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: '#4a7aff',
            }}
          >
            java2go.hishaam.dev
          </div>
        </div>
      </div>
    </div>,
    {
      ...socialImageSize,
      fonts: [
        {
          name: 'Barlow',
          data: barlowRegular,
          style: 'normal',
          weight: 400,
        },
        {
          name: 'Barlow',
          data: barlowBold,
          style: 'normal',
          weight: 700,
        },
      ],
    },
  );
}
