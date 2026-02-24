import { View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native';
import { stepStyles as styles } from '../../constants/styles';

export default function StepAge({ value, onChange, onNext, onBack }) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={styles.container}>
      <Text style={styles.title}>年齢を入力してください</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={value}
        onChangeText={onChange}
        placeholder="例：25"
      />

      <View style={[styles.button, {gap:32}]}>
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
    </TouchableWithoutFeedback>
  );
}
