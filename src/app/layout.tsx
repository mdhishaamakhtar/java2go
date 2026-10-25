import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/piazzolla/opsz.css';
import '@fontsource-variable/piazzolla/opsz-italic.css';
import '@fontsource-variable/martian-mono/wdth.css';
import './globals.css';
import PageHeadingsProvider from '@/components/chrome/PageHeadings';
import SiteHeader from '@/components/chrome/SiteHeader';
import SearchProvider from '@/components/search/SearchProvider';
import SiteFooter from '@/components/SiteFooter';
import { getSectionLinks, parts } from '@/data/sections';
import { getSiteUrlObject, siteConfig } from '@/lib/site';
import { DEFAULT_DARK, DEFAULT_LIGHT, themeCss, themeInitScript, THEMES } from '@/lib/themes';

export const metadata: Metadata = {
  metadataBase: getSiteUrlObject(),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author.name, url: siteConfig.author.url }],
  creator: siteConfig.author.name,
  keywords: [...siteConfig.keywords],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    locale: 'en_US',
    url: '/',
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

// A theme the reader picks adds its own theme-color ahead of these (see themes.ts).
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: THEMES[DEFAULT_LIGHT].tokens.paper },
    { media: '(prefers-color-scheme: dark)', color: THEMES[DEFAULT_DARK].tokens.paper },
  ],
  colorScheme: 'light dark',
};

const sectionLinks = getSectionLinks();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // data-scroll-behavior lets Next turn smooth scrolling off during route
    // changes, so a page turn lands at the top instead of gliding there.
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <style dangerouslySetInnerHTML={{ __html: themeCss() }} />
      </head>
      <body className="bg-paper text-copy">
        <a
          href="#main-content"
          className="fixed top-3 left-3 z-50 -translate-y-20 rounded-md bg-ink px-4 py-2.5 font-sans text-label font-semibold text-paper transition-transform focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        {/* Shared by every diagram: the Chalkboard theme's chalk grain. */}
        <svg width="0" height="0" aria-hidden="true" className="absolute">
          {/* A fixed region in drawing units: a bounding-box region would be empty
              for straight lines, which have no height or no width. */}
          <filter
            id="chalk-grain"
            filterUnits="userSpaceOnUse"
            x="-20"
            y="-20"
            width="400"
            height="320"
          >
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="1.8" />
          </filter>
        </svg>
        <SearchProvider>
          <PageHeadingsProvider>
            <div className="flex min-h-dvh flex-col">
              <SiteHeader parts={parts} sections={sectionLinks} />
              <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
                {children}
              </main>
              <SiteFooter />
            </div>
          </PageHeadingsProvider>
        </SearchProvider>
      </body>
    </html>
  );
}
