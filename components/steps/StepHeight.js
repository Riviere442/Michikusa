import { View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native';
import { stepStyles as styles } from '../../constants/styles';

export default function StepHeight({ value, onChange, onNext, onBack }) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={styles.container}>
      <Text style={styles.title}>身長を入力してください</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={value}
          onChangeText={onChange}
          placeholder="例：170"
        />
        <Text style={styles.unit}>cm</Text>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity onPress={onBack}><Text>← 戻る</Text></TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, !value && styles.disabled]}
          onPress={onNext}
          disabled={!value}
        ><Text>次へ →</Text></TouchableOpacity>
      </View>
    </View>
    </TouchableWithoutFeedback>
  );
}