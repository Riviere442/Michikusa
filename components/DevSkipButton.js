import { View, TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';

const DEV_MODE = true;

const DEV_DATA = {
  gender: '男性',
  age: '25',
  height: '170',
  weight: '70',
  targetWeight: '65',
  days: '90',
  activityLevel: 1.5,
  detourLevel: 0.5,
};

export default function DevSkipButton({ onSkip, showMapSkip = false }) {
  if (!DEV_MODE) return null;

  return (
    <View style={{ position: 'absolute', top: 60, right: 16, gap: 8 }}>
      {onSkip && (
        <TouchableOpacity
          onPress={() => onSkip(DEV_DATA)}
          style={styles.button}
        >
          <Text style={styles.text}>DEV SKIP</Text>
        </TouchableOpacity>
      )}
      {showMapSkip && (
        <TouchableOpacity
          onPress={() => router.push('/map')}
          style={[styles.button, { backgroundColor: '#9C27B0' }]}
        >
          <Text style={styles.text}>→ MAP</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = {
  button: { backgroundColor: '#FF5722', padding: 8, borderRadius: 8 },
  text: { color: 'white', fontSize: 12 },
};