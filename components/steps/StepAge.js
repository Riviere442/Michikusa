import { View, Text, TouchableOpacity } from 'react-native';
import { stepStyles as styles } from '../../constants/styles';
import ScrollPicker from '../ScrollPicker';

const AGE_OPTIONS = Array.from({ length: 83 }, (_, i) => String(i + 10)); // 10〜92歳

export default function StepAge({ value, onChange, onNext, onBack }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>年齢を選択してください</Text>

      <ScrollPicker
        items={AGE_OPTIONS}
        selectedValue={value || '25'}
        onValueChange={(v) => onChange(v)}
        unit="歳"
      />

      <View style={styles.buttons}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← 戻る</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, !value && styles.disabled]}
          onPress={onNext}
          disabled={!value}
        >
          <Text style={styles.nextButtonText}>次へ →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
