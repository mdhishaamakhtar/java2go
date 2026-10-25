import { RichText, splitParagraphs } from '../RichText';
import { LinkIcon } from '../icons';

/** Body copy: one or more paragraphs, separated by blank lines in the source. */
export function Prose({ text }: { text: string }) {
  return (
    <div className="mt-(--block-gap) space-y-[1.1em] text-body leading-[1.72] text-copy">
      {splitParagraphs(text).map((paragraph, i) => (
        <p key={i}>
          <RichText text={paragraph} />
        </p>
      ))}
    </div>
  );
}

export function BulletList({ items, ordered }: { items: string[]; ordered?: boolean }) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag
      className={`mt-(--block-gap) space-y-2 pl-6 text-body leading-[1.65] text-copy marker:text-ink-3 ${
        ordered ? 'list-decimal marker:font-sans marker:text-label marker:font-bold' : 'list-disc'
      }`}
    >
      {items.map((item, i) => (
        <li key={i} className="pl-1">
          <RichText text={item} />
        </li>
      ))}
    </Tag>
  );
}

function AnchorLink({ id, label }: { id: string; label: string }) {
  return (
    <a
      href={`#${id}`}
      className="ml-2 inline-flex translate-y-[-0.08em] items-center rounded p-1 align-middle text-ink-3 opacity-0 transition-opacity group-hover:opacity-100 hover:text-go focus-visible:opacity-100"
      aria-label={`Link to “${label}”`}
    >
      <LinkIcon size={16} />
    </a>
  );
}

/** A chapter break: a rule across the whole page, then a wide, heavy title. */
export function Heading({ id, text }: { id: string; text: string }) {
  return (
    <h2
      id={id}
      className="group span-full mt-16 border-t border-rule pt-7 font-sans text-heading leading-[1.15] font-extrabold tracking-[-0.015em] text-ink [font-stretch:125%]"
    >
      <RichText text={text} />
      <AnchorLink id={id} label={text} />
    </h2>
  );
}

export function Subheading({ id, text }: { id: string; text: string }) {
  return (
    <h3
      id={id}
      className="group mt-11 font-sans text-subheading leading-snug font-bold text-ink [font-stretch:112.5%]"
    >
      <RichText text={text} />
      <AnchorLink id={id} label={text} />
    </h3>
  );
}
