import type { DiagramId } from '@/lib/diagram-ids';
import diagrams from '../diagrams';
import { RichText } from '../RichText';

/**
 * A numbered drawing across the full page width. Screen readers get the
 * `alt` description in place of the drawing; everyone gets the caption.
 */
export default function Figure({
  diagram,
  caption,
  alt,
  label,
}: {
  diagram: DiagramId;
  caption: string;
  alt: string;
  /** e.g. "Fig. 7.1" */
  label: string;
}) {
  const Diagram = diagrams[diagram];
  return (
    <figure className="span-full mt-12 mb-2">
      <div role="img" aria-label={alt}>
        <Diagram />
      </div>
      <figcaption className="mt-4 max-w-measure font-serif text-note leading-[1.55] text-ink-2">
        <span className="mr-2 font-sans text-caption font-bold text-ink [font-stretch:112.5%]">
          {label}
        </span>
        <RichText text={caption} />
      </figcaption>
    </figure>
  );
}
