# Notificações push do The Bullshit Bureau

O aplicativo já contém o cliente Capacitor para solicitar permissão, registrar o token do dispositivo e abrir uma matéria quando o usuário toca na notificação. O envio com o aplicativo fechado exige Firebase Cloud Messaging (FCM) e um pequeno endpoint Cloudflare Worker.

O site e o Pages CMS continuam sem banco de dados editorial. O D1 abaixo guarda somente tokens de instalação para entrega de notificações.

## 1. Criar o projeto Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Ative Firebase Cloud Messaging.
3. Adicione um app Android com o identificador `br.com.thebullshitbureau.app`.
4. Baixe `google-services.json`. Depois de gerar a plataforma Android, coloque-o em `mobile/android/app/google-services.json`.
5. Adicione um app iOS com o mesmo Bundle ID.
6. Baixe `GoogleService-Info.plist`. Coloque-o em `mobile/ios/App/App/GoogleService-Info.plist`.
7. No Firebase Console, envie a chave APNs (.p8), o Key ID e o Team ID da conta Apple.
8. No Xcode, abra `mobile/ios/App/App.xcworkspace`, selecione o target App e habilite **Push Notifications** em Signing & Capabilities. Configure a assinatura da equipe Apple.

Não versione os dois arquivos de configuração Firebase. Eles estão incluídos no `.gitignore` de `mobile/`.

## 2. Criar o banco técnico D1 no Cloudflare

No terminal, entre em `mobile/push/` e execute:

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

Crie uma chave aleatória longa para proteger o endpoint de envio e guarde-a com segurança.

```bash
npx wrangler secret put FIREBASE_SERVICE_ACCOUNT
npx wrangler secret put FIREBASE_PROJECT_ID
npx wrangler secret put PUSH_PUBLISH_SECRET
npx wrangler deploy
```

- **FIREBASE_SERVICE_ACCOUNT:** JSON completo de uma conta de serviço do Firebase/Google Cloud com permissão para enviar mensagens FCM. Nunca coloque esse JSON no aplicativo ou no GitHub.
- **FIREBASE_PROJECT_ID:** identificador do projeto Firebase.
- **PUSH_PUBLISH_SECRET:** segredo aleatório compartilhado com o GitHub Actions.

A URL final terá o formato `https://the-bullshit-bureau-push.<sua-conta>.workers.dev`.

Teste o serviço:

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

A variável `PUSH_API_URL` é incorporada ao app no próximo build. O secret `PUSH_WORKER_URL` e o segredo de publicação são usados pelo workflow que avisa sobre novas matérias.

## 5. Como o fluxo funciona

1. O usuário ativa notificações no aplicativo.
2. O Capacitor solicita permissão nativa e recebe o token FCM do dispositivo.
3. O aplicativo envia o token e a plataforma para `POST /register`.
4. Quando uma matéria nova passa para `published` em `docs/data/posts.json`, o GitHub Actions identifica o slug que acabou de ser publicado.
5. O workflow chama `POST /notify`, protegido pelo segredo de publicação.
6. O Worker envia a mensagem pelo Firebase Cloud Messaging para os dispositivos registrados.
7. Ao tocar na notificação, o app abre a matéria pelo slug.

O Worker não recebe o texto integral das matérias nem dados pessoais. O D1 guarda apenas o token de instalação, plataforma e datas técnicas de registro.

## 6. Segurança e privacidade

- Não armazene chaves Firebase, certificados Apple ou segredos do Worker no repositório.
- Não coloque tokens de dispositivos no arquivo público `docs/data/posts.json`.
- O endpoint `/notify` exige um segredo Bearer e só é chamado pelo GitHub Actions.
- O endpoint `/register` recebe tokens de dispositivos e deve permanecer restrito a tokens FCM válidos.
- Para revogar uma instalação, envie `DELETE /register` com o token. A opção de desativar notificações do app também deve ser usada para remover o token no serviço em uma próxima melhoria.

## 7. Limites atuais

O código do aplicativo, Worker e workflow está preparado, mas as notificações remotas não são ativadas automaticamente. É necessário criar o projeto Firebase, configurar APNs para iOS, criar o D1/Worker e cadastrar as variáveis e segredos acima.

Sem o backend configurado, o aplicativo ainda pode oferecer notificações locais quando uma nova matéria é detectada durante a abertura/atualização do app. Notificações remotas com o aplicativo fechado dependem do FCM e das credenciais.
