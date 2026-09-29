import type { Block } from '@/types/section';
import { highlight, normalizeCode } from '@/lib/highlight';
import { getHeadings } from '@/lib/slug';
import CodeBlock from './CodeBlock';
import Compare from './Compare';
import { BulletList, Callout, DataTable, Heading, Note, Prose, Subheading } from './ui';

type Highlighted = { java: string; go: string } | { code: string } | null;

async function highlightBlock(block: Block): Promise<Highlighted> {
  if (block.type === 'compare') {
    const [java, go] = await Promise.all([
      highlight(block.java, block.javaLang ?? 'java'),
      highlight(block.go, block.goLang ?? 'go'),
    ]);
    return { java, go };
  }
  if (block.type === 'codeblock') {
    return { code: await highlight(block.code, block.lang) };
  }
  return null;
}

/** Server component: highlights every code block at build time, then renders. */
export default async function SectionRenderer({ blocks }: { blocks: Block[] }) {
  const highlighted = await Promise.all(blocks.map(highlightBlock));
  const headings = getHeadings(blocks);
  let headingIndex = 0;

  return (
    <div className="min-w-0">
      {blocks.map((block, i) => {
        const html = highlighted[i];

        switch (block.type) {
          case 'prose':
            return <Prose key={i} text={block.text} />;

          case 'heading':
            return <Heading key={i} id={headings[headingIndex++].id} text={block.text} />;

          case 'subheading':
            return <Subheading key={i} id={headings[headingIndex++].id} text={block.text} />;

          case 'list':
            return <BulletList key={i} items={block.items} ordered={block.ordered} />;

          case 'note':
            return <Note key={i} type={block.noteType} text={block.text} />;

          case 'why':
            return <Note key={i} type="why" label="Why Go does this" text={block.text} />;

          case 'callout':
            return <Callout key={i} title={block.title} text={block.text} tone={block.tone} />;

          case 'table':
            return <DataTable key={i} rows={block.rows} head={block.head} />;

          case 'compare':
            if (!html || !('java' in html)) return null;
            return (
              <Compare
                key={i}
                java={{
                  html: html.java,
                  code: normalizeCode(block.java),
                  lang: block.javaLang ?? 'java',
                  label: block.javaLabel,
                }}
                go={{
                  html: html.go,
                  code: normalizeCode(block.go),
                  lang: block.goLang ?? 'go',
                  label: block.goLabel,
                }}
              />
            );

          case 'codeblock':
            if (!html || !('code' in html)) return null;
            return (
              <div key={i} className="my-6">
                <CodeBlock
                  html={html.code}
                  code={normalizeCode(block.code)}
                  lang={block.lang}
                  label={block.label}
                />
              </div>
            );

          default: {
            const exhaustive: never = block;
            return exhaustive;
          }
        }
      })}
    </div>
  );
}
