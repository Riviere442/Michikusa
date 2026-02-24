import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { calcBMR, calcDailyEnergy, calcDailyDeficit, calcDailyTarget } from '../utils/calorieCalc';
import DevSkipButton from '../components/DevSkipButton';
import { signOut } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';

export default function HomeScreen() {
  const { userData } = useUser();

  // 仮データ（フォールバック用に残しておく）
  // const DEV_DATA = {
  //   gender: '男性', age: 25, height: 170,
  //   weight: 70, targetWeight: 65, days: 90,
  //   activityLevel: 1.5, detourLevel: 0.5,
  // };

  // DBからのデータを使用
  const u = userData;

  const gender = u.gender;
  const age = parseFloat(u.age);
  const height = parseFloat(u.height);
  const weight = parseFloat(u.weight);
  const targetWeight = parseFloat(u.targetWeight);
  const days = parseFloat(u.days);
  const activityLevel = u.activityLevel;
  const detourLevel = u.detourLevel;

  const bmr = calcBMR(gender, weight, height, age);
  const dailyEnergy = calcDailyEnergy(bmr, activityLevel);
  const dailyDeficit = calcDailyDeficit(weight, targetWeight, days);
  const dailyTarget = calcDailyTarget(dailyEnergy, dailyDeficit, detourLevel);

  // 負債カロリー = 寄り道（運動）で消費すべき分
  const debtCalories = Math.round(dailyDeficit * detourLevel);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <DevSkipButton showMapSkip={true} />
      {/* 今日の目標 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>今日の目標摂取カロリー</Text>
        <Text style={styles.bigNumber}>{Math.round(dailyTarget)}<Text style={styles.unit}>kcal</Text></Text>
        <Text style={styles.subText}>一食あたり {Math.round(dailyTarget / 3)} kcal</Text>
      </View>

      {/* 負債カロリー */}
      <View style={[styles.card, debtCalories > 0 && styles.debtCard]}>
        <Text style={styles.cardTitle}>運動負債</Text>
        <Text style={styles.bigNumber}>{debtCalories}<Text style={styles.unit}>kcal</Text></Text>
        <Text style={styles.subText}>寄り道ウォーキングで消費しましょう</Text>
      </View>

      {/* カメラへ */}
      <TouchableOpacity style={styles.cameraButton} onPress={() => router.push('/camera')}>
        <Text style={styles.cameraButtonText}>📷 食事を記録する</Text>
      </TouchableOpacity>

      {/* ログアウト */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
        <Text style={styles.logoutButtonText}>ログアウト</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f5f5f5', gap: 16, justifyContent: 'center' },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 24, alignItems: 'center', gap: 8 },
  debtCard: { borderWidth: 2, borderColor: '#FF5722' },
  cardTitle: { fontSize: 14, color: '#888' },
  bigNumber: { fontSize: 48, fontWeight: 'bold', color: '#333' },
  unit: { fontSize: 20, fontWeight: 'normal', color: '#888' },
  subText: { fontSize: 14, color: '#888' },
  cameraButton: { backgroundColor: '#4CAF50', borderRadius: 16, padding: 20, alignItems: 'center', marginTop: 8 },
  cameraButtonText: { fontSize: 18, color: 'white', fontWeight: 'bold' },
  logoutButton: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: '#f44336', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  logoutButtonText: { fontSize: 12, color: 'white', fontWeight: 'bold' },
});