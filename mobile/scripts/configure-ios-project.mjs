import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const appId = 'br.com.thebullshitbureau.app';
const projectPath = resolve('ios/App/App.xcodeproj/project.pbxproj');
const appFolder = resolve('ios/App/App');
let project;

try {
  project = await readFile(projectPath, 'utf8');
} catch {
  throw new Error('Projeto Xcode não encontrado. Execute npx cap add ios primeiro.');
}

function makeId(value) {
  return createHash('sha256').update(value).digest('hex').slice(0, 24).toUpperCase();
}

function addSectionEntry(source, sectionName, entry) {
  const start = source.indexOf(`/* Begin ${sectionName} section */`);
  const end = source.indexOf(`/* End ${sectionName} section */`, start);
  if (start < 0 || end < 0) throw new Error(`Seção Xcode não encontrada: ${sectionName}`);
  return source.slice(0, end) + entry + '\n' + source.slice(end);
}

function addResource(source, filename, fileType) {
  const fileComment = `${filename} in Resources`;
  if (source.includes(fileComment)) return source;

  const fileId = makeId(`${appId}:file:${filename}`);
  const buildId = makeId(`${appId}:build:${filename}`);

  const fileRef = `\t\t${fileId} /* ${filename} */ = {isa = PBXFileReference; lastKnownFileType = ${fileType}; path = ${filename}; sourceTree = "<group>"; };`;
  const buildRef = `\t\t${buildId} /* ${fileComment} */ = {isa = PBXBuildFile; fileRef = ${fileId} /* ${filename} */; };`;

  source = addSectionEntry(source, 'PBXFileReference', fileRef);
  source = addSectionEntry(source, 'PBXBuildFile', buildRef);

  const groupsStart = source.indexOf('/* Begin PBXGroup section */');
  const groupsEnd = source.indexOf('/* End PBXGroup section */', groupsStart);
  const groupsText = source.slice(groupsStart, groupsEnd);
  const groupMatches = [...groupsText.matchAll(/([A-F0-9]{24}) \/\* App \*\/ = \{\s*isa = PBXGroup;([\s\S]*?)\n\s*\};/g)];
  const appGroup = groupMatches.find((match) => /path = App;|name = App;/.test(match[2])) || groupMatches[0];
  if (!appGroup) throw new Error('Grupo App não encontrado no projeto Xcode.');

  const groupText = appGroup[0];
  const groupIndex = source.indexOf(groupText, groupsStart);
  const childrenStart = source.indexOf('children = (', groupIndex);
  const childrenEnd = source.indexOf('\n', childrenStart) + 1;
  if (childrenStart < 0 || childrenEnd <= 0 || childrenStart > groupsEnd) {
    throw new Error('Lista de arquivos do grupo App não encontrada.');
  }
  source = source.slice(0, childrenEnd) + `\t\t\t\t${fileId} /* ${filename} */,\n` + source.slice(childrenEnd);

  const resourcesStart = source.indexOf('/* Begin PBXResourcesBuildPhase section */');
  const resourcesEnd = source.indexOf('/* End PBXResourcesBuildPhase section */', resourcesStart);
  if (resourcesStart < 0 || resourcesEnd < 0) throw new Error('Fase Resources do Xcode não encontrada.');
  const resourcesText = source.slice(resourcesStart, resourcesEnd);
  const filesMatch = /files = \(\n([\s\S]*?)\n\s*\);/.exec(resourcesText);
  if (!filesMatch) throw new Error('Lista de recursos do target App não encontrada.');
  const filesStart = resourcesStart + filesMatch.index + filesMatch[0].indexOf(filesMatch[1]);
  source = source.slice(0, filesStart) + `\t\t\t\t${buildId} /* ${fileComment} */,\n` + source.slice(filesStart);

  console.log(`Recurso registrado no Xcode: ${filename}`);
  return source;
}

const resources = [
  { filename: 'PrivacyInfo.xcprivacy', type: 'text.xml', required: true },
  { filename: 'GoogleService-Info.plist', type: 'text.plist.xml', required: false }
];

for (const resource of resources) {
  try {
    await readFile(resolve(appFolder, resource.filename));
    project = addResource(project, resource.filename, resource.type);
  } catch (error) {
    if (error?.code === 'ENOENT' && !resource.required) {
      console.log('GoogleService-Info.plist não fornecido; push remoto ficará inativo neste build.');
      continue;
    }
    throw error;
  }
}

await writeFile(projectPath, project, 'utf8');
console.log('Recursos nativos iOS registrados no projeto Xcode.');
