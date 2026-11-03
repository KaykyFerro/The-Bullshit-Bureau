import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const origin = site?.origin ?? 'https://kaykyferro.github.io';
  const base = import.meta.env.BASE_URL;
  const sitemap = new URL(`${base}sitemap.xml`, origin).toString();
  const body = [
    'User-agent: *',
    'Allow: /',
    `Disallow: ${base}admin/`,
    `Sitemap: ${sitemap}`
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
};
