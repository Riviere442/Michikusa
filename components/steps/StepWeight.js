import { View, Text, TouchableOpacity } from 'react-native';
import { stepStyles as styles } from '../../constants/styles';
import ScrollPicker from '../ScrollPicker';

const WEIGHT_OPTIONS = Array.from({ length: 121 }, (_, i) => String(i + 30)); // 30〜150kg

export default function StepWeight({ weight, targetWeight, onChangeWeight, onChangeTarget, onNext, onBack }) {
  const isValid = weight && targetWeight;
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { marginTop: 30 }]}>体重を選択してください</Text>

      <Text style={styles.label}>現在の体重</Text>
      <ScrollPicker
        items={WEIGHT_OPTIONS}
        selectedValue={weight || '65'}
        onValueChange={(v) => onChangeWeight(v)}
        unit="kg"
      />

      <Text style={styles.label}>理想の体重</Text>
      <ScrollPicker
        items={WEIGHT_OPTIONS}
        selectedValue={targetWeight || '60'}
        onValueChange={(v) => onChangeTarget(v)}
        unit="kg"
      />

      <View style={styles.buttons}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}><Text style={styles.backButtonText}>← 戻る</Text></TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, !isValid && styles.disabled]}
          onPress={onNext}
          disabled={!isValid}
        ><Text style={styles.nextButtonText}>次へ →</Text></TouchableOpacity>
      </View>
    </View>
  );
}