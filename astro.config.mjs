import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://the-bullshit-bureau.pages.dev',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory'
  }
});
