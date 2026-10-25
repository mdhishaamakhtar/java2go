import { expect, test } from 'bun:test';
import { WORDMARK_ARROW } from './wordmark';

test('the README banner draws the same wordmark arrow as the site', async () => {
  const banner = await Bun.file(new URL('../../public/og-image.svg', import.meta.url)).text();
  expect(banner).toContain(`d="${WORDMARK_ARROW.path}"`);
  expect(banner).toContain(`stroke-width="${WORDMARK_ARROW.stroke}"`);
});
