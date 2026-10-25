import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';
import { DEFAULT_DARK, THEMES } from '@/lib/themes';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Go for Java Developers',
    short_name: siteConfig.name,
    description: siteConfig.shortDescription,
    start_url: '/',
    display: 'standalone',
    background_color: THEMES[DEFAULT_DARK].tokens.paper,
    theme_color: THEMES[DEFAULT_DARK].tokens.paper,
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
