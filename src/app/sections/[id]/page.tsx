import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import sections, { getSectionById, getSectionNav } from '@/data/sections';
import { renderBlocks } from '@/components/SectionRenderer';
import SectionRenderer from '@/components/SectionRenderer';
import Link from 'next/link';
import { getSiteUrl } from '@/lib/site';

export function generateStaticParams() {
  return sections.map((s) => ({ id: s.id }));
}

interface SectionPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SectionPageProps): Promise<Metadata> {
  const { id } = await params;
  const section = getSectionById(id);
  if (!section) return {};
  return {
    title: `${section.label}`,
    description: `Section ${section.title}: ${section.label}. Learn Go from a Java developer perspective with practical examples and idiomatic Go patterns.`,
    alternates: {
      canonical: `/sections/${section.id}`,
    },
    openGraph: {
      title: `${section.label} | Java to Go Guide`,
      description: `Section ${section.title}: ${section.label}. Learn Go from a Java developer perspective with practical examples and idiomatic Go patterns.`,
      type: 'article',
      url: `/sections/${section.id}`,
    },
  };
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { id } = await params;
  const section = getSectionById(id);
  if (!section) notFound();

  const { prev, next } = getSectionNav(id);
  const renderedBlocks = await renderBlocks(section.blocks);
  const siteUrl = getSiteUrl();

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Java to Go Guide',
        item: `${siteUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: section.label,
        item: `${siteUrl}/sections/${section.id}`,
      },
    ],
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: `${section.label} - Java to Go Guide`,
    description: `Section ${section.title}: ${section.label}. Learn Go from a Java developer perspective with practical examples and idiomatic Go patterns.`,
    mainEntityOfPage: `${siteUrl}/sections/${section.id}`,
    inLanguage: 'en',
    isPartOf: {
      '@type': 'CreativeWork',
      name: 'Java to Go Guide',
      url: `${siteUrl}/`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Go for Java Developers',
    },
  };

  return (
    <article className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-10 lg:py-10 xl:px-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Section header */}
      <header className="mb-8">
        <div
          className="mb-1 font-mono text-xs uppercase tracking-widest"
          style={{ color: 'var(--text-muted)' }}
        >
          Section {section.title}
        </div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {section.label}
        </h1>
        <div className="mt-2 h-px w-16" style={{ background: 'var(--accent-cyan)' }} />
      </header>

      {/* Section content */}
      <SectionRenderer renderedBlocks={renderedBlocks} />

      {/* Prev / Next navigation */}
      <nav
        className="mt-12 flex flex-col gap-4 pt-6 md:flex-row"
        style={{ borderTop: '1px solid var(--border-dim)' }}
      >
        {prev ? (
          <Link
            href={`/sections/${prev.id}`}
            className="group flex-1 rounded-lg p-4 transition-colors"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-dim)',
              textDecoration: 'none',
            }}
          >
            <div style={{ color: 'var(--text-muted)', fontSize: 10, marginBottom: 4 }}>
              ← Previous
            </div>
            <div style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 500 }}>
              {prev.title} · {prev.label}
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {next ? (
          <Link
            href={`/sections/${next.id}`}
            className="group flex-1 rounded-lg p-4 text-right transition-colors"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-dim)',
              textDecoration: 'none',
            }}
          >
            <div style={{ color: 'var(--text-muted)', fontSize: 10, marginBottom: 4 }}>Next →</div>
            <div style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 500 }}>
              {next.title} · {next.label}
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </nav>
    </article>
  );
}
