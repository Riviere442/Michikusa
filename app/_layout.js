import { Slot, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as Linking from 'expo-linking';
import { onAuthStateChange, supabase } from '../lib/supabase';

export default function RootLayout() {
  const [isLoaded, setIsLoaded] = useState(false);
  const hasNavigated = useRef(false);

  const navigate = (path) => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    setIsLoaded(true);
    // 次のフレームで router を呼ぶ（レイアウト描画後）
    setTimeout(() => router.replace(path), 0);
  };

  // ディープリンク処理
  useEffect(() => {
    const handleDeepLink = async (url) => {
      console.log('[RootLayout] Deep link received:', url);
      if (url.includes('auth/callback') || url.includes('#access_token')) {
        console.log('[RootLayout] OAuth callback detected');
        setTimeout(async () => {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            hasNavigated.current = false; // OAuth後は再ナビゲート許可
            navigate('/home');
          }
        }, 500);
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    const sub = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
    return () => sub.remove();
  }, []);

  // 認証セッション確認（onAuthStateChange の INITIAL_SESSION のみで判定）
  useEffect(() => {
    let isActive = true;

    // onAuthStateChange で一元管理
    const sub = onAuthStateChange((event, session) => {
      console.log('[RootLayout] Auth event:', event, 'hasSession:', !!session);
      if (!isActive) return;

      if (event === 'INITIAL_SESSION') {
        if (session) navigate('/home');
        else navigate('/login');
      }
      if (event === 'SIGNED_IN') {
        hasNavigated.current = false;
        navigate('/home');
      }
      if (event === 'SIGNED_OUT') {
        hasNavigated.current = false;
        navigate('/login');
      }
    });

    // 5秒経っても何も起きなければ login へ（フォールバック）
    const timeout = setTimeout(() => {
      if (!isActive) return;
      console.log('[RootLayout] Timeout fallback → login');
      navigate('/login');
    }, 5000);

    return () => {
      isActive = false;
      clearTimeout(timeout);
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

  return <Slot />;
}
