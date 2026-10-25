import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { kicker, pageTitle } from '@/components/actions';
import { RegisterHeadings } from '@/components/chrome/PageHeadings';
import { PencilIcon } from '@/components/icons';
import PageTurn from '@/components/PageTurn';
import { RichText } from '@/components/RichText';
import SectionRenderer from '@/components/SectionRenderer';
import sections, { getReadingMinutes, getSectionById, getSectionNav, parts } from '@/data/sections';
import { jsonLd } from '@/lib/json-ld';
import { toRoman } from '@/lib/roman';
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
  const partNumber = toRoman(parts.findIndex((p) => p.id === section.part.id) + 1);
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
    <div className="mx-auto w-full max-w-[calc(var(--reading-width)+var(--margin-gap)+var(--margin-width)+4rem)] px-5 pt-10 pb-16 sm:px-8 folio:pt-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structuredData)} />
      <RegisterHeadings headings={headings} />

      <article>
        <header className="folio">
          <div>
            <Link
              href={`/#${section.part.id}`}
              className={`${kicker} transition-colors hover:text-ink`}
            >
              Part {partNumber} · {section.part.title}
            </Link>
            <h1 className={`mt-3 ${pageTitle}`}>{section.label}</h1>
            <p className="mt-5 text-body-lg leading-[1.6] text-ink-2">
              <RichText text={section.summary} />
            </p>
            <p className="mt-4 font-sans text-caption text-ink-3">
              Section <span className="tabular-nums">{section.number}</span> of {sections.length}{' '}
              <span aria-hidden="true">·</span> {minutes} min read
            </p>
          </div>
          <p
            aria-hidden="true"
            className="in-margin hidden text-right font-sans text-[7.5rem] leading-[0.78] font-black tracking-[-0.04em] text-faint [font-stretch:125%] tabular-nums select-none folio:block"
          >
            {section.number}
          </p>
        </header>

        <SectionRenderer blocks={section.blocks} sectionNumber={section.number} />

        <div className="mt-16 flex flex-wrap items-center justify-between gap-3 font-sans text-caption text-ink-3">
          <a
            href={getEditUrl(section.id)}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
          >
            <PencilIcon size={14} />
            Suggest an edit
          </a>
          <a
            href={`${siteConfig.repoUrl}/issues/new?title=${encodeURIComponent(`[${section.id}] `)}`}
            className="transition-colors hover:text-ink"
          >
            Found a mistake? Open an issue
          </a>
        </div>

        <PageTurn prev={prev} next={next} />
      </article>
    </div>
  );
}
