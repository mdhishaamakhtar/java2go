'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-[46rem] px-5 pt-16 pb-20 sm:px-8 lg:pt-24" role="alert">
      <h1 className="text-[clamp(2rem,4.2vw,2.875rem)] leading-[1.08] font-bold tracking-[-0.02em] text-primary">
        Something went wrong
      </h1>
      <p className="mt-4 text-body-lg leading-[1.65] text-secondary">
        This page failed to render. Trying again usually fixes it; if it keeps happening, please
        report it so it can be fixed.
      </p>
      {error.digest && (
        <p className="mt-3 font-mono text-caption text-muted">Reference: {error.digest}</p>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center rounded-lg bg-go px-5 text-label font-semibold text-canvas transition-[filter] hover:brightness-110"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-lg border border-line px-5 text-label font-medium text-primary transition-colors hover:border-muted/60 hover:bg-surface"
        >
          Back to the contents
        </Link>
      </div>
    </div>
  );
}
