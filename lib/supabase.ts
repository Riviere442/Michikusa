import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Supabaseの管理画面から取得した値を入れます
const supabaseUrl = 'https://buryllhtjbgpeqemeody.supabase.co';
const supabaseAnonKey = 'sb_publishable_gdPyvZ8JO7Yh2xiEizzMPw__dpCVmXA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,  // OAuth リダイレクト時にセッション自動検出
  },
});

// --- Authentication helpers ---
export async function signUp(email: string, password: string) {
  return await supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signInWithOAuth(
  provider: 'google' | 'facebook' | 'github' | 'azure',
  redirectTo?: string
) {
  const options: any = { provider };
  if (redirectTo) {
    options.redirectTo = redirectTo;
  }
  return await supabase.auth.signInWithOAuth(options);
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return { user: null, error };
  return { user: data.user, error: null };
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return subscription;
}