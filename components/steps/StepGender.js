import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { stepStyles as styles } from '../../constants/styles';

const OPTIONS = ['男性', '女性', '回答しない'];

export default function StepGender({ value, onSelect, onNext, onBack }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>性別を選択してください</Text>

      {OPTIONS.map(option => (
        <TouchableOpacity
          key={option}
          style={[styles.option, value === option && styles.selected]}
          onPress={() => onSelect(option)}
        >
          <Text>{option}</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.buttons}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← 戻る</Text>
          </TouchableOpacity>
        )}
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