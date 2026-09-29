import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import OnThisPage from '@/components/OnThisPage';
import { RichText } from '@/components/RichText';
import SectionPager from '@/components/SectionPager';
import SectionRenderer from '@/components/SectionRenderer';
import { ChevronRightIcon, PencilIcon } from '@/components/icons';
import sections, { getReadingMinutes, getSectionById, getSectionNav } from '@/data/sections';
import { jsonLd } from '@/lib/json-ld';
import { getEditUrl, getSiteUrl, siteConfig } from '@/lib/site';
import { getHeadings, toPlainText } from '@/lib/slug';

interface SectionPageProps {
  params: Promise<{ id: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return sections.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: SectionPageProps): Promise<Metadata> {
  const { id } = await params;
  const section = getSectionById(id);
  if (!section) return {};

  const description = toPlainText(section.summary);
  return {
    title: section.label,
    description,
    alternates: { canonical: `/sections/${section.id}` },
    openGraph: {
      type: 'article',
      url: `/sections/${section.id}`,
      title: `${section.label} · Go for Java developers`,
      description,
      section: section.part.title,
    },
    twitter: {
      title: `${section.label} · Go for Java developers`,
      description,
    },
  };
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { id } = await params;
  const section = getSectionById(id);
  if (!section) notFound();

  const { prev, next } = getSectionNav(id);
  const headings = getHeadings(section.blocks);
  const topLevelHeadings = headings.filter((h) => h.level === 2);
  const minutes = getReadingMinutes(section);
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/sections/${section.id}`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Java to Go Guide', item: `${siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: section.label, item: url },
        ],
      },
      {
        '@type': 'TechArticle',
        headline: section.label,
        description: toPlainText(section.summary),
        url,
        mainEntityOfPage: url,
        inLanguage: 'en',
        articleSection: section.part.title,
        proficiencyLevel: 'Intermediate',
        timeRequired: `PT${minutes}M`,
        author: { '@type': 'Person', name: siteConfig.author.name, url: siteConfig.author.url },
        isPartOf: { '@type': 'WebSite', name: siteConfig.name, url: `${siteUrl}/` },
      },
    ],
  };

  return (
    <div className="mx-auto flex w-full max-w-[88rem] gap-12 px-5 pt-8 pb-12 sm:px-8 lg:px-12 lg:pt-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structuredData)} />

      <article className="min-w-0 flex-1 3xl:max-w-[65rem]">
        <header className="mb-10">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-caption text-muted">
              <li>
                <Link href="/" className="transition-colors hover:text-primary">
                  Guide
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRightIcon size={14} />
                <Link
                  href={`/#${section.part.id}`}
                  className="transition-colors hover:text-primary"
                >
                  {section.part.title}
                </Link>
              </li>
            </ol>
          </nav>

          <h1 className="mt-3 text-[clamp(2rem,4.2vw,2.875rem)] leading-[1.08] font-bold tracking-[-0.02em] text-primary">
            {section.label}
          </h1>
          <div className="mt-3 h-px w-16 bg-go" aria-hidden="true" />

          <p className="mt-5 max-w-measure text-body-lg leading-[1.65] text-secondary">
            <RichText text={section.summary} />
          </p>

          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-caption text-muted">
            <span>
              Section <span className="font-mono tabular-nums">{section.number}</span> of{' '}
              {sections.length}
            </span>
            <span aria-hidden="true">·</span>
            <span>{minutes} min read</span>
          </p>

          {topLevelHeadings.length >= 3 && (
            <details className="group mt-6 max-w-measure rounded-lg border border-line-dim bg-surface 3xl:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-4 py-3 text-label font-medium text-secondary transition-colors hover:text-primary [&::-webkit-details-marker]:hidden">
                On this page
                <ChevronRightIcon
                  size={16}
                  className="text-muted transition-transform group-open:rotate-90"
                />
              </summary>
              <ol className="space-y-1 border-t border-line-dim px-4 py-3 text-label">
                {topLevelHeadings.map((heading) => (
                  <li key={heading.id}>
                    <a
                      href={`#${heading.id}`}
                      className="block py-0.5 text-muted transition-colors hover:text-primary"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ol>
            </details>
          )}
        </header>

        <SectionRenderer blocks={section.blocks} />

        <div className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-line-dim pt-5 text-caption">
          <a
            href={getEditUrl(section.id)}
            className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-primary"
          >
            <PencilIcon size={14} />
            Suggest an edit
          </a>
          <a
            href={`${siteConfig.repoUrl}/issues/new?title=${encodeURIComponent(
              `[${section.id}] `,
            )}`}
            className="text-muted transition-colors hover:text-primary"
          >
            Found a mistake? Open an issue
          </a>
        </div>

        <SectionPager prev={prev} next={next} />
      </article>

      <aside className="hidden w-56 shrink-0 3xl:block">
        <div className="sticky top-12 max-h-[calc(100dvh-6rem)] [scrollbar-width:thin] overflow-y-auto pb-8">
          <OnThisPage headings={headings} />
        </div>
      </aside>
    </div>
  );
}
