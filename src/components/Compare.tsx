import type { CSSProperties } from 'react';
import type { CodeLang } from '@/types/section';
import CodeBlock from './CodeBlock';

interface Side {
  html: string;
  code: string;
  lang: CodeLang;
  label?: string;
}

/**
 * Java on the left, Go on the right. The pair goes side by side only when the
 * content column is wide enough for both (container query), so it adapts to
 * the collapsible sidebar as well as the viewport.
 */
export default function Compare({ java, go }: { java: Side; go: Side }) {
  return (
    <div className="@container my-6">
      <div
        className="grid grid-cols-1 gap-3 @4xl:grid-cols-2"
        style={{ '--code-font-size': '0.8125rem' } as CSSProperties}
      >
        <CodeBlock
          html={java.html}
          code={java.code}
          lang={java.lang}
          label={java.label || 'Java'}
          side="java"
        />
        <CodeBlock
          html={go.html}
          code={go.code}
          lang={go.lang}
          label={go.label || 'Go'}
          side="go"
        />
      </div>
    </div>
  );
}
