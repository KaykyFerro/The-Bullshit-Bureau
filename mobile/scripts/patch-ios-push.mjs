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

const methods = `
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }

    func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable : Any], fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        NotificationCenter.default.post(name: Notification.Name.init("didReceiveRemoteNotification"), object: completionHandler, userInfo: userInfo)
    }
`;

const signatures = [
  "didRegisterForRemoteNotificationsWithDeviceToken",
  "didFailToRegisterForRemoteNotificationsWithError",
  "didReceiveRemoteNotification"
];

const missing = signatures.filter((signature) => !source.includes(signature));
if (missing.length === 0) {
  console.log('Callbacks APNs já estão presentes.');
  process.exit(0);
}

const filteredMethods = methods.split('\n').filter((line) => {
  if (line.includes('didRegisterForRemoteNotificationsWithDeviceToken')) return missing.includes(signatures[0]) || line.trim() === '';
  if (line.includes('didFailToRegisterForRemoteNotificationsWithError')) return missing.includes(signatures[1]) || line.trim() === '';
  if (line.includes('didReceiveRemoteNotification userInfo')) return missing.includes(signatures[2]) || line.trim() === '';
  return true;
}).join('\n');

const closingBrace = source.lastIndexOf('}');
if (closingBrace < 0) throw new Error('Não foi possível localizar o fechamento da classe AppDelegate.');
source = source.slice(0, closingBrace) + filteredMethods + '\n' + source.slice(closingBrace);
await writeFile(appDelegatePath, source, 'utf8');
console.log('Callbacks APNs exigidos pelo Firebase Messaging foram adicionados.');
