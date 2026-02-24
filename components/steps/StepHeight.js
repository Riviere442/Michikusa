import { View, Text, TouchableOpacity } from 'react-native';
import { stepStyles as styles } from '../../constants/styles';
import ScrollPicker from '../ScrollPicker';

const HEIGHT_OPTIONS = Array.from({ length: 61 }, (_, i) => String(i + 130)); // 130〜190cm

export default function StepHeight({ value, onChange, onNext, onBack }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>身長を選択してください</Text>

      <ScrollPicker
        items={HEIGHT_OPTIONS}
        selectedValue={value || '165'}
        onValueChange={(v) => onChange(v)}
        unit="cm"
      />

      <View style={styles.buttons}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}><Text style={styles.backButtonText}>← 戻る</Text></TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, !value && styles.disabled]}
          onPress={onNext}
          disabled={!value}
        ><Text style={styles.nextButtonText}>次へ →</Text></TouchableOpacity>
      </View>
    </View>
  );
}