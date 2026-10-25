/**
 * The arrow in the "Java → Go" wordmark. Archivo has no arrow glyph, so this
 * one is drawn from the wordmark's own font (Archivo ExtraBold, 125% wide):
 * the shaft is its en dash, at the same weight and height, and the head spans
 * the x-height. Units are thousandths of an em; y = 0 is the baseline and
 * negative y is up, so the drawing scales with the type it sits in.
 *
 * Header, social cards and the README banner (public/og-image.svg) all draw
 * it from these numbers.
 */
export const WORDMARK_ARROW = {
  /** The en dash: 133 thick, centred 266 above the baseline. */
  stroke: 133,
  path: 'M0 -266H660M445 -481L660 -266L445 -51',
  /** The ink's extent: up to the x-height, and right to the miter tip. */
  width: 754,
  height: 528,
  /** Space before the shaft and after the tip. Less after: the G is round. */
  before: 260,
  after: 200,
} as const;

/**
 * Where the baseline falls in a line-height-1 box of Archivo: half of the
 * leading, (1000 − (878 + 210)) / 2, plus the 878 ascent.
 */
export const ARCHIVO_BASELINE = 834;
