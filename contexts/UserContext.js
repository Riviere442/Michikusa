import { createContext, useContext, useState, useEffect } from 'react';
import { loadProfile } from '../lib/supabase';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userData, setUserData] = useState({
    gender: null,
    age: '',
    height: '',
    weight: '',
    targetWeight: '',
    days: '',
    activityLevel: null,
    detourLevel: null,
  });

  // アプリ起動時にDBからプロフィールを読み込む
  useEffect(() => {
    (async () => {
      const { profile, error } = await loadProfile();
      if (profile && !error) {
        setUserData(profile);
      }
    })();
  }, []);

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}