import type { APIRoute } from 'astro';
import { publishedPosts, postHref } from '../lib/articles';

const staticPaths = [
  '/',
  '/noticias/',
  '/artigos/',
  '/editoriais/',
  '/opiniao/',
  '/busca/',
  '/sobre/'
];

export const GET: APIRoute = ({ site }) => {
  const origin = site?.origin ?? 'https://the-bullshit-bureau.pages.dev';
  const paths = [
    ...staticPaths,
    ...publishedPosts.map((post) => postHref(post))
  ];
  const urls = paths.map((path) => {
    const loc = new URL(path, origin).toString();
    return `<url><loc>${loc}</loc></url>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
};
