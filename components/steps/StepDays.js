import { View, Text, TouchableOpacity } from 'react-native';
import { stepStyles as styles } from '../../constants/styles';
import ScrollPicker from '../ScrollPicker';

const DAYS_OPTIONS = ['7', '14', '21', '30', '45', '60', '90', '120', '150', '180', '270', '365'];

export default function StepDays({ value, onChange, onNext, onBack }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ダイエット達成までの日数</Text>

      <ScrollPicker
        items={DAYS_OPTIONS}
        selectedValue={value || '90'}
        onValueChange={(v) => onChange(v)}
        unit="日"
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