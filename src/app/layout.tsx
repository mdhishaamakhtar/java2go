import type { Metadata } from 'next';
import './globals.css';
import DesktopSidebar from '@/components/DesktopSidebar';
import MobileNav from '@/components/MobileNav';
import sections from '@/data/sections';
import { getSiteUrlObject } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: getSiteUrlObject(),
  title: 'Go for Java Developers',
  description:
    'A comprehensive guide to Go for Java developers — covering types, concurrency, error handling, generics, and more.',
  keywords: ['Go', 'Golang', 'Java', 'guide', 'tutorial', 'concurrency', 'goroutines'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Go for Java Developers',
    description:
      'A comprehensive guide to Go for Java developers — covering types, concurrency, error handling, generics, and more.',
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
    title: 'Go for Java Developers',
    description:
      'A comprehensive guide to Go for Java developers — covering types, concurrency, error handling, generics, and more.',
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
