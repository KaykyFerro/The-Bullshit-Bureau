import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const rootGradlePath = resolve('android/build.gradle');
const appGradlePath = resolve('android/app/build.gradle');
const googleServicesPath = resolve('android/app/google-services.json');

try {
  await readFile(googleServicesPath);
} catch {
  console.log('google-services.json não encontrado. Build sem Firebase Cloud Messaging.');
  process.exit(0);
}

let rootGradle = await readFile(rootGradlePath, 'utf8');
if (!rootGradle.includes('com.google.gms.google-services')) {
  const pluginLine = "    id 'com.google.gms.google-services' version '4.4.4' apply false\n";
  if (rootGradle.includes('plugins {')) {
    rootGradle = rootGradle.replace('plugins {', 'plugins {\n' + pluginLine);
  } else {
    rootGradle += `\nbuildscript {
  repositories { google(); mavenCentral() }
  dependencies { classpath 'com.google.gms:google-services:4.4.4' }
}
`;
  }
  await writeFile(rootGradlePath, rootGradle, 'utf8');
}

let appGradle = await readFile(appGradlePath, 'utf8');
if (!appGradle.includes('com.google.gms.google-services')) {
  if (appGradle.includes('plugins {')) {
    appGradle = appGradle.replace('plugins {', "plugins {\n    id 'com.google.gms.google-services'\n");
  } else {
    appGradle += "\napply plugin: 'com.google.gms.google-services'\n";
  }
  await writeFile(appGradlePath, appGradle, 'utf8');
}

console.log('Google Services plugin configurado para Firebase Cloud Messaging.');
