'use client';

import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/piazzolla/opsz.css';
import '@fontsource-variable/martian-mono/wdth.css';
import './globals.css';
import { pageTitle, primaryAction } from '@/components/actions';
import { themeCss, themeInitScript } from '@/lib/themes';

/** Last-resort boundary for errors in the root layout itself. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    // This replaces the root layout, so it brings its own theme and fonts.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <style dangerouslySetInnerHTML={{ __html: themeCss() }} />
      </head>
      <body className="bg-paper text-copy">
        <main className="mx-auto max-w-[40rem] px-6 pt-24" role="alert">
          <h1 className={pageTitle}>Something went wrong</h1>
          <p className="mt-5 text-body-lg leading-[1.6] text-ink-2">
            The guide failed to load. Please try again.
          </p>
          {error.digest && (
            <p className="mt-3 font-mono text-caption text-ink-3">Reference: {error.digest}</p>
          )}
          <button type="button" onClick={reset} className={`mt-8 ${primaryAction}`}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
