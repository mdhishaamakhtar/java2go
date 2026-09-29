import sections, { getSectionById } from '@/data/sections';
import { createSectionImage, createSocialImage, socialImageSize } from '@/lib/social-image';
import { toPlainText } from '@/lib/slug';

export const alt = 'Java2Go section preview';
export const size = socialImageSize;
export const contentType = 'image/png';

export function generateStaticParams() {
  return sections.map((s) => ({ id: s.id }));
}

export default async function SectionOpenGraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const section = getSectionById(id);
  if (!section) return createSocialImage();

  return createSectionImage({
    number: section.number,
    total: sections.length,
    label: section.label,
    part: section.part.title,
    summary: toPlainText(section.summary),
  });
}
