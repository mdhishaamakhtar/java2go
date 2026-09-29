export const siteConfig = {
  name: 'Java2Go',
  title: 'Java to Go Guide for Developers',
  description:
    'Learn Go as a Java developer: side-by-side Java and Go examples, the mental-model shifts that matter, and production patterns for concurrency, errors, testing and HTTP services.',
  shortDescription:
    'Go for Java developers. Side-by-side examples, mental model shifts, and practical service patterns.',
  url: 'https://java2go.hishaam.dev',
  repoUrl: 'https://github.com/mdhishaamakhtar/java2go',
  ogImageAlt: 'Java2Go: a Java to Go guide with side-by-side examples',
  author: {
    name: 'Md Hishaam Akhtar',
    url: 'https://github.com/mdhishaamakhtar',
  },
  /** Go and Java releases the content is written against. */
  versions: {
    go: '1.27',
    java: '25',
  },
  keywords: [
    'java to go guide',
    'learn go for java developers',
    'go for java devs',
    'java vs go',
    'golang tutorial for java developers',
    'goroutines vs threads',
    'goroutines vs virtual threads',
    'go error handling',
    'go concurrency patterns',
  ],
} as const;

function ensureUrlProtocol(hostOrUrl: string): string {
  if (hostOrUrl.startsWith('http://') || hostOrUrl.startsWith('https://')) {
    return hostOrUrl;
  }
  return `https://${hostOrUrl}`;
}

/**
 * Canonical site origin without a trailing slash. Explicit configuration wins;
 * on Vercel the production domain is preferred over per-deployment URLs.
 * A malformed value falls back to the configured production URL instead of
 * crashing the build.
 */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    siteConfig.url;

  const candidate = ensureUrlProtocol(raw.trim()).replace(/\/+$/, '');
  try {
    return new URL(candidate).origin;
  } catch {
    return siteConfig.url;
  }
}

export function getSiteUrlObject(): URL {
  return new URL(getSiteUrl());
}

export function getEditUrl(sectionId: string): string {
  return `${siteConfig.repoUrl}/blob/main/src/data/sections/${sectionId}.ts`;
}
