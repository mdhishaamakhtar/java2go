import sections from '@/data/sections';
import { buildSearchIndex } from '@/lib/search';

// Generated once at build time and served as a static file.
export const dynamic = 'force-static';

export function GET() {
  return Response.json(buildSearchIndex(sections), {
    headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
  });
}
