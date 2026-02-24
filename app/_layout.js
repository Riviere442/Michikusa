import { Slot, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { onAuthStateChange } from '../lib/supabase';

export default function RootLayout() {
  const [isLoaded, setIsLoaded] = useState(false);
  const hasNavigated = useRef(false);

  const navigate = (path) => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    setIsLoaded(true);
    setTimeout(() => router.replace(path), 0);
  };

  // 起動時は必ずログイン画面を表示
  useEffect(() => {
    navigate('/login');
  }, []);

  // 認証状態の変化を監視（ログイン成功時に質問画面へ遷移）
  useEffect(() => {
    let isActive = true;

    const sub = onAuthStateChange((event, session) => {
      console.log('[RootLayout] Auth event:', event, 'hasSession:', !!session);
      if (!isActive) return;

      if (event === 'SIGNED_IN') {
        hasNavigated.current = false;
        navigate('/');
      }
      if (event === 'SIGNED_OUT') {
        hasNavigated.current = false;
        navigate('/login');
      }
    });

    return () => {
      isActive = false;
      sub?.unsubscribe?.();
    };
  }, []);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Slot />
    </View>
  );
}
