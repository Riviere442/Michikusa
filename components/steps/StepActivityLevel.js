import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ACTIVITY_LEVEL } from '../../constants/mets';
import { stepStyles as styles } from '../../constants/styles';

const OPTIONS = [
  { label: '普通', desc: 'デスクワーク中心', value: ACTIVITY_LEVEL.normal },
  { label: 'やや活動的', desc: '週数回の運動', value: ACTIVITY_LEVEL.active },
  { label: '活動的', desc: '毎日運動する', value: ACTIVITY_LEVEL.veryActive },
];

export default function StepActivityLevel({ value, onSelect, onNext, onBack }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>活動レベルを選択してください</Text>
      {OPTIONS.map(opt => (
        <TouchableOpacity
          key={opt.label}
          style={[styles.option, value === opt.value && styles.selected]}
          onPress={() => onSelect(opt.value)}
        >
          <Text style={styles.optionLabel}>{opt.label}</Text>
          <Text style={styles.optionDesc}>{opt.desc}</Text>
        </TouchableOpacity>
      ))}
      <View style={styles.buttons}>
        <TouchableOpacity onPress={onBack}><Text>← 戻る</Text></TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, !value && styles.disabled]}
          onPress={onNext}
          disabled={!value}
        ><Text>次へ →</Text></TouchableOpacity>
      </View>
    </View>
  );
}