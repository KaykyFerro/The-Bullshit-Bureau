# Android nativo

O projeto Android é gerado pelo Capacitor a partir de `mobile/`:

```powershell
cd mobile
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

A saída de teste é `android/app/build/outputs/apk/debug/app-debug.apk`.

Para ativar FCM, copie o arquivo do Firebase para `android/app/google-services.json` e habilite o plugin Google Services no projeto Gradle gerado conforme as instruções atuais do Firebase. Não versione esse arquivo. O build de CI aceita o conteúdo Base64 por meio do secret `FIREBASE_GOOGLE_SERVICES_JSON_BASE64`.

Confira no projeto gerado `compileSdk` e `targetSdk` iguais ou superiores a 36 antes de enviar uma versão nova à Play Store.
