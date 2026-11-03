import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const appDelegatePath = resolve('ios/App/App/AppDelegate.swift');
let source;

try {
  source = await readFile(appDelegatePath, 'utf8');
} catch {
  console.log('AppDelegate.swift ainda não existe. Execute npx cap add ios primeiro.');
  process.exit(0);
}

const marker = 'capacitorDidRegisterForRemoteNotifications';
if (source.includes(marker)) {
  console.log('Callbacks de registro push já estão presentes.');
  process.exit(0);
}

const methods = `
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }
`;

const closingBrace = source.lastIndexOf('}');
if (closingBrace < 0) throw new Error('Não foi possível localizar o fechamento da classe AppDelegate.');
source = source.slice(0, closingBrace) + methods + '\n' + source.slice(closingBrace);
await writeFile(appDelegatePath, source, 'utf8');
console.log('Callbacks APNs adicionados ao AppDelegate.swift.');
