import CodeBlock from './CodeBlock';

interface CompareProps {
  javaHtml: string;
  goHtml: string;
  javaRaw: string;
  goRaw: string;
  javaLabel?: string;
  goLabel?: string;
}

export default function Compare({
  javaHtml,
  goHtml,
  javaRaw,
  goRaw,
  javaLabel,
  goLabel,
}: CompareProps) {
  return (
    <div className="my-3.5">
      <div className="grid w-full grid-cols-1 gap-2.5 md:grid-cols-2">
        <CodeBlock
          highlightedHtml={javaHtml}
          lang="java"
          label={`☕  ${javaLabel || 'Java'}`}
          rawCode={javaRaw}
        />
        <CodeBlock
          highlightedHtml={goHtml}
          lang="go"
          label={`◎  ${goLabel || 'Go'}`}
          rawCode={goRaw}
        />
      </div>
    </div>
  );
}
