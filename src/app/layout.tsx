import type { Metadata } from 'next';
import './globals.css';
import DesktopSidebar from '@/components/DesktopSidebar';
import MobileNav from '@/components/MobileNav';
import sections from '@/data/sections';
import { getSiteUrlObject } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: getSiteUrlObject(),
  title: {
    default: 'Java to Go Guide for Developers',
    template: '%s | Java to Go Guide',
  },
  description:
    'Learn Go for Java developers with side-by-side examples, concurrency patterns, error handling, and practical Go architecture guidance.',
  keywords: [
    'java to go guide',
    'learn go for java developers',
    'go for java devs',
    'java vs go',
    'golang tutorial for java developers',
    'goroutines vs threads',
    'go error handling',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Java to Go Guide for Developers',
    description:
      'Learn Go for Java developers with side-by-side examples, concurrency patterns, error handling, and practical Go architecture guidance.',
    type: 'website',
    url: '/',
    images: [
      {
        url: '/assets/go-for-java-developers-banner.png',
        width: 1200,
        height: 630,
        alt: 'Go for Java Developers banner',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Java to Go Guide for Developers',
    description:
      'Learn Go for Java developers with side-by-side examples, concurrency patterns, error handling, and practical Go architecture guidance.',
    images: ['/assets/go-for-java-developers-banner.png'],
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
