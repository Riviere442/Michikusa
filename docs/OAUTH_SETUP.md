OAuth / リダイレクト設定（Expo + Supabase）

概要
- モバイルアプリ（Expo）で OAuth を使う場合、Supabase 側と OAuth プロバイダ側（Google など）にリダイレクト URI を登録する必要があります。

手順（概要）
1. Expo アプリでのリダイレクト URI を決める
   - 開発中は `Linking.createURL('/auth/callback')` を使います（例: `exp://.../--/auth/callback` に変換されます）。
   - 例: アプリ側では `const redirectUrl = Linking.createURL('/auth/callback')` を生成して、Supabase の OAuth 呼び出しで `redirectTo` に渡します。

2. Supabase ダッシュボードにリダイレクト URI を登録
   - Supabase プロジェクト → Authentication → Settings → "Redirect URLs" に上で作った URI を追加します。

3. 各 OAuth プロバイダ（Google 等）にもリダイレクト URI を登録
   - Google Cloud Console や GitHub OAuth Apps の設定に、Supabase のリダイレクト URI を追加します（Supabase がプロキシする場合は Supabase のドメインを登録することがあります）。

4. 実装ポイント
   - 本リポジトリの `lib/supabase.ts` の `signInWithOAuth(provider, redirectTo?)` に `redirectTo` を渡しています。
   - サンプル: `const redirectUrl = Linking.createURL('/auth/callback'); signInWithOAuth('google', redirectUrl);`
   - 認証完了後、ユーザーはブラウザ→アプリの深いリンクで戻ります。戻り先で `supabase.auth.getSessionFromUrl()` のような処理が必要になる場合があります（Web の場合）。モバイルExpoでは SDKが自動でセッション処理することが多いですが、テストして確認してください。

補足
- ビルド済みアプリ（Google Play / App Store）の場合は、カスタムスキーム（例: `your.app://`）やユニバーサルリンクを使う必要があります。Expoのビルド/slug に合わせて設定してください。
