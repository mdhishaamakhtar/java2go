/** Serialise structured data for a <script type="application/ld+json"> tag. */
export function jsonLd(data: unknown): { __html: string } {
  // Escape "<" so content can never close the script element early.
  return { __html: JSON.stringify(data).replace(/</g, '\\u003c') };
}
