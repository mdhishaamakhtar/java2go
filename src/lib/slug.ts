import type { Block, SectionHeading } from '@/types/section';

const INLINE_MARKUP = /[`*]|\[([^\]]+)\]\([^)]+\)/g;

/** Strip inline markup (`code`, **bold**, [links](…)) down to plain text. */
export function toPlainText(text: string): string {
  return text.replace(INLINE_MARKUP, (match, linkText?: string) => linkText ?? '');
}

export function slugify(text: string): string {
  return (
    toPlainText(text)
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section'
  );
}

/**
 * Heading ids for a list of blocks, in order. Duplicate headings get a numeric
 * suffix so every anchor on a page is unique. The renderer, the on-page table
 * of contents and the search index all use this, so their anchors always agree.
 */
export function getHeadings(blocks: Block[]): SectionHeading[] {
  const seen = new Map<string, number>();
  const headings: SectionHeading[] = [];

  for (const block of blocks) {
    if (block.type !== 'heading' && block.type !== 'subheading') continue;
    const base = slugify(block.text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    headings.push({
      id: count === 0 ? base : `${base}-${count + 1}`,
      text: toPlainText(block.text),
      level: block.type === 'heading' ? 2 : 3,
    });
  }

  return headings;
}
