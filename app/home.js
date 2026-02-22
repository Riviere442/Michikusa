import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { calcBMR, calcDailyEnergy, calcDailyDeficit, calcDailyTarget } from '../utils/calorieCalc';

// 仮データ（後でAsyncStorageやContextに置き換える）
const USER = {
  gender: '男性', age: 25, height: 170,
  weight: 70, targetWeight: 65, days: 90,
  activityLevel: 1.5, detourLevel: 0.5,
};

export default function HomeScreen() {
  const bmr = calcBMR(USER.gender, USER.weight, USER.height, USER.age);
  const dailyEnergy = calcDailyEnergy(bmr, USER.activityLevel);
  const dailyDeficit = calcDailyDeficit(USER.weight, USER.targetWeight, USER.days);
  const dailyTarget = calcDailyTarget(dailyEnergy, dailyDeficit, USER.detourLevel);

  // 仮の負債カロリー（後で実装）
  const debtCalories = 200;

  return (
    <View style={styles.container}>

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
        <Text style={styles.subText}>強制ウォーキングが必要です</Text>
      </View>

      {/* カメラへ */}
      <TouchableOpacity style={styles.cameraButton} onPress={() => router.push('/camera')}>
        <Text style={styles.cameraButtonText}>📷 食事を記録する</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f5f5f5', gap: 16 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 24, alignItems: 'center', gap: 8 },
  debtCard: { borderWidth: 2, borderColor: '#FF5722' },
  cardTitle: { fontSize: 14, color: '#888' },
  bigNumber: { fontSize: 48, fontWeight: 'bold', color: '#333' },
  unit: { fontSize: 20, fontWeight: 'normal', color: '#888' },
  subText: { fontSize: 14, color: '#888' },
  cameraButton: { backgroundColor: '#4CAF50', borderRadius: 16, padding: 20, alignItems: 'center', marginTop: 8 },
  cameraButtonText: { fontSize: 18, color: 'white', fontWeight: 'bold' },
});