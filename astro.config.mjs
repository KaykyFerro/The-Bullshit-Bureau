import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://kaykyferro.github.io',
  base: '/The-Bullshit-Bureau',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory'
  }
});
