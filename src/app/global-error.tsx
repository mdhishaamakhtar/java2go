'use client';

import './globals.css';

/** Last-resort boundary for errors in the root layout itself. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-canvas font-sans text-primary">
        <main className="mx-auto max-w-[40rem] px-6 pt-24" role="alert">
          <h1 className="text-[2rem] leading-tight font-bold">Something went wrong</h1>
          <p className="mt-4 text-body-lg leading-[1.65] text-secondary">
            The guide failed to load. Please try again.
          </p>
          {error.digest && (
            <p className="mt-3 font-mono text-caption text-muted">Reference: {error.digest}</p>
          )}
          <button
            type="button"
            onClick={reset}
            className="mt-8 inline-flex h-11 items-center rounded-lg bg-go px-5 text-label font-semibold text-canvas"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
