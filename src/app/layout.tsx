import type { Metadata } from 'next';
import '@fontsource/merriweather/400.css';
import '@fontsource/merriweather/700.css';
import '@fontsource/fira-code/400.css';
import '@fontsource/fira-code/500.css';
import './globals.css';
import DesktopSidebar from '@/components/DesktopSidebar';
import MobileNav from '@/components/MobileNav';
import sections from '@/data/sections';
import { getSiteUrlObject, siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: getSiteUrlObject(),
  title: {
    default: siteConfig.title,
    template: '%s | Java2Go',
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    type: 'website',
    url: '/',
    images: [
      {
        url: siteConfig.ogImagePath,
        width: 1200,
        height: 630,
        alt: siteConfig.ogImageAlt,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.twitterImagePath],
    creator: siteConfig.creator,
  },
};

const navSections = sections.map(({ id, title, label }) => ({ id, title, label }));

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="flex min-h-screen" style={{ background: 'var(--bg-base)' }}>
          <DesktopSidebar sections={navSections} />

          {/* Main content area */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Mobile nav (hidden on lg) */}
            <MobileNav sections={navSections} />

            {/* Page content */}
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
