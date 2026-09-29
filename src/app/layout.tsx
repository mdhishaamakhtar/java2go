import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@fontsource/barlow/400.css';
import '@fontsource/barlow/500.css';
import '@fontsource/barlow/600.css';
import '@fontsource/barlow/700.css';
import '@fontsource/fira-code/400.css';
import '@fontsource/fira-code/500.css';
import './globals.css';
import DesktopSidebar from '@/components/nav/DesktopSidebar';
import MobileNav from '@/components/nav/MobileNav';
import SearchProvider from '@/components/search/SearchProvider';
import SiteFooter from '@/components/SiteFooter';
import { getSectionLinks, parts } from '@/data/sections';
import { sidebarInitScript } from '@/lib/sidebar';
import { getSiteUrlObject, siteConfig } from '@/lib/site';

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

export const viewport: Viewport = {
  themeColor: '#080812',
  colorScheme: 'dark',
};

const sectionLinks = getSectionLinks();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: sidebarInitScript }} />
      </head>
      <body className="bg-canvas text-primary">
        <a
          href="#main-content"
          className="fixed top-3 left-3 z-50 -translate-y-20 rounded-md bg-elevated px-4 py-2.5 text-label font-medium text-primary shadow-[0_8px_24px_-8px_rgb(0_0_0/0.8)] transition-transform focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        <SearchProvider>
          <div className="flex min-h-dvh">
            <DesktopSidebar parts={parts} sections={sectionLinks} />
            <div className="flex min-w-0 flex-1 flex-col">
              <MobileNav parts={parts} sections={sectionLinks} />
              <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
                {children}
              </main>
              <SiteFooter />
            </div>
          </div>
        </SearchProvider>
      </body>
    </html>
  );
}
