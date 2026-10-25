'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { pageTitle, primaryAction, secondaryAction } from '@/components/actions';

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
      <h1 className={pageTitle}>Something went wrong</h1>
      <p className="mt-5 text-body-lg leading-[1.6] text-ink-2">
        This page failed to render. Trying again usually fixes it; if it keeps happening, please
        report it so it can be fixed.
      </p>
      {error.digest && (
        <p className="mt-3 font-mono text-caption text-ink-3">Reference: {error.digest}</p>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className={primaryAction}>
          Try again
        </button>
        <Link href="/" className={secondaryAction}>
          Back to the contents
        </Link>
      </div>
    </div>
  );
}
