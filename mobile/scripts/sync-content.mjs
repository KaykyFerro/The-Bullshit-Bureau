import { cp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const mobileRoot = resolve(scriptDir, '..');
const repoRoot = resolve(mobileRoot, '..');
const publicRoot = resolve(mobileRoot, 'src/public');

const requiredFiles = [
  resolve(repoRoot, 'docs/data/posts.json'),
  resolve(repoRoot, 'docs/data/site.json'),
  resolve(repoRoot, 'docs/assets/images/press-engraving.svg')
];

for (const file of requiredFiles) {
  try {
    await readFile(file);
  } catch {
    throw new Error(`Arquivo necessário ao app não encontrado: ${file}`);
  }
}

await rm(resolve(publicRoot, 'data'), { recursive: true, force: true });
await rm(resolve(publicRoot, 'assets/site-images'), { recursive: true, force: true });
await mkdir(resolve(publicRoot, 'data'), { recursive: true });
await mkdir(resolve(publicRoot, 'assets/site-images'), { recursive: true });

await cp(resolve(repoRoot, 'docs/data'), resolve(publicRoot, 'data'), { recursive: true });
await cp(resolve(repoRoot, 'docs/assets/images'), resolve(publicRoot, 'assets/site-images'), { recursive: true });

const appConfig = {
  siteUrl: 'https://kaykyferro.github.io/The-Bullshit-Bureau/',
  feedUrl: 'https://kaykyferro.github.io/The-Bullshit-Bureau/docs/data/posts.json',
  siteInfoUrl: 'https://kaykyferro.github.io/The-Bullshit-Bureau/docs/data/site.json',
  pushApiUrl: process.env.PUSH_API_URL || '',
  appName: 'The Bullshit Bureau'
};

await writeFile(
  resolve(publicRoot, 'app-config.json'),
  JSON.stringify(appConfig, null, 2) + '\n',
  'utf8'
);

console.log('Conteúdo atual do CMS copiado para o bundle mobile.');
