import type { Metadata } from 'next';
import Link from 'next/link';
import sections from '@/data/sections';
import { getSiteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Java to Go Guide for Developers',
  description:
    'A practical Java to Go guide with side-by-side examples to help Java developers learn Go quickly and write idiomatic services.',
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  const siteUrl = getSiteUrl();
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Java to Go Guide for Developers',
    description:
      'A practical Java to Go guide with side-by-side examples to help Java developers learn Go quickly and write idiomatic services.',
    mainEntityOfPage: `${siteUrl}/`,
    inLanguage: 'en',
    about: ['Java', 'Go', 'Golang', 'Concurrency', 'Backend Development'],
    publisher: {
      '@type': 'Organization',
      name: 'Go for Java Developers',
    },
  };

  return (
    <article className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-10 lg:py-10 xl:px-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <header className="mb-8">
        <p
          className="mb-2 font-mono text-xs uppercase tracking-widest"
          style={{ color: 'var(--accent-cyan)' }}
        >
          Java Developer Path
        </p>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Java to Go Guide
        </h1>
        <p className="mt-3 max-w-3xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Learn Go for Java developers through direct comparisons, mental model shifts, and
          production-oriented patterns. This guide is designed for Java engineers moving into Go
          backend development.
        </p>
      </header>

      <section className="mb-8 rounded-lg p-5" style={{ background: 'var(--bg-surface)' }}>
        <h2 className="mb-3 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Start With These Sections
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {sections.slice(0, 6).map((section) => (
            <Link
              key={section.id}
              href={`/sections/${section.id}`}
              className="rounded-md px-4 py-4 transition-colors"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                textDecoration: 'none',
              }}
            >
              <div className="font-mono text-xs" style={{ color: 'var(--accent-cyan)' }}>
                Section {section.title}
              </div>
              <div className="mt-1 font-medium" style={{ color: 'var(--text-primary)' }}>
                {section.label}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Full Table of Contents
        </h2>
        <ul className="grid gap-2 md:grid-cols-2">
          {sections.map((section) => (
            <li key={section.id}>
              <Link
                href={`/sections/${section.id}`}
                style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
                className="block rounded-md px-3 py-3 transition-colors hover:bg-[var(--bg-surface)]"
              >
                <span className="mr-2 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                  {section.title}
                </span>
                <span>{section.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
