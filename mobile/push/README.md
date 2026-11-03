# Notificações push do The Bullshit Bureau

O app usa `@capacitor-firebase/messaging 8.6.0` com Firebase JS SDK 12.19.0 para receber **tokens FCM em Android e iOS**. Não instalamos `@capacitor/push-notifications` em paralelo: a documentação do plugin Firebase recomenda manter um único plugin de push, evitando conflitos.

O envio remoto com o app fechado requer Firebase Cloud Messaging (FCM), APNs configurado no Firebase para iOS, um Cloudflare Worker e uma tabela D1 que guarda somente tokens de instalações. O jornal continua sem banco de dados editorial.

## 1. Criar o projeto Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Ative Firebase Cloud Messaging.
3. Adicione um app Android com o identificador `br.com.thebullshitbureau.app`.
4. Baixe `google-services.json`. Para desenvolvimento local, coloque-o em `mobile/android/app/google-services.json`.
5. Adicione um app iOS com o mesmo Bundle ID.
6. Baixe `GoogleService-Info.plist`. Coloque-o em `mobile/ios/App/App/GoogleService-Info.plist` e adicione o arquivo ao target **App** no Xcode.
7. No Firebase Console, envie a chave APNs (.p8), Key ID e Team ID da conta Apple.
8. No Xcode, selecione o target App, habilite **Push Notifications** em Signing & Capabilities e configure a equipe de assinatura.

Nunca versione `google-services.json`, `GoogleService-Info.plist`, chave APNs ou JSON de conta de serviço. Os arquivos de configuração estão no `.gitignore`.

### Builds por GitHub Actions

O workflow Android aceita o secret `FIREBASE_GOOGLE_SERVICES_JSON_BASE64` com o conteúdo Base64 de `google-services.json`.

O workflow iOS de simulador aceita `FIREBASE_GOOGLE_SERVICE_INFO_PLIST_BASE64` para copiar o plist durante a geração. Para testar push num iPhone real e gerar um IPA, também é necessário adicionar o arquivo ao target Xcode e configurar assinatura e APNs.

## 2. Criar o banco técnico D1 no Cloudflare

No terminal, em `mobile/push/`:

```bash
npx wrangler login
npx wrangler d1 create the-bullshit-bureau-push
```

Copie o `database_id` retornado para `wrangler.toml`, substituindo `REPLACE_WITH_YOUR_D1_DATABASE_ID`.

Crie a tabela:

```bash
npx wrangler d1 execute the-bullshit-bureau-push --remote --file=schema.sql
```

## 3. Configurar os segredos do Worker

```bash
npx wrangler secret put FIREBASE_SERVICE_ACCOUNT
npx wrangler secret put FIREBASE_PROJECT_ID
npx wrangler secret put PUSH_PUBLISH_SECRET
npx wrangler deploy
```

- **FIREBASE_SERVICE_ACCOUNT:** JSON de uma conta de serviço Google Cloud/Firebase com permissão de envio FCM. Nunca coloque esse JSON no app ou no GitHub.
- **FIREBASE_PROJECT_ID:** identificador do projeto Firebase.
- **PUSH_PUBLISH_SECRET:** segredo aleatório compartilhado com GitHub Actions.

A URL final terá o formato `https://the-bullshit-bureau-push.<sua-conta>.workers.dev`.

Teste:

```bash
curl https://the-bullshit-bureau-push.<sua-conta>.workers.dev/health
```

## 4. Configurar o repositório GitHub

No repositório `KaykyFerro/The-Bullshit-Bureau`, abra **Settings → Secrets and variables → Actions**.

Crie:

| Tipo | Nome | Valor |
| --- | --- | --- |
| Variable | `PUSH_API_URL` | URL base do Worker, sem barra final |
| Secret | `PUSH_WORKER_URL` | A mesma URL base do Worker |
| Secret | `PUSH_PUBLISH_SECRET` | O mesmo segredo configurado no Worker |
| Secret | `FIREBASE_GOOGLE_SERVICES_JSON_BASE64` | `google-services.json` codificado em Base64 |
| Secret | `FIREBASE_GOOGLE_SERVICE_INFO_PLIST_BASE64` | `GoogleService-Info.plist` codificado em Base64 |

A variável `PUSH_API_URL` é incorporada ao app no próximo build. O Worker e o GitHub Actions usam os secrets para enviar alertas de novas publicações. Os arquivos Firebase não são incorporados ao bundle HTML público.

## 5. Como o fluxo funciona

1. O usuário ativa notificações no aplicativo.
2. Firebase Messaging solicita permissão e obtém um token FCM do aparelho.
3. O app envia o token e a plataforma para `POST /register`.
4. Quando uma matéria nova passa para `published` em `docs/data/posts.json`, o workflow GitHub Actions identifica o slug recém-publicado.
5. O workflow chama `POST /notify`, protegido por segredo Bearer.
6. O Worker envia a notificação por FCM para os dispositivos registrados.
7. Quando o usuário toca no aviso, o app abre a matéria correspondente.

O Worker não recebe o texto integral das matérias nem dados pessoais. O D1 guarda somente token de instalação, plataforma e datas técnicas.

## 6. Segurança e privacidade

- Nunca armazene chaves Firebase, certificados Apple ou segredos do Worker no repositório.
- Não coloque tokens de dispositivos em `docs/data/posts.json`.
- O endpoint `/notify` exige segredo Bearer e só é chamado pelo GitHub Actions.
- O endpoint `/register` recebe tokens FCM; armazene esses tokens somente no D1 privado.
- Ao desativar notificações, o app remove o token do Worker e chama `FirebaseMessaging.deleteToken()`.

## 7. Limites atuais

O cliente, Worker e workflow estão preparados, mas o envio remoto não é ativado automaticamente. É necessário criar o projeto Firebase, configurar APNs para iOS, criar o D1/Worker e cadastrar os arquivos de configuração, variáveis e secrets.

Sem Firebase/Cloudflare configurados, o app ainda oferece compartilhamento, favoritos, modo leitura e armazenamento offline. Notificações locais podem alertar sobre novas matérias detectadas quando o app sincroniza; avisos remotos com o app fechado dependem do FCM e das credenciais.
