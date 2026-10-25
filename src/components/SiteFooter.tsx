import { siteConfig } from '@/lib/site';
import { GitHubIcon } from './icons';

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-rule">
      <div className="mx-auto flex w-full max-w-[calc(var(--reading-width)+var(--margin-gap)+var(--margin-width)+4rem)] flex-col gap-3 px-5 py-8 font-sans text-caption text-ink-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>
          Written against Go {siteConfig.versions.go} and Java {siteConfig.versions.java}. © {year}{' '}
          <a
            href={siteConfig.author.url}
            className="text-ink-2 underline-offset-4 hover:text-ink hover:underline"
          >
            {siteConfig.author.name}
          </a>
          . Licensed under GPL-3.0.
        </p>
        <nav aria-label="Project links" className="flex items-center gap-5">
          <a
            href={`${siteConfig.repoUrl}/issues/new`}
            className="text-ink-2 underline-offset-4 hover:text-ink hover:underline"
          >
            Report an issue
          </a>
          <a
            href={siteConfig.repoUrl}
            className="inline-flex items-center gap-1.5 text-ink-2 underline-offset-4 hover:text-ink hover:underline"
          >
            <GitHubIcon size={15} />
            Source
          </a>
        </nav>
      </div>
    </footer>
  );
}
