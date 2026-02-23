import { Slot, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import { onAuthStateChange, supabase } from '../lib/supabase';

export default function RootLayout() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    // OAuth リダイレクト後、ディープリンクをキャッチしてセッションを確認
    const handleDeepLink = async (url) => {
      console.log('[RootLayout] Deep link received:', url);
      
      // OAuth コールバック URL をチェック
      if (url.includes('auth/callback') || url.includes('#access_token')) {
        console.log('[RootLayout] OAuth callback detected');
        // 少し待ってからセッションを確認
        setTimeout(async () => {
          const { data } = await supabase.auth.getSession();
          console.log('[RootLayout] After OAuth - Session check:', !!data.session);
          if (data.session) {
            console.log('[RootLayout] Session established, navigating to home');
            router.replace('/home');
          }
        }, 500);
      }
    };

    // 初期 URL
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    // リアルタイム URL リスナー
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription.remove();
  }, [router]);

  useEffect(() => {
    // 認証状態の監視
    const subscription = onAuthStateChange((event, session) => {
      console.log('[RootLayout] Auth event:', event, 'hasSession:', !!session);
      
      if (event === 'INITIAL_SESSION') {
        setIsLoaded(true);
        if (session) {
          setIsSignedIn(true);
          router.replace('/home');
        }
      }

      if (event === 'SIGNED_IN') {
        console.log('[RootLayout] SIGNED_IN, navigating to home');
        setIsSignedIn(true);
        router.replace('/home');
      }

      if (event === 'SIGNED_OUT') {
        console.log('[RootLayout] SIGNED_OUT, navigating to login');
        setIsSignedIn(false);
        router.replace('/login');
      }
    });

    return () => subscription?.unsubscribe?.();
  }, [router]);

  // 初期ロード中はスプラッシュを表示
  if (!isLoaded) {
    return null;
  }

  return <Slot />;
}
