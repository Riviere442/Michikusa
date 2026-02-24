import { View, TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';

const DEV_MODE = true;

// 175cm, 67.4kg の標準的な男性、1か月で体重の約3~5%ダイエット（約2~3.4kg）
export const DEV_DATA = {
  gender: '男性',
  age: '25',
  height: '175',
  weight: '67.4',
  targetWeight: '64.4',   // 約3kg減 ≒ 4.5%
  days: '30',
  activityLevel: 1.5,
  detourLevel: 0.5,
};

export default function DevSkipButton({ onSkip, showMapSkip = false }) {
  if (!DEV_MODE) return null;

  return (
    <View style={{ position: 'absolute', top: 60, right: 16, zIndex: 100, gap: 8 }}>
      {onSkip && (
        <TouchableOpacity
          onPress={() => onSkip(DEV_DATA)}
          style={styles.button}
        >
          <Text style={styles.text}>DEV SKIP</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = {
  button: { backgroundColor: '#FF5722', padding: 8, borderRadius: 8 },
  text: { color: 'white', fontSize: 12 },
};