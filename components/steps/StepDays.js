import { View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native';
import { stepStyles as styles } from '../../constants/styles';

export default function StepDays({ value, onChange, onNext, onBack }) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={styles.container}>
      <Text style={styles.title}>ダイエット達成までの日数</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={value}
          onChangeText={onChange}
          placeholder="例：90"
        />
        <Text style={styles.unit}>日</Text>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}><Text style={styles.backButtonText}>← 戻る</Text></TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, !value && styles.disabled]}
          onPress={onNext}
          disabled={!value}
        ><Text style={styles.nextButtonText}>次へ →</Text></TouchableOpacity>
      </View>
    </View>
    </TouchableWithoutFeedback>
  );
}