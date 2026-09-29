import type { Metadata } from 'next';
import Link from 'next/link';
import { JavaToGoLockup } from '@/components/BrandMarks';
import Compare from '@/components/Compare';
import { ArrowRightIcon } from '@/components/icons';
import { RichText } from '@/components/RichText';
import sections, { getSectionsByPart, parts } from '@/data/sections';
import { highlight, normalizeCode } from '@/lib/highlight';
import { jsonLd } from '@/lib/json-ld';
import { getSiteUrl, siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Java to Go Guide for Developers',
  description: siteConfig.description,
  alternates: {
    canonical: '/',
  },
};

const demo = {
  java: `try {
    User user = repo.findById(id);
    return render(user);
} catch (UserNotFoundException e) {
    return notFound();
}
// Other exceptions keep unwinding,
// invisible at this call site.`,
  go: `user, err := repo.FindByID(ctx, id)
if errors.Is(err, ErrNotFound) {
    return notFound()
}
if err != nil {
    return fmt.Errorf("load user %s: %w", id, err)
}
return render(user)`,
};

export default async function Home() {
  const siteUrl = getSiteUrl();
  const [javaHtml, goHtml] = await Promise.all([
    highlight(demo.java, 'java'),
    highlight(demo.go, 'go'),
  ]);
  const grouped = getSectionsByPart();
  const first = sections[0];

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: siteConfig.name,
        alternateName: siteConfig.title,
        url: `${siteUrl}/`,
        description: siteConfig.description,
        inLanguage: 'en',
        author: { '@type': 'Person', name: siteConfig.author.name, url: siteConfig.author.url },
      },
      {
        '@type': 'ItemList',
        name: 'Java to Go Guide: contents',
        itemListElement: sections.map((section) => ({
          '@type': 'ListItem',
          position: section.index + 1,
          name: section.label,
          url: `${siteUrl}/sections/${section.id}`,
        })),
      },
    ],
  };

  return (
    <div className="mx-auto w-full max-w-[72rem] px-5 pt-10 pb-12 sm:px-8 lg:px-12 lg:pt-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structuredData)} />

      <header className="max-w-[46rem]">
        <JavaToGoLockup size={30} className="inline-flex items-center gap-2.5" />
        <h1 className="mt-6 text-display leading-[1.03] font-bold tracking-[-0.025em] text-primary">
          Java to Go Guide
        </h1>
        <p className="mt-5 text-body-lg leading-[1.7] text-secondary">
          Go, taught from the Java you already know. Every concept puts idiomatic Java and idiomatic
          Go side by side, then explains why Go chose differently, so you build the mental model
          instead of translating syntax.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href={`/sections/${first.id}`}
            className="group inline-flex h-11 items-center gap-2 rounded-lg bg-go px-5 text-label font-semibold text-canvas transition-[filter] hover:brightness-110"
          >
            Start with {first.label}
            <ArrowRightIcon
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
          <a
            href="#contents"
            className="inline-flex h-11 items-center rounded-lg border border-line px-5 text-label font-medium text-primary transition-colors hover:border-muted/60 hover:bg-surface"
          >
            Browse all {sections.length} sections
          </a>
        </div>
        <p className="mt-6 text-caption text-muted">
          {sections.length} sections in {parts.length} parts · Written against Go{' '}
          {siteConfig.versions.go} and Java {siteConfig.versions.java}
        </p>
      </header>

      <section aria-labelledby="how-it-reads" className="mt-16">
        <h2 id="how-it-reads" className="text-subheading font-semibold text-primary">
          How every section reads
        </h2>
        <p className="mt-2 max-w-measure text-body leading-[1.7] text-copy">
          <span className="font-semibold text-java">Java</span> on the left,{' '}
          <span className="font-semibold text-go">Go</span> on the right, and the reasoning
          underneath. Here is error handling, the shift most Java developers feel first:
        </p>
        <Compare
          java={{
            html: javaHtml,
            code: normalizeCode(demo.java),
            lang: 'java',
            label: 'Java: exceptions unwind the stack',
          }}
          go={{
            html: goHtml,
            code: normalizeCode(demo.go),
            lang: 'go',
            label: 'Go: errors are values you check',
          }}
        />
      </section>

      <section aria-labelledby="contents" className="mt-16">
        <h2
          id="contents"
          className="border-b border-line-dim pb-3 text-heading leading-tight font-bold tracking-[-0.01em] text-primary"
        >
          Contents
        </h2>

        <div className="mt-2">
          {grouped.map(({ part, sections: partSections }) => (
            <section
              key={part.id}
              id={part.id}
              aria-labelledby={`${part.id}-title`}
              className="grid gap-x-10 gap-y-4 border-b border-line-dim py-8 last:border-b-0 lg:grid-cols-[14rem_minmax(0,1fr)]"
            >
              <div>
                <h3
                  id={`${part.id}-title`}
                  className="text-subheading leading-snug font-semibold text-primary"
                >
                  {part.title}
                </h3>
                <p className="mt-1.5 text-caption leading-relaxed text-secondary">
                  {part.description}
                </p>
              </div>

              <ol className="grid gap-1 md:grid-cols-2">
                {partSections.map((section) => (
                  <li key={section.id}>
                    <Link
                      href={`/sections/${section.id}`}
                      className="group flex h-full gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-surface"
                    >
                      <span className="pt-0.5 font-mono text-caption text-muted tabular-nums transition-colors group-hover:text-go">
                        {section.number}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-body leading-snug font-medium text-primary">
                          {section.label}
                        </span>
                        <span className="mt-1 line-clamp-2 block text-caption leading-relaxed text-secondary">
                          <RichText text={section.summary} />
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
