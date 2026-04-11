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
  const [merriweatherRegular, merriweatherBold, firaCodeRegular] =
    await Promise.all([
      loadFont(
        'node_modules/@fontsource/merriweather/files/merriweather-latin-400-normal.woff',
      ),
      loadFont(
        'node_modules/@fontsource/merriweather/files/merriweather-latin-700-normal.woff',
      ),
      loadFont('node_modules/@fontsource/fira-code/files/fira-code-latin-400-normal.woff'),
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
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at top right, rgba(78, 201, 176, 0.14), transparent 33%), radial-gradient(circle at bottom left, rgba(201, 184, 90, 0.14), transparent 36%)',
        }}
      />
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
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
                fontFamily: '"Fira Code"',
                fontSize: 20,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#8b8ba7',
              }}
            >
              Java2Go
            </div>
          </div>
          <div
            style={{
              fontFamily: '"Fira Code"',
              fontSize: 18,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#4a7aff',
            }}
          >
            java2go.hishaam.dev
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            maxWidth: 920,
            marginTop: '-26px',
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
                fontFamily: 'Merriweather',
                fontSize: 124,
                lineHeight: 0.92,
                fontWeight: 700,
                letterSpacing: '-0.05em',
                color: '#c9b85a',
              }}
            >
              Java
            </div>
            <div
              style={{
                fontFamily: 'Merriweather',
                fontSize: 124,
                lineHeight: 0.92,
                fontWeight: 700,
                letterSpacing: '-0.05em',
                color: '#4ec9b0',
              }}
            >
              to Go
            </div>
          </div>

          <div
            style={{
              width: 140,
              height: 2,
              background:
                'linear-gradient(90deg, rgba(201, 184, 90, 1) 0%, rgba(78, 201, 176, 1) 100%)',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              maxWidth: 820,
              fontFamily: 'Merriweather',
              fontSize: 30,
              lineHeight: 1.35,
              color: '#c9cada',
            }}
          >
            <div>Go for Java developers.</div>
            <div>Side-by-side examples, mental model shifts, and practical service patterns.</div>
          </div>
        </div>

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
              fontFamily: '"Fira Code"',
              fontSize: 18,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#8b8ba7',
            }}
          >
            <span style={{ color: '#c9b85a' }}>Java-first</span>
            <span>•</span>
            <span style={{ color: '#4ec9b0' }}>Go-native</span>
            <span>•</span>
            <span>Reference guide</span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 12,
              padding: '16px 18px',
              border: '1px solid rgba(74, 122, 255, 0.22)',
              background: 'rgba(13, 13, 24, 0.78)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                fontFamily: '"Fira Code"',
                fontSize: 16,
                lineHeight: 1.35,
                color: '#8b8ba7',
              }}
            >
              <span style={{ color: '#c9b85a' }}>threads</span>
              <span style={{ color: '#4ec9b0' }}>goroutines</span>
              <span>errors</span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                fontFamily: '"Fira Code"',
                fontSize: 16,
                lineHeight: 1.35,
                color: '#e2e2f0',
              }}
            >
              <span>{'->'} channels</span>
              <span>{'->'} interfaces</span>
              <span>{'->'} slices</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    {
      ...socialImageSize,
      fonts: [
        {
          name: 'Merriweather',
          data: merriweatherRegular,
          style: 'normal',
          weight: 400,
        },
        {
          name: 'Merriweather',
          data: merriweatherBold,
          style: 'normal',
          weight: 700,
        },
        {
          name: 'Fira Code',
          data: firaCodeRegular,
          style: 'normal',
          weight: 400,
        },
      ],
    },
  );
}
