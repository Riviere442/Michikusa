import { Platform } from 'react-native';
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

// --- Authentication helpers ---
export async function signUp(email: string, password: string) {
  return await supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
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

// --- Profile helpers ---
export async function saveProfile(profileData: {
  gender: string | null;
  age: string;
  height: string;
  weight: string;
  targetWeight: string;
  days: string;
  activityLevel: number | null;
  detourLevel: number | null;
}) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: userError || new Error('ユーザーが見つかりません') };
  }

  const row = {
    id: user.id,
    gender: profileData.gender,
    age: profileData.age ? parseInt(profileData.age, 10) : null,
    height: profileData.height ? parseFloat(profileData.height) : null,
    weight: profileData.weight ? parseFloat(profileData.weight) : null,
    target_weight: profileData.targetWeight ? parseFloat(profileData.targetWeight) : null,
    days: profileData.days ? parseInt(profileData.days, 10) : null,
    activity_level: profileData.activityLevel,
    detour_level: profileData.detourLevel,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(row, { onConflict: 'id' });

  return { data, error };
}

export async function loadProfile() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { profile: null, error: userError || new Error('ユーザーが見つかりません') };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !data) {
    return { profile: null, error };
  }

  return {
    profile: {
      gender: data.gender,
      age: data.age?.toString() ?? '',
      height: data.height?.toString() ?? '',
      weight: data.weight?.toString() ?? '',
      targetWeight: data.target_weight?.toString() ?? '',
      days: data.days?.toString() ?? '',
      activityLevel: data.activity_level,
      detourLevel: data.detour_level,
    },
    error: null,
  };
}