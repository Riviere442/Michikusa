import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const totalDistance = parseFloat(params.totalDistance) || 0;
  const burnedCalories = parseInt(params.burnedCalories, 10) || 0;
  const destName = params.destName || '';
  const waypointName = params.waypointName || '';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 お疲れさまでした！</Text>

      {destName !== '' && (
        <Text style={styles.dest}>目的地：{destName}</Text>
      )}
      {waypointName !== '' && (
        <Text style={styles.waypoint}>経由地：{waypointName}</Text>
      )}

      <View style={styles.card}>
        <Text style={styles.label}>総移動距離</Text>
        <Text style={styles.bigNumber}>
          {(totalDistance / 1000).toFixed(2)}
          <Text style={styles.unit}> km</Text>
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>消費カロリー</Text>
        <Text style={[styles.bigNumber, { color: '#FF5722' }]}>
          {burnedCalories}
          <Text style={styles.unit}> kcal</Text>
        </Text>
      </View>

      <View style={styles.messageBox}>
        <Text style={styles.message}>
          {burnedCalories >= 200
            ? '素晴らしい運動量です！この調子で続けましょう 💪'
            : burnedCalories >= 100
            ? 'いい感じです！少しずつ距離を伸ばしていきましょう 🚶'
            : 'まずは一歩踏み出したことが大切です 🌱'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.replace('/home')}
      >
        <Text style={styles.homeButtonText}>🏠 ホームに戻る</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#f5f5f5',
    justifyContent: 'center', alignItems: 'center',
    padding: 24, gap: 16,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  dest: { fontSize: 16, color: '#333' },
  waypoint: { fontSize: 14, color: '#FF9800' },
  card: {
    backgroundColor: 'white', borderRadius: 16,
    padding: 24, width: '100%', alignItems: 'center', gap: 4,
  },
  label: { fontSize: 14, color: '#888' },
  bigNumber: { fontSize: 48, fontWeight: 'bold', color: '#4CAF50' },
  unit: { fontSize: 20, fontWeight: 'normal', color: '#888' },
  messageBox: {
    backgroundColor: '#E8F5E9', borderRadius: 12,
    padding: 16, width: '100%', alignItems: 'center',
  },
  message: { fontSize: 15, color: '#333', textAlign: 'center', lineHeight: 24 },
  homeButton: {
    backgroundColor: '#4CAF50', padding: 16,
    borderRadius: 12, width: 240, alignItems: 'center', marginTop: 8,
  },
  homeButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});