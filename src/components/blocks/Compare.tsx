import { longestLine, paneWidthRem } from '@/lib/code-layout';
import { CodePane, type CodeProps } from './CodeBlock';

type Side = Omit<CodeProps, 'side'>;

/**
 * Java and Go, joined along a fold, across the full width of the folio. The
 * two sit side by side when both fit at that width without a line wrapping,
 * and otherwise stack, Java above Go: each pane asks for the width its
 * longest line needs, and the grid makes a second column only if both fit.
 */
export default function Compare({ java, go }: { java: Side; go: Side }) {
  const pane = paneWidthRem(Math.max(longestLine(java.code), longestLine(go.code)));
  return (
    <div
      className="span-full mt-[calc(var(--block-gap)+0.5rem)] grid gap-px overflow-hidden rounded-[0.3rem] border border-rule-strong bg-rule-strong"
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${pane}rem), 1fr))` }}
    >
      <div className="min-w-0 bg-sunk">
        <CodePane {...java} label={java.label || 'Java'} side="java" />
      </div>
      <div className="min-w-0 bg-sunk">
        <CodePane {...go} label={go.label || 'Go'} side="go" />
      </div>
    </div>
  );
}
