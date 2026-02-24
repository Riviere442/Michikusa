import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DETOUR_WEIGHT } from '../../constants/mets';
import { stepStyles as styles } from '../../constants/styles';

const OPTIONS = [
  { label: '普通に寄り道する', value: DETOUR_WEIGHT.normal },
  { label: 'もっと寄り道する', value: DETOUR_WEIGHT.more },
  { label: 'もっともっと寄り道する', value: DETOUR_WEIGHT.most },
];

export default function StepDetourLevel({ value, onSelect, onNext, onBack }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>寄り道の程度を選んでください</Text>
      {OPTIONS.map(opt => (
        <TouchableOpacity
          key={opt.label}
          style={[styles.option, value === opt.value && styles.selected]}
          onPress={() => onSelect(opt.value)}
        >
          <Text>{opt.label}</Text>
        </TouchableOpacity>
      ))}
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