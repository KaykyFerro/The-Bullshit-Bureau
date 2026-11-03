import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const rootGradlePath = resolve('android/build.gradle');
const appGradlePath = resolve('android/app/build.gradle');
const variablesPath = resolve('android/variables.gradle');
const manifestPath = resolve('android/app/src/main/AndroidManifest.xml');
const googleServicesPath = resolve('android/app/google-services.json');
const iconSourcePath = resolve('native/android/ic_stat_bureau.xml');
const iconTargetPath = resolve('android/app/src/main/res/drawable/ic_stat_bureau.xml');
const launcherSourcePath = resolve('native/android/ic_bureau_launcher.xml');
const launcherTargetPath = resolve('android/app/src/main/res/drawable/ic_bureau_launcher.xml');

await mkdir(resolve('android/app/src/main/res/drawable'), { recursive: true });
await cp(iconSourcePath, iconTargetPath);
await cp(launcherSourcePath, launcherTargetPath);

let manifest = await readFile(manifestPath, 'utf8');
manifest = manifest.replace(/android:icon="@mipmap\\/ic_launcher"/g, 'android:icon="@drawable/ic_bureau_launcher"');
manifest = manifest.replace(/android:roundIcon="@mipmap\\/ic_launcher_round"/g, 'android:roundIcon="@drawable/ic_bureau_launcher"');
if (!manifest.includes('android.permission.POST_NOTIFICATIONS')) {
  const appOpen = manifest.indexOf('<application');
  if (appOpen < 0) throw new Error('Tag <application> não encontrado no AndroidManifest.xml.');
  manifest = manifest.slice(0, appOpen) + '    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />\\n    ' + manifest.slice(appOpen);
}
const metaData = '<meta-data android:name="com.google.firebase.messaging.default_notification_icon" android:resource="@drawable/ic_stat_bureau" />';
if (!manifest.includes('com.google.firebase.messaging.default_notification_icon')) {
  const appClose = manifest.indexOf('</application>');
  if (appClose < 0) throw new Error('Tag </application> não encontrado no AndroidManifest.xml.');
  manifest = manifest.slice(0, appClose) + `        ${metaData}\n` + manifest.slice(appClose);
  await writeFile(manifestPath, manifest, 'utf8');
}

try {
  let variables = await readFile(variablesPath, 'utf8');
  variables = variables
    .replace(/compileSdkVersion\s*=\s*\d+/g, 'compileSdkVersion = 36')
    .replace(/targetSdkVersion\s*=\s*\d+/g, 'targetSdkVersion = 36');
  await writeFile(variablesPath, variables, 'utf8');
  console.log('compileSdk/targetSdk definidos como 36.');
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
  console.warn('variables.gradle não encontrado; confira compileSdk/targetSdk no projeto gerado.');
}

try {
  await readFile(googleServicesPath);
} catch {
  console.log('google-services.json não fornecido. Build seguirá sem push remoto.');
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

console.log('Google Services plugin configurado para Firebase Cloud Messaging.');
