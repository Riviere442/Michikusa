import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as Linking from 'expo-linking';
import { signIn, signUp, signInWithOAuth, onAuthStateChange, getUser, signOut } from '../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
        Alert.alert('Signed in', 'ログインに成功しました');
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
      const res = await signUp(email, password);
      if (res.error) {
        Alert.alert('Sign up error', res.error.message || String(res.error));
      } else {
        Alert.alert('Signed up', '登録に成功しました。メールを確認してください。');
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
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
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
        <TouchableOpacity style={styles.oauthBtn} onPress={() => handleOAuth('google')}>
          <Text style={styles.oauthText}>Continue with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.oauthBtn} onPress={() => handleOAuth('github')}>
          <Text style={styles.oauthText}>Continue with GitHub</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 8 },
  buttons: { marginTop: 8 },
  or: { textAlign: 'center', marginVertical: 12, color: '#666' },
  oauthRow: { alignItems: 'center' },
  oauthBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6, marginBottom: 8 },
  oauthText: { color: '#333' },
});
