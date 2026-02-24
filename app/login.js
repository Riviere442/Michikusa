import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { signIn, signUp, onAuthStateChange } from '../lib/supabase';

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
        Alert.alert('ログインエラー', 'メールアドレスまたはパスワードが正しくありません');
      } else {
        router.replace('/');
      }
    } catch (e) {
      Alert.alert('エラー', '予期しないエラーが発生しました。もう一度お試しください。');
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
        Alert.alert('新規登録エラー', 'アカウントの作成に失敗しました。入力内容を確認してください。');
      } else {
        // サインアップ成功後、自動でサインインを試みる
        const signInRes = await signIn(email, password);
        if (signInRes.error) {
          Alert.alert(
            '登録完了',
            'アカウントの登録は完了しましたが、自動ログインに失敗しました。ログイン画面からもう一度お試しください。'
          );
        } else {
          router.replace('/');
        }
      }
    } catch (e) {
      Alert.alert('エラー', '予期しないエラーが発生しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  }


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={styles.container}>
      <Text style={styles.appName}>MICHIKUSA</Text>
      <Text style={styles.title}>ログイン</Text>
      <TextInput
        style={styles.input}
        placeholder="メールアドレス"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <TextInput
        style={styles.input}
        placeholder="パスワード"
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
          <View style={{ alignItems: 'center' }}>
            <TouchableOpacity style={styles.textBtn} onPress={handleSignIn}>
              <Text style={styles.textBtnLabel}>ログイン</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 8 }} />
          <View style={{ alignItems: 'center' }}>
            <TouchableOpacity style={styles.textBtn} onPress={handleSignUp}>
              <Text style={styles.textBtnLabel}>新規登録</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Text style={styles.credit}>Created by Team Beginner's Luck</Text>
    </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center', backgroundColor: '#ffffff' },
  appName: { fontSize: 48, fontWeight: '800', textAlign: 'center', marginBottom: 40, marginTop: -60, color: '#333' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 8, alignSelf: 'center', width: '85%' },
  buttons: { marginTop: 24 },
  textBtn: { paddingVertical: 12, paddingHorizontal: 32, backgroundColor: '#4CAF50', borderRadius: 8 },
  textBtnLabel: { fontSize: 16, fontWeight: '600', color: '#fff', textAlign: 'center' },
  credit: { fontSize: 11, color: '#aaa', textAlign: 'center', marginTop: 32 },

});
