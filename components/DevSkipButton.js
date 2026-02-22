import { TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';

const DEV_MODE = true; // リリース時にfalseにする

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

export const DEV_MODE_FLAG = DEV_MODE;

export default function DevSkipButton({ onSkip }) {
  if (!DEV_MODE) return null;

  return (
    <TouchableOpacity
      onPress={() => onSkip(DEV_DATA)}
      style={{ position: 'absolute', top: 60, right: 16, backgroundColor: '#FF5722', padding: 8, borderRadius: 8 }}
    >
      <Text style={{ color: 'white', fontSize: 12 }}>DEV SKIP</Text>
    </TouchableOpacity>
  );
}