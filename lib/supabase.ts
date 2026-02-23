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
    detectSessionInUrl: false,
  },
});