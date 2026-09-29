import type { Section } from '@/types/section';
import { getHeadings, toPlainText } from './slug';

export interface SearchEntry {
  href: string;
  kind: 'section' | 'heading';
  title: string;
  /** Section number, e.g. `07`. */
  number: string;
  /** Where the result lives: the part for a section, the section for a heading. */
  context: string;
  /** Extra text that matches but is not displayed prominently. */
  detail: string;
  order: number;
}

/** Built on the server from section data; small enough to ship to the client whole. */
export function buildSearchIndex(sections: Section[]): SearchEntry[] {
  const entries: SearchEntry[] = [];
  let order = 0;

  for (const section of sections) {
    // Table cells and snippet labels carry the Java vocabulary ("ExecutorService",
    // "@Autowired"), so a Java developer can search by what they already know.
    const vocabulary = section.blocks.flatMap((block) => {
      if (block.type === 'table') return block.rows.flat();
      if (block.type === 'compare') return [block.javaLabel ?? '', block.goLabel ?? ''];
      return [];
    });
    entries.push({
      href: `/sections/${section.id}`,
      kind: 'section',
      title: section.label,
      number: section.number,
      context: section.part.title,
      detail: toPlainText([section.summary, ...vocabulary].join(' ')),
      order: order++,
    });
    for (const heading of getHeadings(section.blocks)) {
      entries.push({
        href: `/sections/${section.id}#${heading.id}`,
        kind: 'heading',
        title: heading.text,
        number: section.number,
        context: section.label,
        detail: '',
        order: order++,
      });
    }
  }

  return entries;
}

const normalize = (text: string) => text.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');

/**
 * Every query term must appear somewhere in the entry. Title matches outrank
 * context matches, and sections outrank headings on ties so the canonical
 * page for a topic comes first.
 */
export function searchEntries(entries: SearchEntry[], query: string, limit = 40): SearchEntry[] {
  const q = normalize(query.trim());
  if (!q) return entries.filter((e) => e.kind === 'section');

  const terms = q.split(/\s+/).filter(Boolean);
  const scored: { entry: SearchEntry; score: number }[] = [];

  for (const entry of entries) {
    const title = normalize(entry.title);
    const rest = normalize(`${entry.context} ${entry.detail} ${entry.number}`);
    if (!terms.every((t) => title.includes(t) || rest.includes(t))) continue;

    let score = entry.kind === 'section' ? 5 : 0;
    if (title === q) score += 120;
    else if (title.startsWith(q)) score += 80;
    else if (title.includes(q)) score += 50;
    for (const term of terms) {
      if (title.includes(term)) score += 12;
      else if (rest.includes(term)) score += 3;
    }
    scored.push({ entry, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.entry.order - b.entry.order)
    .slice(0, limit)
    .map(({ entry }) => entry);
}
