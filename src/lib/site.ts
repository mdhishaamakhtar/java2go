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
    'http://localhost:3000';

  return ensureUrlProtocol(raw).replace(/\/+$/, '');
}

export function getSiteUrlObject(): URL {
  return new URL(getSiteUrl());
}
