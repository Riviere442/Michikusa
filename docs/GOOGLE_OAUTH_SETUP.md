# Google OAuth セットアップガイド（Expo + Supabase）

## 概要
モバイルコア（iOS/Android）で Google ログイン機能を実装する手順。

## 1. Google Cloud Console で OAuth クライアント設定

### 1.1 プロジェクト作成 / プロジェクト選択
- https://console.cloud.google.com にアクセス
- プロジェクト作成 または 既存プロジェクト選択

### 1.2 OAuth 同意画面を設定
- 左側メニュー: `OAuth 同意画面`
- User Type: `外部` を選択 → 作成
- 必須項目（アプリ名、ユーザーサポートメールなど）を入力 → 保存

### 1.3 OAuth クライアント ID を作成
- 左側メニュー: `認証情報`
- 上部: `+ 認証情報を作成` → `OAuth クライアント ID`
- アプリの種類: `ウェブアプリケーション` 選択
- リダイレクト URI に以下を追加:
  ```
  https://プロジェクトID.supabase.co/auth/v1/callback
  ```
  例: `https://buryllhtjbgpeqemeody.supabase.co/auth/v1/callback`
- 作成 → クライアント ID とシークレットを控える

## 2. Supabase で Google プロバイダを設定

### 2.1 Supabase ダッシュボード
- プロジェクト → Authentication → Providers
- Google を検索 → クリック
- 以下を入力:
  - `Client ID`: Google Cloud Console で取得したクライアント ID
  - `Client Secret`: Google Cloud Console で取得したシークレット
- 保存

### 2.2 リダイレクト URL を設定
- Authentication → Settings → Redirect URLs
- 以下を追加:
  ```
  exp://<開発マシンのIPまたはホスト名>:<ポート>/--/auth/callback
  ```
  例: `exp://192.168.1.10:8081/--/auth/callback`
  
  または Expo Auth Proxy を使用:
  ```
  https://auth.expo.io/@username/app-slug/--/auth/callback
  ```

## 3. モバイル側の設定（iOS）

### 3.1 iOS の URL スキーム設定
`managed workflow`（Expo Go） の場合、`exp://`スキーム自動処理。
ただし、`bare workflow`（EAS Build） なら以下が必要:

**app.json に追加:**
```json
{
  "plugins": [
    [
      "react-native-google-signin",
      {
        "iosClientId": "your-ios-client-id.apps.googleusercontent.com"
      }
    ]
  ]
}
```

その後 `eas build` で iOS ビルド。

## 4. コード実装

すでに実装済み (`app/login.js`):

```javascript
async function handleOAuth(provider) {
  setLoading(true);
  try {
    const redirectUrl = Linking.createURL('/auth/callback');
    const res = await signInWithOAuth(provider, redirectUrl);
    if (res.error) {
      Alert.alert('OAuth error', res.error.message || String(res.error));
    } else if (res.data?.url) {
      // Supabaseが返す認証URLを開く
      Linking.openURL(res.data.url);
    }
  } catch (e) {
    Alert.alert('Error', String(e));
  } finally {
    setLoading(false);
  }
}
```

Google ボタン: `<TouchableOpacity onPress={() => handleOAuth('google')}>`

## 5. テスト手順

1. Expo 起動: `npm run start`
2. iOS でアプリを開く（Expo Go）
3. ログイン画面で「Continue with Google」をタップ
4. Google ログイン画面が表示される
5. Google アカウントで認可
6. アプリに戻ってセッション確立
7. ホーム画面へ遷移

## トラブル

| 問題 | 対応 |
|------|------|
| `redirect_uri_mismatch` | Supabase / Google Cloud Console のリダイレクト URI が一致していない |
| ブラウザから戻らない | 開発PC と iOS が同じネットワークにない、または Redirect URL が未登録 |
| `invalid_client` | Google Cloud Console のクライアント ID / シークレット が間違っている |

## 補足

- **本番 (App Store / Google Play)**: `eas build --platform ios` で ビルドして、カスタムスキーム or ユニバーサルリンク設定が必要
- **開発中**: Expo Go + `exp://` スキーム で OK
- **トークン有効期限**: Supabase が自動リフレッシュしています（`autoRefreshToken: true`）
