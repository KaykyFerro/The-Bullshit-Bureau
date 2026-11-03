import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const rootGradlePath = resolve('android/build.gradle');
const appGradlePath = resolve('android/app/build.gradle');
const variablesPath = resolve('android/variables.gradle');
const manifestPath = resolve('android/app/src/main/AndroidManifest.xml');
const googleServicesPath = resolve('android/app/google-services.json');
const iconSourcePath = resolve('native/android/ic_stat_bureau.xml');
const iconTargetPath = resolve('android/app/src/main/res/drawable/ic_stat_bureau.xml');

try {
  await mkdir(resolve('android/app/src/main/res/drawable'), { recursive: true });
  await cp(iconSourcePath, iconTargetPath);
  let manifest = await readFile(manifestPath, 'utf8');
  const metaData = '<meta-data android:name="com.google.firebase.messaging.default_notification_icon" android:resource="@drawable/ic_stat_bureau" />';
  if (!manifest.includes('com.google.firebase.messaging.default_notification_icon')) {
    const appClose = manifest.indexOf('</application>');
    if (appClose < 0) throw new Error('Tag </application> não encontrado no AndroidManifest.xml.');
    manifest = manifest.slice(0, appClose) + `        ${metaData}\n` + manifest.slice(appClose);
    await writeFile(manifestPath, manifest, 'utf8');
  }
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
  console.log('Projeto Android ainda não foi gerado ou manifest não encontrado.');
  process.exit(1);
}

try {
  await readFile(googleServicesPath);
} catch {
  console.log('google-services.json não fornecido. APK será gerado sem push remoto.');
  process.exit(0);
}

let rootGradle = await readFile(rootGradlePath, 'utf8');
if (!rootGradle.includes('com.google.gms.google-services')) {
  const pluginLine = "    id 'com.google.gms.google-services' version '4.5.0' apply false\n";
  if (rootGradle.includes('plugins {')) {
    rootGradle = rootGradle.replace('plugins {', 'plugins {\n' + pluginLine);
  } else {
    rootGradle += `\nbuildscript {
  repositories { google(); mavenCentral() }
  dependencies { classpath 'com.google.gms:google-services:4.5.0' }
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

try {
  let variables = await readFile(variablesPath, 'utf8');
  variables = variables
    .replace(/compileSdkVersion\s*=\s*\d+/g, 'compileSdkVersion = 36')
    .replace(/targetSdkVersion\s*=\s*\d+/g, 'targetSdkVersion = 36');
  await writeFile(variablesPath, variables, 'utf8');
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

console.log('Google Services, ícone de notificação e Android API 36 configurados.');
