import type { Block } from '@/types/section';
import { normalizeCode } from '@/lib/code-layout';
import { highlight } from '@/lib/highlight';
import { placeBlocks } from '@/lib/placement';
import { getHeadings } from '@/lib/slug';
import CodeBlock from './blocks/CodeBlock';
import Compare from './blocks/Compare';
import DataTable from './blocks/DataTable';
import Figure from './blocks/Figure';
import { Callout, Note, PullQuote } from './blocks/Notes';
import { BulletList, Heading, Prose, Subheading } from './blocks/Text';

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

/**
 * Server component: highlights every code block at build time, then lays the
 * blocks out on the section grid (`.folio`): text column, margin, or both.
 */
export default async function SectionRenderer({
  blocks,
  sectionNumber,
}: {
  blocks: Block[];
  /** Two-digit section number, used to number figures ("Fig. 7.1"). */
  sectionNumber: string;
}) {
  const highlighted = await Promise.all(blocks.map(highlightBlock));
  const placements = placeBlocks(blocks);
  const headings = getHeadings(blocks);
  let headingIndex = 0;
  let figureIndex = 0;

  return (
    <div className="folio">
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
            return (
              <Note
                key={i}
                type={block.noteType}
                text={block.text}
                inMargin={placements[i] === 'margin'}
              />
            );

          case 'why':
            return <PullQuote key={i} text={block.text} />;

          case 'callout':
            return <Callout key={i} title={block.title} text={block.text} tone={block.tone} />;

          case 'table':
            return <DataTable key={i} rows={block.rows} head={block.head} />;

          case 'figure':
            figureIndex += 1;
            return (
              <Figure
                key={i}
                diagram={block.diagram}
                caption={block.caption}
                alt={block.alt}
                label={`Fig. ${Number(sectionNumber)}.${figureIndex}`}
              />
            );

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
              <CodeBlock
                key={i}
                html={html.code}
                code={normalizeCode(block.code)}
                lang={block.lang}
                label={block.label}
                wide={placements[i] === 'full'}
              />
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
