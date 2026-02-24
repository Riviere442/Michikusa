import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { signIn, signUp, signInWithOAuth, onAuthStateChange, getUser, signOut } from '../lib/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupAttempted, setSignupAttempted] = useState(false);
  const [lastSignInAttempt, setLastSignInAttempt] = useState(0);

  useEffect(() => {
    const subscription = onAuthStateChange((event, session) => {
      console.log('Auth event', event, session);
    });
    return () => subscription?.unsubscribe?.();
  }, []);

  async function handleSignIn() {
    setLoading(true);
    try {
      const res = await signIn(email, password);
      if (res.error) {
        Alert.alert('Sign in error', res.error.message || String(res.error));
      } else {
        // ナビゲートしてからアラート表示
        router.replace('/home');
      }
    } catch (e) {
      Alert.alert('Error', String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp() {
    setLoading(true);
    try {
      // 入力値の事前検証
      if (!email || !password) {
        Alert.alert('入力エラー', 'メールとパスワードを入力してください');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        Alert.alert('パスワードが短い', 'パスワードは6文字以上必要です');
        setLoading(false);
        return;
      }

      const res = await signUp(email, password);
      if (res.error) {
        const errorMsg = res.error.message || String(res.error);
        Alert.alert('Sign up error', errorMsg);
      } else {
        // サインアップ成功後、自動でサインインを試みる
        const signInRes = await signIn(email, password);
        if (signInRes.error) {
          const errorMsg = signInRes.error.message || String(signInRes.error);
          Alert.alert(
            'Sign up successful, but auto sign-in failed',
            'Error: ' + errorMsg + '\n\nメール確認が必須の場合、Supabaseダッシュボードで設定を変更してください。'
          );
        } else {
          // 自動サインイン成功 → ホーム画面へ（RootLayoutが自動で処理）
          router.replace('/home');
        }
      }
    } catch (e) {
      Alert.alert('Error', String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider) {
    setLoading(true);
    try {
      const redirectUrl = Linking.createURL('/auth/callback');
      const res = await signInWithOAuth(provider, redirectUrl);
      if (res.error) {
        Alert.alert('OAuth error', res.error.message || String(res.error));
      } else if (res.data?.url) {
        // Supabaseが返す認証URLを開く（ブラウザで認可フロー開始）
        const url = res.data.url;
        Linking.openURL(url);
      } else {
        Alert.alert('Info', '認証フローを開始しました');
      }
    } catch (e) {
      Alert.alert('Error', String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ログイン</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
        textContentType="password"
        onBlur={() => {
          // パスワード入力後、フォーカスが外れたら自動でサインイン試行
          if (email && password && !loading) {
            handleSignIn();
          }
        }}
      />

      {loading ? (
        <ActivityIndicator />
      ) : (
        <View style={styles.buttons}>
          <Button title="Sign In" onPress={handleSignIn} />
          <View style={{ height: 8 }} />
          <Button title="Sign Up" onPress={handleSignUp} />
        </View>
      )}

      <Text style={styles.or}>または</Text>

      <View style={styles.oauthRow}>
        <TouchableOpacity 
          style={[styles.oauthBtn, styles.googleBtn]} 
          onPress={() => handleOAuth('google')}
          disabled={loading}
        >
          <Text style={[styles.oauthText, styles.googleText]}>🔵 Google でサインイン</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center', backgroundColor: '#ffffff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 8 },
  buttons: { marginTop: 8 },
  or: { textAlign: 'center', marginVertical: 12, color: '#666' },
  oauthRow: { alignItems: 'center', width: '100%' },
  oauthBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, marginBottom: 8, width: '100%', alignItems: 'center' },
  googleBtn: { backgroundColor: '#4285F4', borderColor: '#4285F4' },
  oauthText: { color: '#333', fontSize: 16, fontWeight: '600' },
  googleText: { color: '#fff' },
});
