import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function StepAge({ value, onChange, onNext, onBack }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>年齢を入力してください</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={value}
        onChangeText={onChange}
        placeholder="例：25"
      />

      <View style={styles.button}>
        <TouchableOpacity onPress={onBack} style={{ marginLeft:10, marginTop:32 }}>
          <Text>← 戻る</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, !value && styles.disabled]}
          onPress={onNext}
          disabled={!value}
        >
          <Text>次へ →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  title: { fontSize: 20, marginBottom: 24 },
  option: { padding: 16, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, width: 200, alignItems: 'center' },
  selected: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  nextButton: { marginTop: 32, padding: 16, backgroundColor: '#4CAF50', borderRadius: 8 },
  disabled: { backgroundColor: '#ccc' }
});