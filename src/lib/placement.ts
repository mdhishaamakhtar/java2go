import type { Block } from '@/types/section';
import { longestLine, normalizeCode, READING_COLUMNS } from './code-layout';

/**
 * Where a block sits on the section page grid (see `.folio` in globals.css):
 * - `reading`: the text column.
 * - `full`: the text column and the margin together. Code that would wrap in
 *   the text column goes full width too.
 * - `margin`: beside the block before it. Below the width where the margin
 *   fits, the grid has one column and margin notes fall back into the flow.
 * - `aside`: a margin-type note that could not go in the margin, shown as a
 *   compact aside in the text column instead.
 */
export type Placement = 'reading' | 'full' | 'margin' | 'aside';

/** Notes longer than this read better inline than squeezed into the margin. */
export const MARGIN_NOTE_MAX_CHARS = 400;

const MARGIN_NOTE_TYPES = new Set(['java', 'tip', 'info']);

function basePlacement(block: Block): Exclude<Placement, 'margin' | 'aside'> {
  switch (block.type) {
    case 'heading':
    case 'compare':
    case 'table':
    case 'figure':
      return 'full';
    case 'codeblock':
      return longestLine(normalizeCode(block.code)) > READING_COLUMNS ? 'full' : 'reading';
    case 'note':
      return block.noteType === 'engine' ? 'full' : 'reading';
    case 'callout':
      return block.tone === 'engine' ? 'full' : 'reading';
    default:
      return 'reading';
  }
}

export function isMarginNote(block: Block): boolean {
  return block.type === 'note' && MARGIN_NOTE_TYPES.has(block.noteType);
}

/**
 * A margin note belongs to the block just before it. It can only sit in the
 * margin beside that block if the block leaves the margin free (a reading-
 * column block) and the note is short enough; otherwise it becomes an aside.
 */
export function placeBlocks(blocks: Block[]): Placement[] {
  const placements: Placement[] = [];
  blocks.forEach((block, i) => {
    if (!isMarginNote(block)) {
      placements.push(basePlacement(block));
      return;
    }
    const anchor = placements[i - 1];
    const short = block.type === 'note' && block.text.length <= MARGIN_NOTE_MAX_CHARS;
    placements.push(anchor === 'reading' && short ? 'margin' : 'aside');
  });
  return placements;
}
