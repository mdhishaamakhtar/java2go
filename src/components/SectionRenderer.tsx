import React from 'react';
import type { Block } from '@/types/section';
import { highlight } from '@/lib/highlight';
import { Note, Prose, H, H2, Tag, Callout, WhyBox } from './ui';
import CodeBlock from './CodeBlock';
import Compare from './Compare';
import { LanguageLabel } from './BrandMarks';

// Lightweight rich-text parser for section copy.
function parseRichText(text: string): React.ReactNode[] {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\n\n|\n)/g).filter(Boolean);
  return tokens.map((token, i) => {
    if (token === '\n\n') {
      return (
        <React.Fragment key={i}>
          <br />
          <br />
        </React.Fragment>
      );
    }
    if (token === '\n') {
      return <br key={i} />;
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return <Tag key={i}>{token.slice(1, -1)}</Tag>;
    }
    if (token.startsWith('**') && token.endsWith('**')) {
      return (
        <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
          {token.slice(2, -2)}
        </strong>
      );
    }
    return token;
  });
}

interface RenderedBlock {
  block: Block;
  javaHtml?: string;
  goHtml?: string;
  codeHtml?: string;
}

interface SectionRendererProps {
  renderedBlocks: RenderedBlock[];
}

export default function SectionRenderer({ renderedBlocks }: SectionRendererProps) {
  return (
    <div>
      {renderedBlocks.map((rb, i) => {
        const block = rb.block;

        switch (block.type) {
          case 'prose':
            return <Prose key={i}>{parseRichText(block.text)}</Prose>;

          case 'heading':
            return <H key={i}>{block.text}</H>;

          case 'subheading':
            return <H2 key={i}>{block.text}</H2>;

          case 'note':
            return (
              <Note key={i} type={block.noteType}>
                {parseRichText(block.text)}
              </Note>
            );

          case 'callout':
            return (
              <Callout key={i} title={block.title} color={block.color}>
                {parseRichText(block.text)}
              </Callout>
            );

          case 'why':
            return <WhyBox key={i}>{parseRichText(block.text)}</WhyBox>;

          case 'compare':
            return (
              <Compare
                key={i}
                javaHtml={rb.javaHtml!}
                goHtml={rb.goHtml!}
                javaRaw={block.java}
                goRaw={block.go}
                javaLabel={block.javaLabel}
                goLabel={block.goLabel}
              />
            );

          case 'codeblock':
            return (
              <div key={i} className="my-3.5">
                <CodeBlock
                  highlightedHtml={rb.codeHtml!}
                  lang={block.lang}
                  label={block.label}
                  rawCode={block.code}
                />
              </div>
            );

          case 'table':
            return (
              <div key={i} className="my-4 grid grid-cols-1 gap-3.5 md:grid-cols-2">
                {block.rows.map(([java, go], j) => (
                  <div
                    key={j}
                    className="grid gap-2 rounded-md"
                    style={{
                      background: 'var(--bg-panel)',
                      padding: '14px 16px',
                      border: '1px solid var(--border-panel)',
                    }}
                  >
                    <LanguageLabel
                      language="java"
                      size={13}
                      className="text-[0.9375rem] leading-relaxed"
                    >
                      {java}
                    </LanguageLabel>
                    <LanguageLabel
                      language="go"
                      size={13}
                      className="text-[0.9375rem] leading-relaxed"
                    >
                      {go}
                    </LanguageLabel>
                  </div>
                ))}
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

// Server-side function to pre-render all code blocks
export async function renderBlocks(blocks: Block[]): Promise<RenderedBlock[]> {
  const results: RenderedBlock[] = [];
  for (const block of blocks) {
    if (block.type === 'compare') {
      const [javaHtml, goHtml] = await Promise.all([
        highlight(block.java, 'java'),
        highlight(block.go, 'go'),
      ]);
      results.push({ block, javaHtml, goHtml });
    } else if (block.type === 'codeblock') {
      const codeHtml = await highlight(block.code, block.lang);
      results.push({ block, codeHtml });
    } else {
      results.push({ block });
    }
  }
  return results;
}
