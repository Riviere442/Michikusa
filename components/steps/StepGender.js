import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const OPTIONS = ['男性', '女性', '回答しない'];

export default function StepGender({ value, onSelect, onNext }) {
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

      <TouchableOpacity
        style={[styles.nextButton, !value && styles.disabled]}
        onPress={onNext}
        disabled={!value}
      >
        <Text>次へ →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  title: { fontSize: 20, marginBottom: 24 },
  option: { padding: 16, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, width: 200, alignItems: 'center' },
  selected: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  nextButton: { marginTop: 32, padding: 16, backgroundColor: '#4CAF50', borderRadius: 8 },
  disabled: { backgroundColor: '#ccc' },
});