import type { Metadata } from 'next';
import Link from 'next/link';
import { kicker, primaryAction } from '@/components/actions';
import Compare from '@/components/blocks/Compare';
import { ArrowRightIcon } from '@/components/icons';
import { RichText } from '@/components/RichText';
import sections, { getSectionsByPart, parts } from '@/data/sections';
import { normalizeCode } from '@/lib/code-layout';
import { highlight } from '@/lib/highlight';
import { jsonLd } from '@/lib/json-ld';
import { toRoman } from '@/lib/roman';
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
    return fmt.Errorf("user %s: %w", id, err)
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
    <div className="mx-auto w-full max-w-[calc(var(--reading-width)+var(--margin-gap)+var(--margin-width)+4rem)] px-5 pt-12 pb-16 sm:px-8 folio:pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structuredData)} />

      <header>
        <p className={kicker}>
          A field guide · Go {siteConfig.versions.go} · Java {siteConfig.versions.java}
        </p>
        <h1 className="mt-4 font-sans text-display leading-[0.95] font-black tracking-[-0.035em] text-ink [font-stretch:125%]">
          <span className="text-java">Java</span> to <span className="text-go">Go</span>
          <span className="sr-only">: a guide for Java developers</span>
        </h1>
        <p className="mt-7 max-w-measure text-body-lg leading-[1.6] text-ink-2">
          Go, taught from the Java you already know. Every concept pairs idiomatic Java with
          idiomatic Go, then explains why Go chose differently, so you build the mental model
          instead of translating syntax.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4 font-sans">
          <Link href={`/sections/${first.id}`} className={primaryAction}>
            Start with {first.label}
            <ArrowRightIcon
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
          <a
            href="#contents"
            className="text-label font-semibold text-ink underline decoration-rule-strong decoration-[0.08em] underline-offset-[0.3em] transition-colors hover:decoration-go"
          >
            Browse all {sections.length} sections
          </a>
        </div>
      </header>

      <section aria-labelledby="how-it-reads" className="mt-20">
        <h2
          id="how-it-reads"
          className="border-t border-rule pt-7 font-sans text-heading font-extrabold tracking-[-0.015em] text-ink [font-stretch:125%]"
        >
          How every section reads
        </h2>
        <p className="mt-4 max-w-measure text-body leading-[1.7] text-copy">
          The same job in <span className="font-semibold text-java">Java</span> and in{' '}
          <span className="font-semibold text-go">Go</span>, with the reasoning underneath. Here is
          error handling, the shift most Java developers feel first:
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

      <section aria-labelledby="contents" className="mt-20">
        <h2
          id="contents"
          className="border-t border-rule pt-7 font-sans text-heading font-extrabold tracking-[-0.015em] text-ink [font-stretch:125%]"
        >
          Contents
        </h2>
        <p className="mt-3 font-sans text-caption text-ink-3">
          {sections.length} sections in {parts.length} parts
        </p>

        <div className="mt-6">
          {grouped.map(({ part, sections: partSections }, p) => (
            <section
              key={part.id}
              id={part.id}
              aria-labelledby={`${part.id}-title`}
              className="grid scroll-mt-[calc(var(--header-height)+1.5rem)] gap-x-10 gap-y-3 border-t border-rule py-8 folio:grid-cols-[13rem_minmax(0,1fr)]"
            >
              <div className="font-sans">
                <p
                  aria-hidden="true"
                  className="text-[2.5rem] leading-none font-black text-faint [font-stretch:125%]"
                >
                  {toRoman(p + 1)}
                </p>
                <h3
                  id={`${part.id}-title`}
                  className="mt-2 text-subheading leading-snug font-bold text-ink [font-stretch:112.5%]"
                >
                  {part.title}
                </h3>
                <p className="mt-1.5 text-caption leading-relaxed text-ink-3">{part.description}</p>
              </div>

              <ol>
                {partSections.map((section) => (
                  <li key={section.id} className="border-b border-rule last:border-b-0">
                    <Link
                      href={`/sections/${section.id}`}
                      className="group grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 py-3.5"
                    >
                      <span className="pt-[0.2em] font-mono text-caption text-ink-3 tabular-nums transition-colors group-hover:text-go">
                        {section.number}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-sans text-body leading-snug font-semibold text-ink underline decoration-transparent decoration-[0.08em] underline-offset-[0.25em] transition-colors group-hover:decoration-go">
                          {section.label}
                        </span>
                        <span className="mt-1 line-clamp-2 block text-note leading-relaxed text-ink-2">
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
