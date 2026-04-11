export const siteConfig = {
  name: 'Java2Go',
  title: 'Java to Go Guide for Developers',
  description:
    'Learn Go for Java developers with side-by-side examples, concurrency patterns, error handling, and practical Go architecture guidance.',
  shortDescription:
    'Go for Java developers. Side-by-side examples, mental model shifts, and practical service patterns.',
  url: 'https://java2go.hishaam.dev',
  ogImagePath: '/opengraph-image',
  twitterImagePath: '/twitter-image',
  ogImageAlt: 'Java2Go preview card',
  creator: 'Md Hishaam Akhtar',
  keywords: [
    'java to go guide',
    'learn go for java developers',
    'go for java devs',
    'java vs go',
    'golang tutorial for java developers',
    'goroutines vs threads',
    'go error handling',
  ],
} as const;

function ensureUrlProtocol(hostOrUrl: string): string {
  if (hostOrUrl.startsWith('http://') || hostOrUrl.startsWith('https://')) {
    return hostOrUrl;
  }
  return `https://${hostOrUrl}`;
}

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    siteConfig.url;

  return ensureUrlProtocol(raw).replace(/\/+$/, '');
}

export function getSiteUrlObject(): URL {
  return new URL(getSiteUrl());
}
