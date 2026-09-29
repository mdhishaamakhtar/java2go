import sections from '@/data/sections';
import { socialImageSize } from '@/lib/social-image';
import SectionOpenGraphImage from './opengraph-image';

export const alt = 'Java2Go section preview';
export const size = socialImageSize;
export const contentType = 'image/png';

export function generateStaticParams() {
  return sections.map((s) => ({ id: s.id }));
}

export default SectionOpenGraphImage;
