import { siteConfig } from '@/lib/site';
import { GitHubIcon } from './icons';

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line-dim">
      <div className="mx-auto flex w-full max-w-[72rem] flex-col gap-3 px-5 py-8 text-caption text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <p>
          Written against Go {siteConfig.versions.go} and Java {siteConfig.versions.java}. © {year}{' '}
          <a
            href={siteConfig.author.url}
            className="text-secondary underline-offset-4 hover:text-primary hover:underline"
          >
            {siteConfig.author.name}
          </a>
          . Licensed under GPL-3.0.
        </p>
        <nav aria-label="Project links" className="flex items-center gap-5">
          <a
            href={`${siteConfig.repoUrl}/issues/new`}
            className="text-secondary underline-offset-4 hover:text-primary hover:underline"
          >
            Report an issue
          </a>
          <a
            href={siteConfig.repoUrl}
            className="inline-flex items-center gap-1.5 text-secondary underline-offset-4 hover:text-primary hover:underline"
          >
            <GitHubIcon size={15} />
            Source
          </a>
        </nav>
      </div>
    </footer>
  );
}
