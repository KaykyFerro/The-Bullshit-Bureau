# The Bullshit Bureau Mobile

Aplicativo Android e iOS do The Bullshit Bureau, construído com **Capacitor 8.6.0**, Vite e plugins nativos. O app usa as mesmas matérias que o portal e o Pages CMS publicam no GitHub.

**Site:** https://kaykyferro.github.io/The-Bullshit-Bureau/  
**Repositório:** https://github.com/KaykyFerro/The-Bullshit-Bureau  
**Bundle ID:** `br.com.thebullshitbureau.app`

## Recursos

| Recurso | Como funciona |
| --- | --- |
| Interface mobile | WebView local com masthead, editorias e navegação inferior |
| Conteúdo conectado | Busca a edição publicada pelo Pages CMS/GitHub Pages |
| Compartilhamento | Abre a folha nativa de compartilhamento de Android/iOS |
| Favoritos | Slugs guardados localmente via Preferences |
| Leitura offline | Salva corpo da matéria e tenta armazenar a capa na área privada do app |
| Modo leitura | Fonte maior, coluna de leitura e menos distrações; preferência persistida |
| Notificações locais | Pode avisar sobre novas matérias detectadas em uma sincronização do app |
| Push remoto | Firebase Messaging (token FCM em Android e iOS), Cloudflare Worker e GitHub Actions |

As matérias continuam em `docs/data/posts.json`. A redação não precisa manter um segundo conjunto de notícias, e o app não altera o conteúdo editorial.

## Arquitetura

```text
Pages CMS
   |
   v
docs/data/posts.json + docs/data/site.json
   |
   v
GitHub Pages
   |
   +-------------------------+
   |                         |
   v                         v
Portal web              App mobile
                           |
                     Capacitor 8
                       /       \
                  Android      iOS
                  WebView     WKWebView
                       \       /
                      Recursos nativos
                 Share · Preferences · Filesystem
                 Local Notifications · Firebase Messaging · Secure Storage
```

O script `scripts/sync-content.mjs` copia o conteúdo e as imagens de `docs/` para o bundle local do app. Em execução, o app busca a versão mais recente em `https://kaykyferro.github.io/The-Bullshit-Bureau/docs/data/`. Se não houver rede, usa o cache persistente; para leitura offline garantida, salve cada matéria desejada dentro do aplicativo.

## Estrutura

```text
mobile/
├── .gitignore
├── capacitor.config.json
├── package.json
├── vite.config.js
├── scripts/
│   ├── sync-content.mjs
│   ├── configure-android-fcm.mjs
│   ├── patch-ios-push.mjs
│   └── configure-ios-project.mjs
├── src/
│   ├── index.html
│   ├── main.js
│   ├── editor.js
│   ├── styles.css
│   └── public/assets/images/app-mark.svg
├── native/
│   ├── android/ic_stat_bureau.xml
│   ├── android/README.md
│   └── ios/PrivacyInfo.xcprivacy
└── push/
    ├── README.md
    ├── schema.sql
    ├── worker.js
    └── wrangler.toml
```

As pastas `android/`, `ios/` e `www/` são geradas por Capacitor/Vite e não são versionadas. Os workflows geram as plataformas em seus próprios ambientes.

## Requisitos

O projeto usa a linha estável Capacitor 8:

- Node.js 22 ou superior.
- Android: Android Studio 2025.2.1+ e JDK 21.
- iOS: macOS com Xcode 26+.
- Capacitor 8: Android 7/API 24+ e iOS 15+.
- Para novas submissões à Google Play desde 31/08/2026, o app precisa mirar Android 16 / API 36 ou superior.

Referências: [política de suporte do Capacitor](https://capacitorjs.com/docs/main/reference/support-policy), [ambiente Android](https://capacitorjs.com/docs/android), [ambiente iOS](https://capacitorjs.com/docs/ios).

## Instalação local

No Windows, Android é a plataforma de desenvolvimento local. A geração de iOS exige um Mac com Xcode.

```powershell
cd mobile
npm install
npm run build
```

### Android

```powershell
npx cap add android
npm run android:sync
npm run android:open
```

Para executar em um aparelho ou emulador, abra o projeto no Android Studio e execute o target **app**.

Para gerar um APK debug pelo terminal:

```powershell
cd android
.\gradlew.bat assembleDebug
```

Saída:

`mobile/android/app/build/outputs/apk/debug/app-debug.apk`

O APK debug é para teste. Para publicar na Play Store, gere um **AAB de release**, configure uma chave de assinatura e revise a versão alvo do Android.

### iOS

Em um Mac com Xcode:

```bash
cd mobile
npm install
npm run ios:add
npm run ios:sync
npm run ios:open
```

No Xcode, selecione a equipe Apple, um simulador ou iPhone conectado e execute o target **App**.

O workflow incluso gera um app para **iOS Simulator**, sem assinatura. Para gerar IPA, instalar em iPhone físico via TestFlight ou enviar à App Store, são necessários certificado Apple Distribution, provisioning profile, Team ID e assinatura da conta Apple. O simulador não é um IPA distribuível.

## Builds automatizados

Os workflows ficam em `.github/workflows/`:

| Workflow | Saída |
| --- | --- |
| `build-mobile-android.yml` | APK debug para teste, anexado como artifact |
| `build-mobile-ios-simulator.yml` | App para iOS Simulator em ZIP, sem assinatura |
| `notify-mobile-push.yml` | Envia avisos ao publicar uma nova matéria, quando o backend estiver configurado |

Os workflows mobile podem ser executados manualmente em **Actions → Run workflow** e também são acionados por mudanças em `mobile/**`, `docs/data/posts.json` e imagens.

Para baixar o APK:
1. Abra [GitHub Actions](https://github.com/KaykyFerro/The-Bullshit-Bureau/actions).
2. Selecione **Build The Bullshit Bureau Android APK**.
3. Abra a execução concluída.
4. Baixe o artifact `the-bullshit-bureau-android-debug`.

## Conteúdo, favoritos e offline

- `news-cache`: última lista de matérias recebida.
- `favorites`: slugs favoritos.
- `offline-slugs`: lista das matérias guardadas.
- Arquivos de matéria: área privada de arquivos do aplicativo.
- Capas: tentativa de download e armazenamento para leitura sem rede.
- `reader-mode`: preferência do modo de leitura.
- `notifications-enabled`: preferência de notificações.

Favoritos e matérias offline ficam no aparelho, não exigem conta e não são sincronizados entre dispositivos.

## Notificações push

O cliente usa `@capacitor-firebase/messaging 8.6.0`, que retorna tokens FCM nas duas plataformas. Para iOS, o Firebase Console precisa estar configurado com chave APNs (.p8). A configuração FCM completa, D1 e Worker está documentada em [push/README.md](push/README.md).

Secrets/variáveis necessários no GitHub:

| Nome | Tipo |
| --- | --- |
| `PUSH_API_URL` | Variable |
| `PUSH_WORKER_URL` | Secret |
| `PUSH_PUBLISH_SECRET` | Secret |
| `FIREBASE_GOOGLE_SERVICES_JSON_BASE64` | Secret |
| `FIREBASE_GOOGLE_SERVICE_INFO_PLIST_BASE64` | Secret |

Sem esses recursos externos, as notificações remotas permanecem inativas. Favoritos, compartilhamento, modo leitura e offline continuam disponíveis. Notificações locais são disparadas quando o app detecta uma nova matéria durante uma atualização; elas não substituem um serviço push de segundo plano.

## Redação diretamente no aplicativo

Na navegação inferior, abra **Redação**. Na primeira utilização, conecte o app com um **Fine-grained personal access token** do GitHub:

1. Em GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens, crie um token com acesso somente ao repositório `KaykyFerro/The-Bullshit-Bureau`.
2. Conceda somente `Contents: Read and write` em Repository permissions. Metadata permanece Read-only.
3. Defina validade curta e cole o token na tela de acesso editorial.
4. O token fica no Android Keystore ou iOS Keychain, protegido em repouso. Ele não é incorporado ao APK nem enviado ao Cloudflare.
5. Crie ou edite matéria, selecione editoria, categoria, autor, data, capa e conteúdo. Você pode guardar rascunhos localmente ou publicar diretamente no branch `main`.

A publicação atualiza `docs/data/posts.json`; imagens selecionadas no aparelho são enviadas para `docs/assets/images/uploads/`. O GitHub Pages publica o portal automaticamente. Revogue o token no GitHub quando não precisar mais dele e use **Desconectar este aparelho** para apagar a credencial local.

## Permissões e privacidade

Na primeira abertura, o app explica cada recurso. Notificações são opcionais e a permissão do Android/iOS é solicitada quando o usuário escolhe ativá-las. O seletor de capas abre somente após interação e concede acesso à imagem escolhida, sem pedir acesso geral a fotos/armazenamento. Favoritos, cache e leitura offline ficam no espaço privado do app. Localização, contatos e microfone não são solicitados.

O Android não apresenta todas as permissões no instalador: permissões sensíveis são solicitadas durante o uso. A tela inicial explica isso antes de pedir notificações.

## Integração editorial

O fluxo permanece único:

1. A redação edita a matéria no Pages CMS.
2. O CMS grava `docs/data/posts.json` na branch `main`.
3. O GitHub Pages publica o site.
4. Na próxima abertura/retomada, o app atualiza o mesmo JSON.
5. Se FCM/Worker estiverem configurados, o workflow detecta uma nova matéria publicada e envia a notificação.

## Lojas e privacidade

O aplicativo oferece recursos nativos além da leitura do site: compartilhamento do sistema, favoritos persistentes, download offline, modo leitura e notificações. Isso não garante aprovação automática. A Apple avalia a utilidade além de um site reempacotado, conforme a [diretriz 4.2](https://developer.apple.com/app-store/review/guidelines/).

Antes de publicar:
- Crie ícones e splash screens finais nos tamanhos exigidos pelas lojas.
- Configure certificados, perfis de provisionamento e chaves de assinatura.
- Teste notificações em dispositivos reais.
- Teste leitura offline, compartilhamento, links e permissões.
- Publique política de privacidade e preencha as declarações de dados conforme os recursos efetivamente ativados.

**The Bullshit Bureau — A verdade acima da ideologia.**
