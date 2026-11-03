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

const callbacks = [
  {
    signature: 'didRegisterForRemoteNotificationsWithDeviceToken',
    source: `    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
    }
`
  },
  {
    signature: 'didFailToRegisterForRemoteNotificationsWithError',
    source: `    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }
`
  },
  {
    signature: 'didReceiveRemoteNotification userInfo',
    source: `    func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable : Any], fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        NotificationCenter.default.post(name: Notification.Name.init("didReceiveRemoteNotification"), object: completionHandler, userInfo: userInfo)
    }
`
  }
];

const missing = callbacks.filter((callback) => !source.includes(callback.signature));
if (missing.length === 0) {
  console.log('Callbacks APNs já estão presentes.');
  process.exit(0);
}

const closingBrace = source.lastIndexOf('}');
if (closingBrace < 0) throw new Error('Não foi possível localizar o fechamento da classe AppDelegate.');
const methods = missing.map((callback) => callback.source).join('\n');
source = source.slice(0, closingBrace) + methods + '\n' + source.slice(closingBrace);
await writeFile(appDelegatePath, source, 'utf8');
console.log(`Callbacks APNs adicionados: ${missing.length}.`);
